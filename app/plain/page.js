import { turso } from '@/lib/db';

async function getFeatured() {
  try {
    const r = await turso.execute('SELECT id, title, thumbnail_url FROM images WHERE featured = 1 ORDER BY created_at DESC LIMIT 8');
    return r.rows;
  } catch {
    return [];
  }
}

async function getAlbums() {
  try {
    const a = await turso.execute('SELECT id, name, description FROM albums ORDER BY created_at DESC LIMIT 4');
    const items = [];
    for (const album of a.rows) {
      const imgs = await turso.execute({
        sql: 'SELECT id, title, thumbnail_url FROM images WHERE album_id = ? ORDER BY created_at DESC LIMIT 2',
        args: [album.id],
      });
      items.push({ ...album, images: imgs.rows });
    }
    return items;
  } catch {
    return [];
  }
}

async function getRecent() {
  try {
    const r = await turso.execute('SELECT id, title, thumbnail_url FROM images ORDER BY created_at DESC LIMIT 12');
    return r.rows;
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Gallery (Plain)',
  description: 'A minimal, raw HTML view',
};

export default async function PlainPage() {
  const [featured, albums, recent] = await Promise.all([
    getFeatured(),
    getAlbums(),
    getRecent(),
  ]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Gallery (Plain)</title>
        <style>{`
          :root { color-scheme: dark; }
          body { margin: 0; padding: 24px; background: #0b0b0b; color: #eaeaea; font: 16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
          a { color: inherit; text-decoration: none; }
          header, section { max-width: 1100px; margin: 0 auto; }
          header { padding-bottom: 16px; border-bottom: 1px solid #242424; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
          nav a { margin-right: 12px; opacity: .8; }
          nav a:hover { opacity: 1; text-decoration: underline; }
          h1 { font-size: 20px; margin: 0; }
          h2 { font-size: 16px; font-weight: 600; margin: 28px 0 12px; opacity: .9; }
          p.muted { margin: 6px 0 0; opacity: .6; font-size: 13px; }
          .grid { display: grid; gap: 8px; }
          .grid.thumbs { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
          .row { display: grid; grid-template-columns: 1fr; gap: 8px; }
          @media (min-width: 720px) { .row { grid-template-columns: 280px 1fr; } }
          figure { margin: 0; }
          img { display: block; width: 100%; height: 100%; object-fit: cover; background: #161616; border: 1px solid #1f1f1f; }
          .album { border: 1px solid #1f1f1f; padding: 12px; }
          .album h3 { margin: 0 0 6px; font-size: 14px; }
          .album p { margin: 0; opacity: .7; font-size: 13px; }
          footer { max-width: 1100px; margin: 28px auto 0; padding-top: 16px; border-top: 1px solid #242424; opacity: .6; font-size: 13px; }
          .bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .pill { border: 1px solid #1f1f1f; padding: 6px 10px; border-radius: 999px; font-size: 13px; }
          .row > div:first-child { opacity: .85; }
          .thumb { aspect-ratio: 1 / 1; }
          .thumb-wide { aspect-ratio: 16 / 10; }
        `}</style>
      </head>
      <body>
        <header>
          <div>
            <h1>Gallery</h1>
            <p className="muted">A curated collection of images by BlackPiratex</p>
          </div>
          <nav className="bar">
            <a href="/">Home</a>
            <a href="/browse">All</a>
            <a href="/featured">Featured</a>
            <a href="/albums">Albums</a>
            <a href="/tags">Tags</a>
            <a href="/explore">Explore</a>
          </nav>
        </header>

        <main>
          {/* Featured */}
          <section aria-labelledby="featured">
            <h2 id="featured">Featured</h2>
            {featured.length === 0 ? (
              <p className="muted">No featured images.</p>
            ) : (
              <div className="grid thumbs">
                {featured.map((img) => (
                  <a key={img.id} href={`/image/${img.id}`} aria-label={img.title}>
                    <figure className="thumb">
                      <img src={img.thumbnail_url} alt="" loading="lazy" />
                    </figure>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Albums preview */}
          <section aria-labelledby="albums">
            <h2 id="albums">Albums</h2>
            {albums.length === 0 ? (
              <p className="muted">No albums created yet.</p>
            ) : (
              <div className="grid" style={{ gap: 12 }}>
                {albums.map((al) => (
                  <div key={al.id} className="album">
                    <div className="row">
                      <div>
                        <h3><a href={`/album/${al.id}`}>{al.name}</a></h3>
                        {al.description && <p>{al.description}</p>}
                        <p className="muted"><a href={`/album/${al.id}`}>View all →</a></p>
                      </div>
                      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {al.images.length === 0 ? (
                          <div className="thumb"><img alt="" /></div>
                        ) : (
                          al.images.map((img) => (
                            <a key={img.id} href={`/image/${img.id}`} aria-label={img.title}>
                              <figure className="thumb">
                                <img src={img.thumbnail_url} alt="" loading="lazy" />
                              </figure>
                            </a>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div><a className="pill" href="/albums">View all albums</a></div>
              </div>
            )}
          </section>

          {/* Recent */}
          <section aria-labelledby="recent">
            <h2 id="recent">Recent</h2>
            {recent.length === 0 ? (
              <p className="muted">No images yet.</p>
            ) : (
              <div className="grid thumbs">
                {recent.map((img) => (
                  <a key={img.id} href={`/image/${img.id}`} aria-label={img.title}>
                    <figure className="thumb-wide">
                      <img src={img.thumbnail_url} alt="" loading="lazy" />
                    </figure>
                  </a>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer>
          <p>© {new Date().getFullYear()} BlackPiratex</p>
        </footer>
      </body>
    </html>
  );
}