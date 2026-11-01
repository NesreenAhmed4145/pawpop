import { useRef, useState } from 'react';
import { Camera, Check, LogOut, Mail, Pencil, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { updateProfile } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { assetUrl } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';

// خليها false لحد ما تعدلي الباك لرفع الصورة (هيخفي زرار الكاميرا)
const CAN_UPLOAD_AVATAR = true;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB زي الباك

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({ fullName: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const imageUrl = assetUrl(user.ProfileImageURL);
  const initial = user.FullName?.charAt(0).toUpperCase();
  const memberSince = user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString('en-US') : '—';

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

  return (
    <div className="min-h-screen bg-white text-cocoa">
      {/* ================= البانر ================= */}
      <header className="relative overflow-hidden bg-sand">
        {/* دوائر الديكور */}
        <div className="pointer-events-none absolute -left-20 top-4 h-52 w-52 rounded-full bg-white/60" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-black/5" />

        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-10">
          {/* الصورة + زرار الكاميرا */}
          <div className="relative h-32 w-32 shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#d9cdc3] text-5xl">
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
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-cocoa text-white hover:bg-cocoa-hover disabled:opacity-70"
                >
                  {uploading ? <Spinner size={14} /> : <Camera size={16} />}
                </button>
              </>
            )}
          </div>

          {/* الاسم + الإيميل + تاريخ الانضمام */}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cocoa/60">
              Welcome
            </p>
            <h1 className="text-4xl font-normal sm:text-[44px] sm:leading-tight">{user.FullName}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm">
                <Mail size={14} /> {user.Email}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm text-cocoa/70">
                Member since {memberSince}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-white/80"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </header>

      {/* ================= المحتوى ================= */}
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`rounded-md px-4 py-2.5 text-sm lg:col-span-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ----- كارت Your details ----- */}
        <section className="self-start rounded-xl border border-edge bg-white">
          <div className="flex items-center justify-between border-b border-edge px-6 py-4">
            <h2 className="text-xl">Your details</h2>

            {isEditing ? (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-1.5 text-xs text-cocoa/70 hover:text-cocoa"
              >
                <X size={14} /> Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 rounded-full bg-cocoa px-4 py-2 text-xs font-semibold text-white hover:bg-cocoa-hover"
              >
                <Pencil size={14} /> Edit profile
              </button>
            )}
          </div>

          {isEditing ? (
            /* وضع التعديل */
            <form onSubmit={handleSave} noValidate className="grid gap-4 p-6 sm:grid-cols-2">
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
              <div className="sm:col-span-2">
                <Field
                  label="Email"
                  name="email"
                  value={user.Email}
                  disabled
                  hint="Your email can't be changed here."
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-white hover:bg-cocoa-hover disabled:opacity-70"
                >
                  {saving ? <Spinner size={14} /> : <Check size={16} />}
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            /* وضع العرض */
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              <InfoTile label="Full name" value={user.FullName} />
              <InfoTile label="Phone" value={user.Phone} placeholder="Add your phone" />
              <div className="sm:col-span-2">
                <InfoTile label="Email" value={user.Email} />
              </div>
            </div>
          )}
        </section>

        {/* ----- كارت Account ----- */}
        <aside className="self-start rounded-xl border border-edge bg-white p-6">
          <h2 className="mb-3 text-xl">Account</h2>
          <p className="flex items-center gap-3 py-2 text-sm">
            <Mail size={16} /> {user.Email}
          </p>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 py-2 text-sm text-brand hover:underline"
          >
            <LogOut size={16} /> Log out
          </button>
        </aside>
      </main>
    </div>
  );
}

// مربع عرض (وضع العرض)
function InfoTile({ label, value, placeholder }) {
  return (
    <div className="rounded-2xl bg-sand-soft px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-cocoa/70">{label}</p>
      <p className={value ? 'mt-0.5 font-medium' : 'mt-0.5 text-cocoa/40'}>{value || placeholder}</p>
    </div>
  );
}

// حقل إدخال (وضع التعديل)
function Field({ label, name, required, optional, error, hint, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {optional && <span className="font-normal text-cocoa/60"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        className={`h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/20 disabled:bg-gray-50 disabled:text-cocoa/50 ${
          error ? 'border-red-400' : 'border-[#e3d9cd]'
        }`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-cocoa/60">{hint}</p>
      ) : null}
    </div>
  );
}