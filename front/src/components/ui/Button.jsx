import Spinner from './Spinner';

const base =
  'inline-flex h-[46px] items-center justify-center gap-2 rounded-full border px-7 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70';

const variants = {
  primary: 'border-transparent bg-brand text-brand-contrast enabled:hover:bg-brand-hover',
  outline:
    'border-brand bg-transparent text-brand enabled:hover:bg-brand enabled:hover:text-brand-contrast'
};

export default function Button({
  children,
  variant = 'primary', // primary | outline
  type = 'button',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) {
  const classes = [base, variants[variant], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Spinner size={16} />}
      <span>{children}</span>
    </button>
  );
}