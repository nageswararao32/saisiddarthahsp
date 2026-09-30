import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import ContactIcons from './ContactIcons'
import { useCollection } from '../../lib/useCollection'
import { useSendReminder } from '../../lib/useSendReminder'
import { formatDate, daysUntil } from '../../lib/format'
import { Phone, Mail, MapPin, Building2, Wallet } from 'lucide-react'

export default function PatientDetailModal({ open, onClose, patient }) {
  const { rows: branches } = useCollection('branches')
  const { rows: ledger } = useCollection('creditLedger')
  const sendReminder = useSendReminder()

  if (!patient) return null
  const branch = branches.find((b) => b.id === patient.branchId)
  const myLedger = ledger
    .filter((e) => e.patientId === patient.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  const nextExpiring = myLedger
    .filter((e) => e.type === 'Earned' && e.expiry && daysUntil(e.expiry) >= 0)
    .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))[0]

  return (
    <Modal open={open} onClose={onClose} title={patient.name} description={patient.id} width="max-w-lg">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <InfoRow icon={Phone} label="Phone" value={patient.phone} />
        <InfoRow icon={Mail} label="Email" value={patient.email} />
        <InfoRow icon={Building2} label="Branch" value={branch?.name ?? '—'} />
        <InfoRow icon={MapPin} label="Address" value={patient.address || '—'} />
      </div>

      <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-brand-700">
          <Wallet size={16} />
          <span className="text-sm font-medium">Available balance</span>
        </div>
        <span className="text-lg font-semibold text-brand-700">{patient.creditBalance} credits</span>
      </div>

      {nextExpiring && (
        <div className="flex items-center justify-between rounded-lg border border-ink-100 px-3.5 py-2.5 mb-5">
          <div>
            <p className="text-xs text-ink-400">Next expiry</p>
            <p className="text-sm font-medium text-ink-800">
              {nextExpiring.amount} credits · {formatDate(nextExpiring.expiry)}
            </p>
          </div>
          <ContactIcons
            patient={patient}
            entry={nextExpiring}
            onSent={(channel, message) => sendReminder(patient, nextExpiring, channel, message)}
          />
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Credit activity</p>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {myLedger.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="text-ink-700">{e.type}</p>
              <p className="text-xs text-ink-400">{e.ref} · {formatDate(e.date)}</p>
            </div>
            <Badge tone={e.amount >= 0 ? 'brand' : 'rose'}>{e.amount >= 0 ? `+${e.amount}` : e.amount}</Badge>
          </div>
        ))}
        {myLedger.length === 0 && <p className="text-sm text-ink-400">No credit activity yet.</p>}
      </div>
    </Modal>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-ink-300 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-ink-400">{label}</p>
        <p className="text-sm text-ink-700 truncate">{value}</p>
      </div>
    </div>
  )
}
