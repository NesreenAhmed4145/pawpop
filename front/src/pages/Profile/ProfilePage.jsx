import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  LogOut,
  Mail,
  Mars,
  PawPrint,
  Pencil,
  Phone,
  User,
  Venus,
  X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { updateProfile } from '../../services/authService';
import { getMyPets } from '../../services/petService';
import { getMyBookings } from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import { assetUrl } from '../../utils/formatters';

// خليها false لحد ما تعدلي الباك لرفع الصورة (هيخفي زرار القلم على الصورة)
const CAN_UPLOAD_AVATAR = true;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB زي الباك

// عدّلي المسارات دي حسب الـ router عندك
const ROUTES = {
  pets: '/my-pets',
  petDetails: (id) => `/pets/${id}`,
  bookings: '/my-bookings',
  adoption: '/adoption'
};

// الباك بيرجّع غالباً { data: [...] }، فنطلّع المصفوفة بأمان
const toList = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({ fullName: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // بيانات الحيوانات والحجوزات
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const imageUrl = assetUrl(user.ProfileImageURL);
  const initial = user.FullName?.charAt(0).toUpperCase();
  const joinedOn = user.CreatedAt
    ? new Date(user.CreatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  // ---------- جلب الحيوانات والحجوزات ----------
  useEffect(() => {
    let active = true;
    (async () => {
      const [petsRes, bookingsRes] = await Promise.allSettled([getMyPets(), getMyBookings()]);
      if (!active) return;
      if (petsRes.status === 'fulfilled') setPets(toList(petsRes.value));
      if (bookingsRes.status === 'fulfilled') setBookings(toList(bookingsRes.value));
      setLoadingData(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // ---------- وضع التعديل ----------
  const startEditing = () => {
    setValues({ fullName: user.FullName || '', phone: user.Phone || '' });
    setErrors({});
    setMessage(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    const name = values.fullName.trim();
    if (!name) next.fullName = 'Full name is required';
    else if (name.length > 100) next.fullName = 'Full name must be at most 100 characters';
    if (values.phone.trim().length > 20) next.phone = 'Phone must be at most 20 characters';
    return next;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ fullName: values.fullName.trim(), phone: values.phone.trim() });
      await refreshUser(); // نجيب البيانات الجديدة من الباك ونحدّث الـ context
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Could not update your profile.') });
    } finally {
      setSaving(false);
    }
  };

  // ---------- رفع صورة البروفايل ----------
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // عشان نقدر نختار نفس الصورة تاني
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage({ type: 'error', text: 'Image must be 5MB or smaller.' });
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      await updateProfile({}, file); // {} = مفيش بيانات نصية، الصورة بس
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile photo updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Could not upload the photo.') });
    } finally {
      setUploading(false);
    }
  };

  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#3d2b1f]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* ================= الهيدر ================= */}
        <header className="flex flex-wrap items-center justify-between gap-8">
          <div className="flex flex-wrap items-center gap-6">
            {/* الصورة + زرار القلم */}
            <div className="relative h-44 w-44 shrink-0 rounded-full border-[3px] border-[#e5d6c6] p-2">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#f8ede5] text-6xl text-[#6b4423]">
                {imageUrl ? (
                  <img src={imageUrl} alt={user.FullName} className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>

              {CAN_UPLOAD_AVATAR && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Change profile photo"
                    className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f8ede5] text-white shadow-md transition hover:bg-[#6f4d36] disabled:opacity-70"
                  >
                    {uploading ? <Spinner size={14} /> : <Pencil size={15} />}
                  </button>
                </>
              )}
            </div>

            {/* الاسم + الإيميل + الموبايل */}
            <div className="min-w-0">
              <h1 className="font-['Playfair_Display',serif] text-4xl font-bold">{user.FullName}</h1>
              <p className="mt-3 flex items-center gap-2.5 text-sm">
                <Mail size={16} className="text-[#8a6246]" /> {user.Email}
              </p>
              {user.Phone && (
                <p className="mt-2 flex items-center gap-2.5 text-sm">
                  <Phone size={16} className="text-[#8a6246]" /> {user.Phone}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 rounded-full bg-[#8a6246] px-6 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#6f4d36]"
                >
                  <Pencil size={15} /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e5d6c6] bg-white/70 px-5 py-3 text-sm font-medium text-[#8a6246] transition hover:bg-white"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </div>
          </div>

          {/* إحصائيات */}
          <div className="grid grid-cols-2 divide-x divide-[#d9c5b0] rounded-[28px] bg-[#f1e2d3] px-3 py-5 shadow-sm">
            <Stat icon={PawPrint} value={loadingData ? '–' : pets.length} label="My Pets" />
            <Stat icon={CalendarDays} value={loadingData ? '–' : bookings.length} label="Bookings" />
          </div>
        </header>

        <hr className="my-8 border-[#e5d6c6]" />

        {/* ================= الرسالة ================= */}
        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`mb-6 rounded-2xl px-4 py-2.5 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ================= المحتوى ================= */}
        <main className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
          {/* ----- العمود الأيسر ----- */}
          <div className="grid gap-6">
            {/* About me / وضع التعديل */}
            <Card>
              <CardTitle icon={User}>About Me</CardTitle>

              {isEditing ? (
                <form onSubmit={handleSave} noValidate className="mt-5 grid gap-4">
                  <Field
                    label="Full name"
                    name="fullName"
                    required
                    value={values.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    optional
                    type="tel"
                    value={values.phone}
                    onChange={handleChange}
                    error={errors.phone}
                  />
                  <Field
                    label="Email"
                    name="email"
                    value={user.Email}
                    disabled
                    hint="Your email can't be changed here."
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#8a6246] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#6f4d36] disabled:opacity-70"
                    >
                      {saving ? <Spinner size={14} /> : <Check size={16} />}
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e5d6c6] bg-white px-5 py-2.5 text-sm text-[#8a6246] transition hover:bg-[#f8f1e9]"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <ul className="mt-5 grid gap-3.5 text-sm">
                  <li className="flex items-center gap-3">
                    <User size={16} className="shrink-0 text-[#8a6246]" /> {user.FullName}
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={16} className="shrink-0 text-[#8a6246]" />
                    <span className="min-w-0 truncate">{user.Email}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={16} className="shrink-0 text-[#8a6246]" />
                    {user.Phone ? user.Phone : <span className="text-[#3d2b1f]/40">Add your phone</span>}
                  </li>
                  <li className="flex items-center gap-3">
                    <CalendarDays size={16} className="shrink-0 text-[#8a6246]" /> Joined since {joinedOn}
                  </li>
                </ul>
              )}
            </Card>

            {/* Recent bookings */}
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle icon={CalendarDays}>Recent Bookings</CardTitle>
                <ViewAll to={ROUTES.bookings} />
              </div>
              <div className="mt-4 border-t border-[#eadfd2] pt-4">
                {loadingData ? (
                  <CenterSpinner />
                ) : recentBookings.length === 0 ? (
                  <p className="py-4 text-sm text-[#3d2b1f]/50">You have no bookings yet.</p>
                ) : (
                  <ul className="grid gap-4">
                    {recentBookings.map((booking) => (
                      <BookingRow key={booking.BookingID ?? booking.id} booking={booking} />
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>

          {/* ----- العمود الأيمن ----- */}
          <div className="grid gap-6">
            {/* My pets */}
            <Card>
              <div className="flex items-center justify-between">
                <CardTitle icon={PawPrint}>My Pets</CardTitle>
                <ViewAll to={ROUTES.pets} />
              </div>
              <div className="mt-5">
                {loadingData ? (
                  <CenterSpinner />
                ) : pets.length === 0 ? (
                  <p className="py-4 text-sm text-[#3d2b1f]/50">You haven't added any pets yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {pets.slice(0, 4).map((pet) => (
                      <PetCard key={pet.PetID ?? pet.id} pet={pet} />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* بانر الدعوة */}
            <div className="relative overflow-hidden rounded-3xl border border-[#eadfd2] bg-gradient-to-br from-[#f6ece0] to-[#ead8c4] p-7 shadow-sm">
              <PawPrint
                aria-hidden
                className="pointer-events-none absolute -bottom-4 -right-2 h-32 w-32 -rotate-12 text-[#d9c5b0]/60"
              />
              <Heart
                aria-hidden
                className="pointer-events-none absolute right-8 top-5 h-10 w-10 rotate-12 text-[#8a6246]/30"
              />
              <div className="relative">
                <p className="flex items-center gap-2 text-lg">
                  <Heart size={22} className="fill-[#8a6246] text-[#8a6246]" /> Together for a
                </p>
                <p className="font-['Playfair_Display',serif] text-2xl font-bold">Happier Pet Life</p>
                <Link
                  to={ROUTES.adoption}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#8a6246] px-6 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#6f4d36]"
                >
                  Explore More Pets <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------- مكونات صغيرة ----------
function Card({ children }) {
  return (
    <section className="rounded-3xl border border-[#f0e6da] bg-[#fdfaf6] p-6 shadow-[0_8px_24px_-12px_rgba(107,68,35,0.18)]">
      {children}
    </section>
  );
}

function CardTitle({ icon: Icon, children }) {
  return (
    <h2 className="flex items-center gap-3 font-['Playfair_Display',serif] text-xl font-bold">
      <Icon size={22} className="text-[#6b4423]" /> {children}
    </h2>
  );
}

function ViewAll({ to }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
      View All <ArrowRight size={14} />
    </Link>
  );
}

function CenterSpinner() {
  return (
    <div className="flex justify-center py-6 text-[#8a6246]">
      <Spinner size={22} />
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex min-w-[96px] flex-col items-center gap-1 px-4">
      <Icon size={20} className="text-[#8a6246]" />
      <span className="text-2xl font-medium leading-none">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function PetCard({ pet }) {
  const id = pet.PetID ?? pet.id;
  const name = pet.PetName ?? pet.Name ?? 'Unnamed';
  const image = assetUrl(pet.ImageURL);
  const gender = String(pet.Gender || '').toLowerCase();
  const age = pet.Age;

  return (
    <div className="flex gap-3 rounded-3xl bg-white p-2.5 shadow-sm">
      <div className="flex h-32 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f1e2d3] text-[#8a6246]">
        {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : <PawPrint size={32} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div>
          <p className="flex items-center gap-1.5 font-['Playfair_Display',serif] font-bold">
            <span className="truncate">{name}</span>
            {gender === 'female' && <Venus size={14} className="shrink-0 text-pink-500" />}
            {gender === 'male' && <Mars size={14} className="shrink-0 text-sky-500" />}
          </p>
          {age !== undefined && age !== null && age !== '' && (
            <p className="mt-0.5 text-xs text-[#3d2b1f]/70">
              {typeof age === 'number' ? `${age} ${age === 1 ? 'year' : 'years'} old` : age}
            </p>
          )}
        </div>
        <Link
          to={ROUTES.petDetails(id)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#ecdccb] px-3 py-2 text-xs font-medium text-[#6b4423] transition hover:bg-[#e3d0bb]"
        >
          View Details <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-600',
  canceled: 'bg-red-100 text-red-600'
};

function BookingRow({ booking }) {
  const title = booking.AccommodationName ?? booking.Accommodation?.Name ?? booking.Title ?? 'Booking';
  const image = assetUrl(booking.AccommodationImage ?? booking.ImageURL ?? booking.Accommodation?.ImageURL);
  const status = booking.Status || '';
  const statusClass = STATUS_STYLES[status.toLowerCase()] || 'bg-[#f1e2d3] text-[#6b4423]';

  return (
    <li className="flex items-center gap-4">
      <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f1e2d3] text-[#8a6246]">
        {image ? <img src={image} alt={title} className="h-full w-full object-cover" /> : <CalendarDays size={24} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-['Playfair_Display',serif] font-bold">{title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#3d2b1f]/70">
          <CalendarDays size={13} /> {formatDate(booking.CheckInDate)}
        </p>
      </div>
      {status && (
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>{status}</span>
      )}
    </li>
  );
}

// حقل إدخال (وضع التعديل)
function Field({ label, name, required, optional, error, hint, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-[#6b4423]">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {optional && <span className="font-normal text-[#8a7766]"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        className={`h-11 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-[#8a6246] focus:ring-2 focus:ring-[#8a6246]/20 disabled:bg-[#f6f1ea] disabled:text-[#3d2b1f]/50 ${
          error ? 'border-red-400' : 'border-[#e3d9cd]'
        }`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[#8a7766]">{hint}</p>
      ) : null}
    </div>
  );
}

// ---- مكونات محلية خاصة بالصفحة دي (مش معتمدة على أي فولدر مشترك) ----

function Spinner({ size = 20 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-r-transparent"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}