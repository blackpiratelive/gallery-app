export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function extractFilename(path) {
  const name = path.split('/').pop().split('.')[0];
  return name.replace(/[_-]/g, ' ').replace(/\bw/g, c => c.toUpperCase());
}

export function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}