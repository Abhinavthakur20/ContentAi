import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import type { BookingStatus } from '@/types/database';

const bookingStatuses = ['pending', 'confirmed', 'cancelled'] as const;

function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && bookingStatuses.includes(value as BookingStatus);
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
    const booking = {
      name: normalizeText(body.name),
      email: normalizeText(body.email),
      phone: normalizeText(body.phone)?.replace(/\D/g, '') || null,
      business_type: normalizeText(body.business_type),
      service: normalizeText(body.service),
      preferred_date: normalizeText(body.preferred_date),
      preferred_time: normalizeText(body.preferred_time),
      message: normalizeText(body.message),
      status: 'pending' as BookingStatus,
    };

    if (
      !booking.name ||
      !booking.email ||
      !booking.phone ||
      !booking.business_type ||
      !booking.service ||
      !booking.preferred_date ||
      !booking.preferred_time
    ) {
      return NextResponse.json({ error: 'All fields except message are required' }, { status: 400 });
    }

    const { data, error } = await createServerSupabase()
      .from('bookings')
      .insert(booking)
      .select('id')
      .single();

    if (error) {
      console.error('Booking insert failed', error);
      return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
    }

    sendWebhook('new_booking', { id: data.id, ...booking });

    return NextResponse.json({ message: 'Booking submitted successfully', id: data.id });
  } catch (error) {
    console.error('Booking POST failed', error);
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await createServerSupabase()
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Booking fetch failed', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error) {
    console.error('Booking GET failed', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = normalizeText(body.id);

    if (!id || !isBookingStatus(body.status)) {
      return NextResponse.json({ error: 'Valid id and status are required' }, { status: 400 });
    }

    const { data, error } = await createServerSupabase()
      .from('bookings')
      .update({ status: body.status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Booking update failed', error);
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error('Booking PATCH failed', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
