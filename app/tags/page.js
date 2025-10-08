import Link from 'next/link';
import { turso } from '@/lib/db';

async function getAllTags() {
  try {
    const result = await turso.execute('SELECT tags FROM images WHERE tags IS NOT NULL AND tags != ""');
    
    const tagCounts = {};
    result.rows.forEach((row) => {
      const tags = row.tags.split(',').map(t => t.trim()).filter(t => t);
      tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    return [];
  }
}

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <main className="min-h-screen" style={{ background: '#000' }}>
      <header className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-white/60 hover:text-white text-sm flex items-center gap-2 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white">Browse by Tags</h1>
          <p className="text-white/60 text-sm mt-2">{tags.length} {tags.length === 1 ? 'tag' : 'tags'}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {tags.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-white/60">No tags yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tagData, index) => (
              <Link
                key={tagData.tag}
                href={`/tag/${encodeURIComponent(tagData.tag)}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="glass border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all card-hover">
                  <span className="text-white font-medium">{tagData.tag}</span>
                  <span className="ml-3 text-white/40 text-sm">({tagData.count})</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}