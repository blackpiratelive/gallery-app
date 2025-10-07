import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { put } from '@vercel/blob';
import { checkAuth, unauthorized } from '@/lib/auth';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function GET(request) {
  if (!checkAuth(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const filename = searchParams.get('filename');

  if (type === 'r2') {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filename,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;

      return NextResponse.json({ url, publicUrl });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(request) {
  if (!checkAuth(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'blob') {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      
      const blob = await put(file.name, file, {
        access: 'public',
      });

      return NextResponse.json({ url: blob.url });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}