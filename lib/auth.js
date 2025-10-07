export function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const password = authHeader?.replace('Bearer ', '');
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return false;
  }
  
  return true;
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}