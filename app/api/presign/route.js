import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { turso } from '@/lib/db';
import { presignGet } from '@/lib/r2';
import { isImagePrivate } from '@/lib/access';
import { checkAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');
    const type = searchParams.get('type') || 'thumb'; // 'thumb' | 'full'

    if (!imageId) {
      return NextResponse.json({ error: 'imageId required' }, { status: 400 });
    }

    const res = await turso.execute({
      sql: `
        SELECT i.id, i.album_id, i.object_key, i.thumb_key, i.is_private, i.override_public,
               a.password_hash
        FROM images i
        LEFT JOIN albums a ON a.id = i.album_id
        WHERE i.id = ?
      `,
      args: [imageId],
    });
    const row = res.rows[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const albumProtected = !!row.password_hash;
    const privateImage = isImagePrivate(row, { password_hash: row.password_hash });

    if (privateImage) {
      const admin = checkAuth(req);
      const albumCookie = cookies().get(`album_${row.album_id}`)?.value === 'ok';
      if (!admin && !(albumProtected && albumCookie)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const key = type === 'full' ? row.object_key : row.thumb_key;
    if (!key) return NextResponse.json({ error: 'Missing object key' }, { status: 500 });

    const url = await presignGet(key, 60);
    return NextResponse.json({ url, expiresIn: 60 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}