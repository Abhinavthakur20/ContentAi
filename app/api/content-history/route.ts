import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get('page') || '1'), 1);
    const limit = 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await createServerSupabase()
      .from('generated_content')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Content history fetch failed', error);
      return NextResponse.json({ error: 'Failed to fetch content history' }, { status: 500 });
    }

    const total = count || 0;
    return NextResponse.json({
      content: data || [],
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error('Content history GET failed', error);
    return NextResponse.json({ error: 'Failed to fetch content history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = normalizeText(body.id);

    if (!id) {
      return NextResponse.json({ error: 'Record id is required' }, { status: 400 });
    }

    const { error } = await createServerSupabase().from('generated_content').delete().eq('id', id);

    if (error) {
      console.error('Content history delete failed', error);
      return NextResponse.json({ error: 'Failed to delete content record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Content history DELETE failed', error);
    return NextResponse.json({ error: 'Failed to delete content record' }, { status: 500 });
  }
}
