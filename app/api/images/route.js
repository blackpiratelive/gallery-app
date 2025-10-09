import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';
import { checkAuth, unauthorized } from '@/lib/auth';
import { generateId } from '@/lib/utils';

async function albumPasswordHash(albumId) {
  if (!albumId) return null;
  const r = await turso.execute({ sql: 'SELECT password_hash FROM albums WHERE id = ?', args: [albumId] });
  return r.rows[0]?.password_hash || null;
}

export async function POST(req) {
  if (!checkAuth(req)) return unauthorized();
  try {
    const body = await req.json();
    const id = generateId();
    const pwd = await albumPasswordHash(body.album_id);
    const override_public = body.override_public ? 1 : 0;
    const is_private = override_public ? 0 : (pwd ? 1 : (body.is_private ? 1 : 0));
    // Expect object_key/thumb_key from the uploader (private/ or public/ prefix)
    await turso.execute({
      sql: `
        INSERT INTO images
        (id, title, description, full_url, thumbnail_url, album_id, featured, tags, exif_data,
         is_private, override_public, object_key, thumb_key)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        body.title,
        body.description || null,
        body.full_url || null,        // legacy, keep if you still store
        body.thumbnail_url || null,   // legacy
        body.album_id || null,
        body.featured ? 1 : 0,
        body.tags || null,
        body.exif_data || null,
        is_private,
        override_public,
        body.object_key,
        body.thumb_key,
      ],
    });
    return NextResponse.json({ id, success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!checkAuth(req)) return unauthorized();
  try {
    const body = await req.json();
    const pwd = await albumPasswordHash(body.album_id);
    const override_public = body.override_public ? 1 : 0;
    const is_private = override_public ? 0 : (pwd ? 1 : (body.is_private ? 1 : 0));

    await turso.execute({
      sql: `
        UPDATE images
        SET title = ?, description = ?, album_id = ?, featured = ?, tags = ?,
            is_private = ?, override_public = ?
        WHERE id = ?
      `,
      args: [
        body.title,
        body.description || null,
        body.album_id || null,
        body.featured ? 1 : 0,
        body.tags || null,
        is_private,
        override_public,
        body.id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}