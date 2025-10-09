import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import { checkAuth, unauthorized } from '@/lib/auth';

export async function POST(req) {
  if (!checkAuth(req)) return unauthorized();
  try {
    const { albumId, password } = await req.json();
    if (!albumId) return NextResponse.json({ error: 'albumId required' }, { status: 400 });
    let password_hash = null;
    if (password && password.length > 0) {
      password_hash = await hashPassword(password);
    }
    await turso.execute({
      sql: 'UPDATE albums SET password_hash = ? WHERE id = ?',
      args: [password_hash, albumId],
    });

    // Optional: auto-update images privacy for this album where override_public=0
    await turso.execute({
      sql: `
        UPDATE images
        SET is_private = CASE WHEN ? IS NULL THEN 0 ELSE 1 END
        WHERE album_id = ? AND override_public = 0
      `,
      args: [password_hash, albumId],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}