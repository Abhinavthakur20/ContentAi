import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import type { LeadStatus } from '@/types/database';

const leadStatuses = ['new', 'contacted', 'converted', 'lost'] as const;

function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && leadStatuses.includes(value as LeadStatus);
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sendWebhook(type: string, data: unknown) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  void fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data }),
  }).catch((error) => {
    console.error('N8N webhook failed', error);
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = normalizeText(body.name);
    const phone = normalizeText(body.phone)?.replace(/\D/g, '') || null;
    const businessType = normalizeText(body.business_type);

    if (!name || !phone || !businessType) {
      return NextResponse.json({ error: 'Name, phone, and business type are required' }, { status: 400 });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Phone must be 10 digits starting with 6, 7, 8, or 9' }, { status: 400 });
    }

    const lead = {
      name,
      phone,
      email: normalizeText(body.email),
      business_type: businessType,
      business_name: normalizeText(body.business_name),
      city: normalizeText(body.city),
      service_interest: normalizeText(body.service_interest),
      message: normalizeText(body.message),
      source: 'website',
      status: 'new' as LeadStatus,
    };

    const { data, error } = await createServerSupabase()
      .from('leads')
      .insert(lead)
      .select('id')
      .single();

    if (error) {
      console.error('Lead insert failed', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    sendWebhook('new_lead', { id: data.id, ...lead });

    return NextResponse.json({ message: 'Lead submitted successfully', id: data.id });
  } catch (error) {
    console.error('Lead POST failed', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = Math.max(Number(searchParams.get('page') || '1'), 1);
    const limit = 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (status !== 'all' && !isLeadStatus(status)) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }

    let query = createServerSupabase()
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Lead fetch failed', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    const total = count || 0;
    return NextResponse.json({
      leads: data || [],
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error('Lead GET failed', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = normalizeText(body.id);

    if (!id || !isLeadStatus(body.status)) {
      return NextResponse.json({ error: 'Valid id and status are required' }, { status: 400 });
    }

    const { data, error } = await createServerSupabase()
      .from('leads')
      .update({ status: body.status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Lead update failed', error);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Lead PATCH failed', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
