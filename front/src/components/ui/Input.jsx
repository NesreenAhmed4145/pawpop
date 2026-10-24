export default function Input({ label, required = false, error, hint, id, name, ...props }) {
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