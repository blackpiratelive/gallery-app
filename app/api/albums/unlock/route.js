import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';
import { verifyPassword } from '@/lib/crypto';

export async function POST(req) {
  try {
    const body = await req.json();
    const { albumId, password } = body || {};
    if (!albumId || !password) {
      return NextResponse.json({ error: 'Missing albumId or password' }, { status: 400 });
    }

    const res = await turso.execute({
      sql: 'SELECT id, password_hash FROM albums WHERE id = ?',
      args: [albumId],
    });
    const album = res.rows[0];
    if (!album || !album.password_hash) {
      return NextResponse.json({ error: 'Album not protected or not found' }, { status: 404 });
    }

    const ok = await verifyPassword(password, album.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    cookies().set(`album_${albumId}`, 'ok', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12h
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}