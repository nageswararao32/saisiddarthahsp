import { useMemo, useRef, useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../lib/format'

const typeTones = { Medicine: 'brand', Service: 'accent', Test: 'amber', Scan: 'rose' }

// Search-as-you-type picker so this stays usable with a catalog of hundreds or
// thousands of medicines — a plain <select> falls apart at that scale.
export default function MedicinePicker({ catalog, onAdd }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog.slice(0, 8)
    return catalog.filter((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)).slice(0, 8)
  }, [catalog, query])

  const pick = (item) => {
    onAdd(item, 1)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          className="input pl-9"
          placeholder={`Search ${catalog.length} medicines & services to add…`}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-10 top-full left-0 mt-1.5 w-full max-h-72 overflow-y-auto rounded-xl border border-ink-100 bg-white shadow-xl"
          >
            {results.length === 0 && <p className="p-4 text-sm text-ink-400">No matches for "{query}".</p>}
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(item)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-ink-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{item.name}</p>
                  <p className="text-xs text-ink-400">
                    {formatCurrency(item.price)} / {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={typeTones[item.type] ?? 'ink'}>{item.type}</Badge>
                  <Plus size={14} className="text-brand-600" />
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
