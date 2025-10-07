import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const album = searchParams.get('album');
  const limit = searchParams.get('limit') || '50';

  try {
    if (id) {
      const result = await turso.execute({
        sql: 'SELECT * FROM images WHERE id = ?',
        args: [id],
      });
      return NextResponse.json(result.rows[0] || null);
    }

    if (album) {
      const result = await turso.execute({
        sql: 'SELECT * FROM images WHERE album_id = ? ORDER BY created_at DESC',
        args: [album],
      });
      return NextResponse.json(result.rows);
    }

    if (type === 'featured') {
      const result = await turso.execute({
        sql: 'SELECT * FROM images WHERE featured = 1 ORDER BY created_at DESC LIMIT ?',
        args: [parseInt(limit)],
      });
      return NextResponse.json(result.rows);
    }

    if (type === 'recent') {
      const result = await turso.execute({
        sql: 'SELECT * FROM images ORDER BY created_at DESC LIMIT ?',
        args: [parseInt(limit)],
      });
      return NextResponse.json(result.rows);
    }

    const result = await turso.execute('SELECT * FROM images ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}