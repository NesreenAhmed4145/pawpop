import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // جاية من صفحة التسجيل بعد إنشاء الحساب؟
  const justRegistered = Boolean(location.state?.registered);

  const [values, setValues] = useState({ email: location.state?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!values.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(values.email.trim())) next.email = 'Enter a valid email address';
    if (!values.password) next.password = 'Password is required';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');
    try {
      await login(values.email.trim(), values.password);
      // بعد نجاح الدخول: على البروفايل (أو الصفحة المحمية اللي كان رايحلها)
      const destination = location.state?.from?.pathname || '/profile';
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Login failed. Please try again.'));
      setSubmitting(false);
    }
  };

    return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-ink/20 shadow-sm md:grid-cols-2">
        {/* الفورم */}
        <section className="order-2 p-6 sm:p-10 lg:p-14 md:order-1">
          <h1 className="mb-1.5 text-center text-[26px] font-normal text-ink sm:text-[30px] lg:text-[32px]">
            Welcome back
          </h1>
          <p className="mb-7 text-center text-muted">
            Log in to care for your paw pals.
          </p>

          {justRegistered && !formError && (
            <div
              className="mb-[18px] rounded-md bg-success-bg px-3.5 py-2.5 text-sm text-success"
              role="status"
            >
              Account created successfully! Please log in.
            </div>
          )}
          {formError && (
            <div
              className="mb-[18px] rounded-md bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
              role="alert"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Button type="submit" fullWidth loading={submitting}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-muted">
            New to pawpop?{' '}
            <Link to="/register" className="font-bold text-brand hover:underline">
              Create an account
            </Link>
          </p>
        </section>

        {/* الصورة والجملة الترحيبية */}
        <aside className="order-1 flex flex-col items-center justify-center gap-3 bg-brand/10 px-6 py-8 text-center md:order-2 md:gap-5 md:p-10">
          <img
            src="/paw-logo2.png"
            alt="Paw logo"
            className="h-24 w-24 object-contain sm:h-32 sm:w-32 md:h-52 md:w-52 lg:h-64 lg:w-64"
          />
          <h2 className="text-xl font-semibold text-ink sm:text-2xl md:text-3xl">
            Good to see you again! 🐶
          </h2>
          <p className="max-w-xs text-sm text-muted sm:text-base">
            Your paw pals have been waiting. Log in and pick up right where you left off.
          </p>
        </aside>
      </div>
    </main>
  );
}

// ---- مكونات محلية (كانت في components/ui قبل ما يتشالوا) ----

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

const buttonBase =
  'inline-flex h-[46px] items-center justify-center gap-2 rounded-full border px-7 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70';

const buttonVariants = {
  primary: 'border-transparent bg-brand text-brand-contrast enabled:hover:bg-brand-hover',
  outline:
    'border-brand bg-transparent text-brand enabled:hover:bg-brand enabled:hover:text-brand-contrast'
};

function Button({
  children,
  variant = 'primary', // primary | outline
  type = 'button',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) {
  const classes = [buttonBase, buttonVariants[variant], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Spinner size={16} />}
      <span>{children}</span>
    </button>
  );
}

function Input({ label, required = false, error, hint, id, name, ...props }) {
  const inputId = id || name;
  const messageId = `${inputId}-message`;

  return (
    <div className="mb-[18px]">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block font-medium text-ink">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        className={`h-[42px] w-full rounded-md border bg-field px-3 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-[3px] focus:ring-brand/15 ${
          error ? 'border-danger' : 'border-field-line'
        }`}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        {...props}
      />
      {error ? (
        <p id={messageId} className="mt-1.5 text-[12.5px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-[12.5px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
