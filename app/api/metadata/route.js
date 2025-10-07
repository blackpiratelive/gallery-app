import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';
import { checkAuth, unauthorized } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function POST(request) {
  if (!checkAuth(request)) return unauthorized();

  try {
    const body = await request.json();
    const id = generateId();

    await turso.execute({
      sql: `INSERT INTO images 
            (id, title, description, full_url, thumbnail_url, album_id, featured, tags, exif_data) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.title,
        body.description || null,
        body.full_url,
        body.thumbnail_url,
        body.album_id || null,
        body.featured ? 1 : 0,
        body.tags || null,
        body.exif_data || null,
      ],
    });

    return NextResponse.json({ id, ...body });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!checkAuth(request)) return unauthorized();

  try {
    const body = await request.json();

    await turso.execute({
      sql: `UPDATE images 
            SET title = ?, description = ?, album_id = ?, featured = ?, tags = ?
            WHERE id = ?`,
      args: [
        body.title,
        body.description || null,
        body.album_id || null,
        body.featured ? 1 : 0,
        body.tags || null,
        body.id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}