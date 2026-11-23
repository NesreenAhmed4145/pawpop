export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};


export const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};
