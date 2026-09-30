import { useMemo, useRef, useState, useEffect } from 'react'
import { Bell, Clock, MessageCircle, MessageSquareText, Mail, CheckCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCollection } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { daysUntil, formatDate } from '../../lib/format'
import PatientDetailModal from '../shared/PatientDetailModal'

const CHANNEL_ICON = { WhatsApp: MessageCircle, SMS: MessageSquareText, Email: Mail }

export default function NotificationBell() {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const [detailPatient, setDetailPatient] = useState(null)
  const ref = useRef(null)

  const { rows: ledger } = useCollection('creditLedger')
  const { rows: patients } = useCollection('patients')
  const { rows: notifications, update: updateNotification } = useCollection('notifications')

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const isPatient = session?.role === 'patient'

  const myNotifications = useMemo(() => {
    if (!isPatient) return []
    return notifications
      .filter((n) => n.patientId === session.patientId)
      .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
  }, [notifications, isPatient, session])

  const expiringAlerts = useMemo(() => {
    if (isPatient) return []
    return ledger
      .filter((e) => e.type === 'Earned' && e.expiry && daysUntil(e.expiry) >= 0 && daysUntil(e.expiry) <= 7)
      .map((e) => ({ ...e, patient: patients.find((p) => p.id === e.patientId) }))
      .filter((e) => e.patient)
      .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))
      .slice(0, 8)
  }, [ledger, patients, isPatient])

  const unreadCount = isPatient ? myNotifications.filter((n) => !n.read).length : expiringAlerts.length

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 rounded-lg text-ink-500 hover:bg-ink-50">
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-ink-100 bg-white shadow-xl z-50"
          >
            {isPatient ? (
              <PatientNotificationList
                items={myNotifications}
                onOpen={(n) => {
                  if (!n.read) updateNotification(n.id, { read: true })
                }}
              />
            ) : (
              <AdminAlertList items={expiringAlerts} onSelectPatient={(p) => { setDetailPatient(p); setOpen(false) }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PatientDetailModal open={!!detailPatient} onClose={() => setDetailPatient(null)} patient={detailPatient} />
    </div>
  )
}

function PatientNotificationList({ items, onOpen }) {
  if (items.length === 0) {
    return <p className="p-5 text-sm text-ink-400 text-center">No notifications yet.</p>
  }
  return (
    <div className="divide-y divide-ink-50">
      <p className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Reminders</p>
      {items.map((n) => {
        const Icon = CHANNEL_ICON[n.channel] ?? Bell
        return (
          <button
            key={n.id}
            onClick={() => onOpen(n)}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-ink-50 transition-colors ${
              !n.read ? 'bg-brand-50/40' : ''
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-ink-700 line-clamp-2">{n.message}</p>
              <p className="text-[11px] text-ink-400 mt-1 flex items-center gap-1">
                <Clock size={10} /> {formatDate(n.createdOn)} · {n.channel}
              </p>
            </div>
            {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

function AdminAlertList({ items, onSelectPatient }) {
  if (items.length === 0) {
    return <p className="p-5 text-sm text-ink-400 text-center">No credits expiring in the next 7 days.</p>
  }
  return (
    <div className="divide-y divide-ink-50">
      <p className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Expiring within 7 days
      </p>
      {items.map((e) => (
        <button
          key={e.id}
          onClick={() => onSelectPatient(e.patient)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-ink-50 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-800 truncate">{e.patient.name}</p>
            <p className="text-xs text-ink-400">{e.amount} credits · {formatDate(e.expiry)}</p>
          </div>
          <span className={`text-xs font-medium shrink-0 ${daysUntil(e.expiry) <= 2 ? 'text-rose-600' : 'text-amber-600'}`}>
            {daysUntil(e.expiry) === 0 ? 'Today' : `${daysUntil(e.expiry)}d`}
          </span>
        </button>
      ))}
      <div className="px-4 py-2">
        <CheckCheck size={12} className="inline text-ink-300 mr-1" />
        <span className="text-[11px] text-ink-400">Click a patient to view details and send a reminder.</span>
      </div>
    </div>
  )
}
