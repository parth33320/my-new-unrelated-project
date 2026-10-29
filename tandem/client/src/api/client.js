// Relative URLs use Vite's proxy locally and Express in production.
export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(data.error || 'Request failed.'), { status: response.status });
  }
  return data;
}
