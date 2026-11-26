import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';
import { PASSWORD_MIN_LENGTH } from '../../utils/constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
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
    const fullName = values.fullName.trim();

    if (!fullName) next.fullName = 'Full name is required';
    else if (fullName.length > 100) next.fullName = 'Full name must be at most 100 characters';

    if (!values.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(values.email.trim())) next.email = 'Enter a valid email address';

    if (!values.password) next.password = 'Password is required';
    else if (values.password.length < PASSWORD_MIN_LENGTH) {
      next.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }

    if (!values.confirmPassword) next.confirmPassword = 'Please confirm your password';
    else if (values.confirmPassword !== values.password) {
      next.confirmPassword = 'Passwords do not match';
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');
    const email = values.email.trim();

    try {
      await register({
        fullName: values.fullName.trim(),
        email,
        password: values.password
      });
      // بعد إنشاء الحساب: صفحة login مع رسالة نجاح والإيميل متعبّي
      navigate('/login', { replace: true, state: { registered: true, email } });
    } catch (error) {
      const message = getErrorMessage(error, 'Could not create the account. Please try again.');
      // الباك بيرجّع "Email already exists!" لو الإيميل مستخدم
      if (/exists/i.test(message)) {
        setErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
      } else {
        setFormError(message);
      }
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="border border-ink/20 rounded-xl shadow-sm w-[calc(100%-2rem)] md:w-3/4 lg:w-1/2 mx-auto my-8 sm:my-16 lg:my-30 p-6 sm:p-12 lg:p-20">
      <h1 className="mb-1.5 text-center text-[28px] font-normal text-ink sm:text-[32px]">Create your account</h1>
      <p className="mb-7 text-center text-muted">Join a caring community for your paw pals.</p>

      {formError && (
        <div className="mb-[18px] rounded-md bg-danger-bg px-3.5 py-2.5 text-sm text-danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          value={values.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />
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
          autoComplete="new-password"
          required
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          hint={`At least ${PASSWORD_MIN_LENGTH} characters`}
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-muted">
        Already have an account? <Link to="/login" className="font-bold text-brand hover:underline">Log in</Link>
      </p>
      </div>
    </>
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