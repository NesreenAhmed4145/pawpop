import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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
    <>
      <h1 className="mb-1.5 text-center text-[28px] font-normal text-ink sm:text-[32px]">Welcome back</h1>
      <p className="mb-7 text-center text-muted">Log in to care for your paw pals.</p>

      {justRegistered && !formError && (
        <div className="mb-[18px] rounded-md bg-success-bg px-3.5 py-2.5 text-sm text-success" role="status">
          Account created successfully! Please log in.
        </div>
      )}
      {formError && (
        <div className="mb-[18px] rounded-md bg-danger-bg px-3.5 py-2.5 text-sm text-danger" role="alert">
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
        New to pawpop? <Link to="/register" className="font-bold text-brand hover:underline">Create an account</Link>
      </p>
    </>
  );
}
