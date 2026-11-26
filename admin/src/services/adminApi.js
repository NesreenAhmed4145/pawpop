// كل الاتصال بالباك إند من هنا.
// لو الـ routes عندك متركبة على مسارات تانية غير /api/users و /api/accommodations و /api/bookings
// عدّل الثوابت اللي تحت.
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const PATHS = {
  users: '/users',
  accommodations: '/accommodations',
  bookings: '/bookings',
}

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

// ---------- Auth storage ----------
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  },
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  // بيتأكد إن التوكن موجود، ما خلصش، وصاحبه Admin
  isAdminSession() {
    const token = auth.getToken()
    if (!token) return false
    const payload = decodeToken(token)
    if (!payload || payload.Role !== 'Admin') return false
    return !payload.exp || payload.exp * 1000 > Date.now()
  },
}

// ---------- Core request ----------
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, skipAuthRedirect = false } = {}) {
  // FormData (رفع ملف): المتصفح هو اللي بيحط Content-Type مع الـ boundary، فمنحطوش إحنا
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const headers = isForm ? {} : { 'Content-Type': 'application/json' }
  const token = auth.getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // الرد مش JSON
  }

  if (!res.ok) {
    // 401/403 على أي طلب غير تسجيل الدخول = التوكن باظ أو مش أدمن
    if ((res.status === 401 || res.status === 403) && !skipAuthRedirect) {
      onUnauthorized()
    }
    throw new ApiError(data?.message || data?.error || `Request failed (${res.status})`, res.status)
  }
  return data
}

// ---------- Auth ----------
export async function login(Email, Password) {
  const data = await request(`${PATHS.users}/login`, {
    method: 'POST',
    body: { Email, Password },
    skipAuthRedirect: true,
  })
  const payload = decodeToken(data.token)
  if (!payload || payload.Role !== 'Admin') {
    throw new ApiError('This account does not have admin privileges.', 403)
  }
  auth.save(data.token, data.data)
  return data.data
}

// ---------- Accommodations ----------
export const getAccommodations = async () =>
  (await request(PATHS.accommodations)).data

// بيحوّل بيانات الفورم لـ FormData عشان الصورة تتبعت كـ file (الباك بيستقبلها في حقل اسمه ImageURL)
const buildAccommodationFormData = (payload, imageFile) => {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'ImageURL' || value === undefined || value === null) return
    // القوائم بتتبعت JSON string (الباك بيعمل JSON.parse على AmenityIDs)
    fd.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value))
  })
  if (imageFile) fd.append('ImageURL', imageFile)
  return fd
}

export const createAccommodation = (payload, imageFile = null) =>
  request(`${PATHS.accommodations}/admin/accommodations`, {
    method: 'POST',
    body: buildAccommodationFormData(payload, imageFile),
  })

// لو مفيش imageFile بنسيب الصورة الحالية زي ما هي
export const updateAccommodation = (id, payload, imageFile = null) =>
  request(`${PATHS.accommodations}/admin/accommodations/${id}`, {
    method: 'PATCH',
    body: buildAccommodationFormData(payload, imageFile),
  })

// الصور المرفوعة بترجع من الباك كمسار نسبي (/uploads/xxx.png)
export const assetUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const origin = API_BASE.replace(/\/api$/, '')
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
}

export const deleteAccommodation = (id) =>
  request(`${PATHS.accommodations}/admin/accommodations/${id}`, { method: 'DELETE' })

// ---------- Amenities ----------
export const getAmenities = async () =>
  (await request(`${PATHS.accommodations}/amenities`)).data

export const createAmenity = async (Name) =>
  (await request(`${PATHS.accommodations}/admin/amenities`, { method: 'POST', body: { Name } })).data

// ---------- Bookings ----------
export const getBookings = async () =>
  (await request(`${PATHS.bookings}/admin/all`)).data

export const updateBooking = (id, payload) =>
  request(`${PATHS.bookings}/admin/${id}`, { method: 'PATCH', body: payload })

export const updateBookingStatus = (id, Status) =>
  request(`${PATHS.bookings}/admin/${id}/status`, { method: 'PATCH', body: { Status } })