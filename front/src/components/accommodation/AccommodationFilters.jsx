function Option({ type = 'checkbox', name, label, checked, onChange }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-[18px] w-[18px] accent-brand"
      />
      {label}
    </label>
  );
}

function Group({ title, children }) {
  return (
    <fieldset className="m-0 flex flex-col border-0 p-0">
      <legend className="mb-1 p-0 text-[13px] font-bold text-text-secondary">{title}</legend>
      {children}
    </fieldset>
  );
}

const RATING_OPTIONS = [
  { label: '4.5 and up', value: 4.5 },
  { label: '4.0 and up', value: 4 },
  { label: 'Any', value: 0 },
];

export default function AccommodationFilters({
  types,
  facilities,
  priceLimit,
  filters,
  onChange,
  onToggle,
  onClear,
}) {
  const currentPrice = filters.maxPrice === '' ? priceLimit : filters.maxPrice;

  return (
    <aside className="flex h-fit flex-col gap-5 rounded-3xl border border-line bg-surface p-7">
      <h2 className="text-xl font-bold text-text-heading">Filters</h2>

      <Group title="Stay type">
        {types.map((type) => (
          <Option
            key={type}
            label={type}
            checked={filters.types.includes(type)}
            onChange={() => onToggle('types', type)}
          />
        ))}
      </Group>

      <div className="h-px bg-line" />

      <div className="flex flex-col gap-2">
        <label htmlFor="max-price" className="text-[13px] font-bold text-text-secondary">
          Max price per night
        </label>
        <input
          id="max-price"
          type="range"
          min="0"
          max={priceLimit}
          step="50"
          value={currentPrice}
          onChange={(e) => onChange('maxPrice', Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-[13px] text-text-secondary">
          <span>0 EGP</span>
          <span>{currentPrice} EGP</span>
        </div>
      </div>

      <div className="h-px bg-line" />

      <Group title="Minimum rating">
        {RATING_OPTIONS.map((option) => (
          <Option
            key={option.value}
            type="radio"
            name="rating"
            label={option.label}
            checked={filters.minRating === option.value}
            onChange={() => onChange('minRating', option.value)}
          />
        ))}
      </Group>

      <div className="h-px bg-line" />

      <Group title="Facilities">
        {facilities.map((name) => (
          <Option
            key={name}
            label={name}
            checked={filters.facilities.includes(name)}
            onChange={() => onToggle('facilities', name)}
          />
        ))}
      </Group>

      <button
        type="button"
        onClick={onClear}
        className="h-11 rounded-full border border-brand font-semibold text-brand transition-colors hover:bg-section"
      >
        Clear all filters
      </button>
    </aside>
  );
}