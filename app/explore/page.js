import { turso } from '@/lib/db';
import TikTokViewer from '@/components/TikTokViewer';

async function getAllImages() {
  try {
    const result = await turso.execute('SELECT * FROM images ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    return [];
  }
}

export default async function ExplorePage() {
  const images = await getAllImages();

  return <TikTokViewer images={images} />;
}