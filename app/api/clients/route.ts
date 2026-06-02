import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import type { ClientPackage, ClientStatus } from '@/types/database';

const packageOptions = ['basic', 'standard', 'premium'] as const;
const statusOptions = ['active', 'inactive', 'trial'] as const;

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePackage(value: unknown): ClientPackage {
  return typeof value === 'string' && packageOptions.includes(value as ClientPackage)
    ? (value as ClientPackage)
    : 'basic';
}

function normalizeStatus(value: unknown): ClientStatus {
  return typeof value === 'string' && statusOptions.includes(value as ClientStatus)
    ? (value as ClientStatus)
    : 'trial';
}

function clientPayload(body: Record<string, unknown>) {
  return {
    name: normalizeText(body.name),
    business_name: normalizeText(body.business_name),
    business_type: normalizeText(body.business_type),
    email: normalizeText(body.email),
    phone: normalizeText(body.phone),
    instagram_handle: normalizeText(body.instagram_handle),
    package: normalizePackage(body.package),
    status: normalizeStatus(body.status),
    notes: normalizeText(body.notes),
  };
}

export async function GET() {
  try {
    const { data, error } = await createServerSupabase()
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Client fetch failed', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    return NextResponse.json({ clients: data || [] });
  } catch (error) {
    console.error('Client GET failed', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = clientPayload(body);

    if (!payload.name || !payload.business_type) {
      return NextResponse.json({ error: 'Name and business type are required' }, { status: 400 });
    }

    const { data, error } = await createServerSupabase()
      .from('clients')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Client insert failed', error);
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }

    return NextResponse.json({ client: data });
  } catch (error) {
    console.error('Client POST failed', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = normalizeText(body.id);

    if (!id) {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 });
    }

    const { data, error } = await createServerSupabase()
      .from('clients')
      .update(clientPayload(body))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Client update failed', error);
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }

    return NextResponse.json({ client: data });
  } catch (error) {
    console.error('Client PATCH failed', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = normalizeText(body.id);

    if (!id) {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 });
    }

    const { error } = await createServerSupabase().from('clients').delete().eq('id', id);

    if (error) {
      console.error('Client delete failed', error);
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client DELETE failed', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
