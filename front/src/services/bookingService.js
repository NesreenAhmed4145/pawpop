import api from './api';
import { ENDPOINTS } from './endpoints';

const BASE = ENDPOINTS.bookings;

// GET /bookings/:accommodationId/availability?checkInDate=...&checkOutDate=...
export const checkAvailability = async (accommodationId, checkInDate, checkOutDate) => {
  const { data } = await api.get(`${BASE}/${accommodationId}/availability`, {
    params: { checkInDate, checkOutDate }
  });
  return data;
};

// POST /bookings
// body: { AccommodationID, CheckInDate, CheckOutDate, GuestsCount, PetsCount }
export const createBooking = async (body) => {
  const { data } = await api.post(BASE, body);
  return data;
};

// GET /bookings/me
export const getMyBookings = async () => {
  const { data } = await api.get(`${BASE}/me`);
  return data;
};

// GET /bookings/:bookingId
export const getBookingById = async (bookingId) => {
  const { data } = await api.get(`${BASE}/${bookingId}`);
  return data;
};

// PATCH /bookings/:bookingId
// body: أي من { CheckInDate, CheckOutDate, GuestsCount, PetsCount }
export const updateBooking = async (bookingId, body) => {
  const { data } = await api.patch(`${BASE}/${bookingId}`, body);
  return data;
};

// PATCH /bookings/:bookingId/cancel
export const cancelBooking = async (bookingId) => {
  const { data } = await api.patch(`${BASE}/${bookingId}/cancel`);
  return data;
};
