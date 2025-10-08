import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';
import { checkAuth, unauthorized } from '@/lib/auth';
import { generateId } from '@/lib/utils';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    // Check auth
    if (!checkAuth(request)) {
      console.error('Auth check failed');
      return unauthorized();
    }

    // Parse body
    const body = await request.json();
    console.log('Received metadata:', body);

    // Validate required fields
    if (!body.title || !body.full_url || !body.thumbnail_url) {
      console.error('Missing required fields:', body);
      return NextResponse.json(
        { error: 'Missing required fields: title, full_url, thumbnail_url' },
        { status: 400, headers: corsHeaders }
      );
    }

    const id = generateId();
    console.log('Generated ID:', id);

    // Insert into database
    const result = await turso.execute({
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

    console.log('Database insert result:', result);

    return NextResponse.json({ id, success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Metadata save error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request) {
  try {
    if (!checkAuth(request)) return unauthorized();

    const body = await request.json();
    console.log('Updating metadata for ID:', body.id);

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

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Metadata update error:', error);
    
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}