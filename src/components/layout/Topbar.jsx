import { useMemo, useRef, useState, useEffect } from 'react'
import { Search, Menu, UserRound, Receipt as ReceiptIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCollection } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDate } from '../../lib/format'
import NotificationBell from './NotificationBell'
import PatientDetailModal from '../shared/PatientDetailModal'
import ReceiptModal from '../billing/ReceiptModal'

export default function Topbar({ title, subtitle, actor, onMenuClick }) {
  const { session } = useAuth()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [detailPatient, setDetailPatient] = useState(null)
  const [receiptBill, setReceiptBill] = useState(null)
  const boxRef = useRef(null)

  const { rows: patients } = useCollection('patients')
  const { rows: bills } = useCollection('bills')

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const isPatient = session?.role === 'patient'
  const scopedBills = isPatient ? bills.filter((b) => b.patientId === session.patientId) : bills

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return { patients: [], bills: [] }

    const patientMatches = isPatient
      ? []
      : patients
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.phone.includes(q) ||
              p.id.toLowerCase().includes(q) ||
              p.email.toLowerCase().includes(q)
          )
          .slice(0, 5)

    const billMatches = scopedBills
      .filter((b) => b.id.toLowerCase().includes(q))
      .slice(0, 5)

    return { patients: patientMatches, bills: billMatches }
  }, [query, patients, scopedBills, isPatient])

  const hasResults = results.patients.length > 0 || results.bills.length > 0

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between gap-4 border-b border-ink-100 bg-white/80 backdrop-blur px-4 md:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-ink-500 hover:bg-ink-50"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-ink-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-ink-400 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 flex-1 max-w-sm relative" ref={boxRef}>
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={isPatient ? 'Search your bills…' : 'Search patients, bills, invoices…'}
            className="w-full rounded-lg border border-ink-200 bg-ink-50/60 py-2 pl-9 pr-3 text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
          />
        </div>

        <AnimatePresence>
          {focused && query.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-2 w-96 max-h-96 overflow-y-auto rounded-xl border border-ink-100 bg-white shadow-xl"
            >
              {!hasResults && <p className="p-4 text-sm text-ink-400">No matches for "{query}".</p>}

              {results.patients.length > 0 && (
                <div className="py-1">
                  <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Patients
                  </p>
                  {results.patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setDetailPatient(p)
                        setFocused(false)
                        setQuery('')
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left hover:bg-ink-50"
                    >
                      <div className="h-7 w-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <UserRound size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-ink-800 truncate">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.id} · {p.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.bills.length > 0 && (
                <div className="py-1 border-t border-ink-50">
                  <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Bills
                  </p>
                  {results.bills.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setReceiptBill(b)
                        setFocused(false)
                        setQuery('')
                      }}
                      className="w-full flex items-center justify-between gap-2.5 px-4 py-2 text-left hover:bg-ink-50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
                          <ReceiptIcon size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-ink-800 truncate">{b.id}</p>
                          <p className="text-xs text-ink-400">{formatDate(b.date)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-ink-600 shrink-0">{formatCurrency(b.amount)}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <NotificationBell />
        <div className="flex items-center gap-2 pl-3 border-l border-ink-100">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-xs font-semibold">
            {actor?.slice(0, 2).toUpperCase() ?? 'LH'}
          </div>
          <span className="hidden md:block text-sm font-medium text-ink-700">{actor}</span>
        </div>
      </div>

      <PatientDetailModal open={!!detailPatient} onClose={() => setDetailPatient(null)} patient={detailPatient} />
      <ReceiptModal
        open={!!receiptBill}
        onClose={() => setReceiptBill(null)}
        bill={receiptBill}
        patient={patients.find((p) => p.id === receiptBill?.patientId)}
      />
    </header>
  )
}
