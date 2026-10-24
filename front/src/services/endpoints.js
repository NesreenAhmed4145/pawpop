// بادئات (prefixes) الـ routes في الباك، مطابقة لسطور app.use(...) في server.js:
//   /api/users  /api/pets  /api/adoptions  /api/accommodations  /api/bookings
// (vaccinations و appointments و care بيتركّبوا كلهم على /api/pets)
export const ENDPOINTS = {
  users: '/users',
  pets: '/pets',
  adoption: '/adoptions',
  accommodations: '/accommodations',
  bookings: '/bookings'
};
