import { createClient } from '@libsql/client';

let tursoClient = null;

export const turso = (() => {
  if (!tursoClient) {
    tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return tursoClient;
})();

// Auto-initialize tables on first import
export async function initDB() {
  try {
    console.log('Initializing database tables...');
    
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        cover_image_id TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        full_url TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        album_id TEXT,
        featured INTEGER DEFAULT 0,
        tags TEXT,
        exif_data TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
      )
    `);

    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_images_album ON images(album_id)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC)`);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('DB initialization error:', error);
  }
}

// Call init on import
initDB();