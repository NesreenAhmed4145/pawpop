// مفاتيح الـ localStorage (نفس المفاتيح هتتستخدم في لوحة الأدمن لو اتحطت على نفس الـ origin)
export const STORAGE_KEYS = {
  token: 'pawpop_token',
  theme: 'pawpop_theme'
};

// قيم الحالات زي ما الباك بيرجّعها بالظبط (الحروف كبيرة/صغيرة مهمة)
export const ADOPTION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const PASSWORD_MIN_LENGTH = 6;
