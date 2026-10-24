import api from './api';
import { ENDPOINTS } from './endpoints';

const BASE = ENDPOINTS.accommodations;

// GET /accommodations  (عام)
// params: { location, minPrice, maxPrice, type, minRating, facilities }
// facilities ممكن تتبعت Array وبنحوّلها لنص مفصول بفواصل
export const getAccommodations = async (params = {}) => {
  const query = { ...params };
  if (Array.isArray(query.facilities)) {
    query.facilities = query.facilities.join(',');
  }
  // نشيل القيم الفاضية عشان ما تتبعتش في الـ URL
  Object.keys(query).forEach((key) => {
    if (query[key] === '' || query[key] === undefined || query[key] === null) delete query[key];
  });

  const { data } = await api.get(BASE, { params: query });
  return data; // { success, count, data: [...] }
};

// GET /accommodations/:accommodationId
export const getAccommodationById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data; // { success, data }
};
