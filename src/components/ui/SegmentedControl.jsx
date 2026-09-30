export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-ink-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            value === opt.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
