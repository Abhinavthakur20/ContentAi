'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import type {
  BookingRow,
  BookingStatus,
  ClientRow,
  ContentVariation,
  GeneratedContentRow,
  LeadRow,
  LeadStatus,
} from '@/types/database';

type TabKey = 'history' | 'leads' | 'bookings' | 'clients';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'history', label: 'Content History' },
  { key: 'leads', label: 'Leads' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'clients', label: 'Clients' },
];

const leadStatuses: Array<'all' | LeadStatus> = ['all', 'new', 'contacted', 'converted', 'lost'];
const clientPackages = ['basic', 'standard', 'premium'];
const clientStatuses = ['active', 'inactive', 'trial'];

const initialClientForm = {
  name: '',
  business_name: '',
  business_type: '',
  email: '',
  phone: '',
  instagram_handle: '',
  package: 'basic',
  status: 'trial',
  notes: '',
};

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('leads');
  const [history, setHistory] = useState<GeneratedContentRow[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [expandedHistoryId, setExpandedHistoryId] = useState('');
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [leadFilter, setLeadFilter] = useState<'all' | LeadStatus>('all');
  const [leadStats, setLeadStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0 });
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState(initialClientForm);
  const [error, setError] = useState('');

  const fetchHistory = async (page = historyPage) => {
    setError('');
    const response = await fetch(`/api/content-history?page=${page}`);
    const data = (await response.json()) as {
      content?: GeneratedContentRow[];
      totalPages?: number;
      error?: string;
    };
    if (!response.ok) throw new Error(data.error || 'Failed to fetch content history');
    setHistory(data.content || []);
    setHistoryPage(page);
    setHistoryTotalPages(data.totalPages || 1);
  };

  const fetchLeads = async (status = leadFilter) => {
    setError('');
    const response = await fetch(`/api/leads?status=${status}&page=1`);
    const data = (await response.json()) as {
      leads?: LeadRow[];
      total?: number;
      error?: string;
    };
    if (!response.ok) throw new Error(data.error || 'Failed to fetch leads');
    const nextLeads = data.leads || [];
    setLeads(nextLeads);
    setLeadStats({
      total: data.total || nextLeads.length,
      new: nextLeads.filter((lead) => lead.status === 'new').length,
      contacted: nextLeads.filter((lead) => lead.status === 'contacted').length,
      converted: nextLeads.filter((lead) => lead.status === 'converted').length,
    });
  };

  const fetchBookings = async () => {
    setError('');
    const response = await fetch('/api/bookings');
    const data = (await response.json()) as { bookings?: BookingRow[]; error?: string };
    if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
    setBookings(data.bookings || []);
  };

  const fetchClients = async () => {
    setError('');
    const response = await fetch('/api/clients');
    const data = (await response.json()) as { clients?: ClientRow[]; error?: string };
    if (!response.ok) throw new Error(data.error || 'Failed to fetch clients');
    setClients(data.clients || []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        if (activeTab === 'history') await fetchHistory(1);
        if (activeTab === 'leads') await fetchLeads(leadFilter);
        if (activeTab === 'bookings') await fetchBookings();
        if (activeTab === 'clients') await fetchClients();
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard data');
      }
    };
    void run();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'leads') return;
    void fetchLeads(leadFilter).catch((fetchError) => {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch leads');
    });
  }, [leadFilter]);

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    const response = await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) throw new Error('Failed to update lead');
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    const response = await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) throw new Error('Failed to update booking');
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
  };

  const deleteHistory = async (id: string) => {
    const response = await fetch('/api/content-history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Failed to delete content');
    await fetchHistory(historyPage);
  };

  const submitClient = async () => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientForm),
    });
    const data = (await response.json()) as { client?: ClientRow; error?: string };
    if (!response.ok) throw new Error(data.error || 'Failed to create client');
    setClientForm(initialClientForm);
    setShowClientForm(false);
    await fetchClients();
  };

  return (
    <main className="min-h-screen bg-off-white text-black">
      <Navbar />
      <section className="border-b border-black px-5 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-mid">ContentAI Control Room</div>
          <h1 className="mt-4 font-display text-[clamp(3.8rem,7vw,6.5rem)] leading-[0.92] text-black">
            DASHBOARD
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <div className="grid border border-black md:grid-cols-4">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] ${
                index < tabs.length - 1 ? 'border-b border-black md:border-b-0 md:border-r' : ''
              } ${activeTab === tab.key ? 'bg-black text-acid' : 'bg-transparent text-mid hover:bg-black hover:text-off-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-5 border border-black px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          {activeTab === 'history' ? (
            <ContentHistoryTab
              rows={history}
              expandedId={expandedHistoryId}
              page={historyPage}
              totalPages={historyTotalPages}
              onExpand={setExpandedHistoryId}
              onDelete={(id) => {
                void deleteHistory(id).catch((deleteError) => {
                  setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete content');
                });
              }}
              onPage={(page) => {
                void fetchHistory(page).catch((fetchError) => {
                  setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch content history');
                });
              }}
            />
          ) : null}

          {activeTab === 'leads' ? (
            <LeadsTab
              leads={leads}
              filter={leadFilter}
              stats={leadStats}
              onFilter={setLeadFilter}
              onStatus={(id, status) => {
                void updateLeadStatus(id, status).catch((statusError) => {
                  setError(statusError instanceof Error ? statusError.message : 'Failed to update lead');
                });
              }}
            />
          ) : null}

          {activeTab === 'bookings' ? (
            <BookingsTab
              bookings={bookings}
              onStatus={(id, status) => {
                void updateBookingStatus(id, status).catch((statusError) => {
                  setError(statusError instanceof Error ? statusError.message : 'Failed to update booking');
                });
              }}
            />
          ) : null}

          {activeTab === 'clients' ? (
            <ClientsTab
              clients={clients}
              form={clientForm}
              showForm={showClientForm}
              onToggleForm={() => setShowClientForm((current) => !current)}
              onFormChange={(field, value) => setClientForm((current) => ({ ...current, [field]: value }))}
              onSubmit={() => {
                void submitClient().catch((clientError) => {
                  setError(clientError instanceof Error ? clientError.message : 'Failed to create client');
                });
              }}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function ContentHistoryTab({
  rows,
  expandedId,
  page,
  totalPages,
  onExpand,
  onDelete,
  onPage,
}: {
  rows: GeneratedContentRow[];
  expandedId: string;
  page: number;
  totalPages: number;
  onExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onPage: (page: number) => void;
}) {
  return (
    <div className="grid gap-4">
      {rows.map((row) => {
        const expanded = expandedId === row.id;
        return (
          <article key={row.id} className="border border-black bg-off-white">
            <button
              type="button"
              onClick={() => onExpand(expanded ? '' : row.id)}
              className="grid w-full gap-3 border-b border-black bg-transparent px-4 py-4 text-left md:grid-cols-[1.1fr_1fr_0.8fr_0.8fr_0.8fr_auto]"
            >
              <Cell label="Date" value={formatDate(row.created_at)} />
              <Cell label="Business" value={row.business_type} />
              <Cell label="Platform" value={row.platform} />
              <Cell label="Tone" value={row.tone} />
              <Cell label="Status" value={row.status} />
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">
                {expanded ? 'Close' : 'Open'}
              </span>
            </button>
            {expanded ? (
              <div className="grid gap-4 p-4">
                {row.variations.map((variation: ContentVariation, index: number) => (
                  <div key={`${row.id}-${index}`} className="border border-black">
                    <div className="bg-black px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-acid">
                      Variation {index + 1}
                    </div>
                    <div className="p-3 font-body text-[0.85rem] leading-[1.65] text-black">
                      <p>{variation.caption}</p>
                      <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-mid">
                        {variation.hashtags.join(' ')}
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="w-fit border border-black bg-transparent px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-off-white"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </article>
        );
      })}

      <div className="flex items-center justify-between border border-black px-4 py-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="border border-black bg-transparent px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-off-white disabled:border-border-muted disabled:text-mid"
        >
          Previous
        </button>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-mid">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="border border-black bg-transparent px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-off-white disabled:border-border-muted disabled:text-mid"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LeadsTab({
  leads,
  filter,
  stats,
  onFilter,
  onStatus,
}: {
  leads: LeadRow[];
  filter: 'all' | LeadStatus;
  stats: { total: number; new: number; contacted: number; converted: number };
  onFilter: (status: 'all' | LeadStatus) => void;
  onStatus: (id: string, status: LeadStatus) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="grid border border-black md:grid-cols-4">
        {[
          ['Total Leads', stats.total],
          ['New', stats.new],
          ['Contacted', stats.contacted],
          ['Converted', stats.converted],
        ].map(([label, value], index) => (
          <div key={label} className={`px-4 py-5 ${index < 3 ? 'border-b border-black md:border-b-0 md:border-r' : ''}`}>
            <div className="font-display text-5xl leading-none text-black">{value}</div>
            <div className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {leadStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onFilter(status)}
            className={`border px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${
              filter === status
                ? 'border-black bg-acid text-black'
                : 'border-border-muted bg-transparent text-mid hover:border-black hover:text-black'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {leads.map((lead) => (
          <article key={lead.id} className="grid gap-3 border border-black bg-off-white px-4 py-4 md:grid-cols-[1fr_0.9fr_1fr_0.8fr_0.8fr_0.8fr_auto] md:items-center">
            <Cell label="Name" value={lead.name} />
            <Cell label="Phone" value={lead.phone} />
            <Cell label="Business" value={lead.business_type} />
            <Cell label="City" value={lead.city || '-'} />
            <label>
              <span className="mb-1 block font-mono text-[0.5rem] uppercase tracking-[0.1em] text-mid">Status</span>
              <select
                value={lead.status}
                onChange={(event) => onStatus(lead.id, event.target.value as LeadStatus)}
                className="w-full border border-black bg-transparent px-2 py-2 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-black outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
              >
                {leadStatuses.filter((status) => status !== 'all').map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <Cell label="Date" value={formatDate(lead.created_at)} />
            <a
              href={`tel:${lead.phone}`}
              className="border border-black bg-black px-3 py-2 text-center font-mono text-[0.58rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
            >
              Call
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

function BookingsTab({
  bookings,
  onStatus,
}: {
  bookings: BookingRow[];
  onStatus: (id: string, status: BookingStatus) => void;
}) {
  return (
    <div className="grid gap-3">
      {bookings.map((booking) => (
        <article key={booking.id} className="grid gap-3 border border-black bg-off-white px-4 py-4 md:grid-cols-[1fr_1fr_0.8fr_0.7fr_1fr_0.8fr_auto] md:items-center">
          <Cell label="Name" value={booking.name} />
          <Cell label="Service" value={booking.service} />
          <Cell label="Date" value={booking.preferred_date} />
          <Cell label="Time" value={booking.preferred_time} />
          <Cell label="Business" value={booking.business_type} />
          <Cell label="Status" value={booking.status} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onStatus(booking.id, 'confirmed')}
              className="border border-black bg-acid px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-acid"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => onStatus(booking.id, 'cancelled')}
              className="border border-black bg-transparent px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-off-white"
            >
              Cancel
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ClientsTab({
  clients,
  form,
  showForm,
  onToggleForm,
  onFormChange,
  onSubmit,
}: {
  clients: ClientRow[];
  form: typeof initialClientForm;
  showForm: boolean;
  onToggleForm: () => void;
  onFormChange: (field: keyof typeof initialClientForm, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="grid gap-5">
      <button
        type="button"
        onClick={onToggleForm}
        className="w-fit border border-black bg-black px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
      >
        Add Client
      </button>

      {showForm ? (
        <div className="grid gap-4 border border-black bg-[#fff7d9] p-4 md:grid-cols-2">
          {[
            ['name', 'Name'],
            ['business_name', 'Business Name'],
            ['business_type', 'Business Type'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['instagram_handle', 'Instagram Handle'],
          ].map(([field, label]) => (
            <label key={field}>
              <span className="mb-2 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">{label}</span>
              <input
                value={form[field as keyof typeof initialClientForm]}
                onChange={(event) => onFormChange(field as keyof typeof initialClientForm, event.target.value)}
                className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
              />
            </label>
          ))}
          <label>
            <span className="mb-2 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">Package</span>
            <select
              value={form.package}
              onChange={(event) => onFormChange('package', event.target.value)}
              className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
            >
              {clientPackages.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">Status</span>
            <select
              value={form.status}
              onChange={(event) => onFormChange('status', event.target.value)}
              className="w-full border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
            >
              {clientStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-mid">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => onFormChange('notes', event.target.value)}
              rows={4}
              className="w-full resize-none border border-black bg-transparent px-3 py-3 font-body text-[0.9rem] outline-none focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-acid"
            />
          </label>
          <button
            type="button"
            onClick={onSubmit}
            className="border border-black bg-black px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-off-white hover:bg-acid hover:text-black"
          >
            Save Client
          </button>
        </div>
      ) : null}

      <div className="grid gap-3">
        {clients.map((client) => (
          <article key={client.id} className="grid gap-3 border border-black bg-off-white px-4 py-4 md:grid-cols-5">
            <Cell label="Name" value={client.name} />
            <Cell label="Business" value={client.business_name || '-'} />
            <Cell label="Type" value={client.business_type} />
            <Cell label="Package" value={client.package} />
            <Cell label="Status" value={client.status} />
          </article>
        ))}
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-mid">{label}</div>
      <div className="mt-1 font-body text-[0.85rem] leading-[1.4] text-black">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
