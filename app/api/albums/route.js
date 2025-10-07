import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';
import { checkAuth, unauthorized } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const result = await turso.execute({
        sql: 'SELECT * FROM albums WHERE id = ?',
        args: [id],
      });
      return NextResponse.json(result.rows[0] || null);
    }

    const result = await turso.execute('SELECT * FROM albums ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) return unauthorized();

  try {
    const body = await request.json();
    const id = generateId();

    await turso.execute({
      sql: 'INSERT INTO albums (id, name, description) VALUES (?, ?, ?)',
      args: [id, body.name, body.description || null],
    });

    return NextResponse.json({ id, ...body });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!checkAuth(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    await turso.execute({
      sql: 'DELETE FROM albums WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}