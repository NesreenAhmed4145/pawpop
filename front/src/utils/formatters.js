// تنسيق التاريخ (مثال: Oct 23, 2026)
export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// الصور بتتخزن في الباك كمسار نسبي زي /uploads/123.jpg
// الدالة دي بتحوله لرابط كامل باستخدام عنوان السيرفر (من غير /api)
export const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};
