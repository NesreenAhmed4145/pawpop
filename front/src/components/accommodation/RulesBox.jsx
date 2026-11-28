export default function RulesBox({ rules }) {
  if (!rules) return null;

  const items = [
    ['Max pets', rules.MaxPets],
    ['Accepted pets', rules.AcceptedPetTypes],
    ['Allowed size', rules.AllowedSize],
    ['Vaccination', rules.RequiresVaccination ? 'Required' : 'Not required'],
  ];

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-surface p-7 shadow-card">
      <h2 className="text-[22px] font-bold text-text-heading">Pet rules</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 rounded-2xl bg-page p-4">
            <span className="text-xs font-semibold text-text-secondary">{label}</span>
            <strong className="text-base text-text-heading">{value || '—'}</strong>
          </div>
        ))}
      </div>

      {rules.AdditionalRulesText && (
        <p className="text-sm leading-relaxed text-text-body">{rules.AdditionalRulesText}</p>
      )}
    </section>
  );
}