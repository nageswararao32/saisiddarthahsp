import { Link } from 'react-router-dom'
import { Wallet, Gift, Clock, History, ArrowRight, Sparkles } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useCollection } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { expiringForPatient } from '../../lib/analytics'
import { formatCurrency, formatDate, daysUntil } from '../../lib/format'

export default function PatientDashboard() {
  const { session } = useAuth()
  const { rows: patients } = useCollection('patients')
  const { rows: bills } = useCollection('bills')
  const { rows: ledger } = useCollection('creditLedger')

  const patient = patients.find((p) => p.id === session.patientId)
  const myBills = bills.filter((b) => b.patientId === patient.id).sort((a, b) => new Date(b.date) - new Date(a.date))
  const myLedger = ledger.filter((e) => e.patientId === patient.id).sort((a, b) => new Date(b.date) - new Date(a.date))
  const expiring = expiringForPatient(patient.id, ledger, 30).sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))
  const nextExpiry = expiring[0]

  return (
    <div>
      <PageHeader
        title={`Hello, ${patient.name.split(' ')[0]}`}
        description="Here's a snapshot of your purchases, rewards and upcoming expiries."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0" hover>
          <Wallet size={20} className="mb-3 text-brand-100" />
          <p className="text-sm text-brand-100">Available balance</p>
          <p className="text-3xl font-semibold mt-1">{patient.creditBalance}</p>
          <p className="text-xs text-brand-100/80 mt-1">credits</p>
        </Card>
        <Card className="p-6" delay={0.05}>
          <Clock size={20} className="mb-3 text-amber-500" />
          <p className="text-sm text-ink-500">Next expiry</p>
          {nextExpiry ? (
            <>
              <p className="text-3xl font-semibold text-ink-900 mt-1">
                {daysUntil(nextExpiry.expiry)} <span className="text-base font-normal text-ink-400">days</span>
              </p>
              <p className="text-xs text-ink-400 mt-1">{nextExpiry.amount} credits on {formatDate(nextExpiry.expiry)}</p>
            </>
          ) : (
            <p className="text-lg font-medium text-ink-400 mt-2">No credits expiring soon</p>
          )}
        </Card>
        <Card className="p-6" delay={0.1}>
          <History size={20} className="mb-3 text-accent-500" />
          <p className="text-sm text-ink-500">Lifetime purchases</p>
          <p className="text-3xl font-semibold text-ink-900 mt-1">{myBills.length}</p>
          <p className="text-xs text-ink-400 mt-1">{formatCurrency(myBills.reduce((a, b) => a + b.amount, 0))} total billed</p>
        </Card>
      </div>

      {nextExpiry && daysUntil(nextExpiry.expiry) <= 7 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6 flex items-center gap-2.5 text-sm text-amber-800">
          <Sparkles size={16} className="shrink-0" />
          {nextExpiry.amount} credits expire on {formatDate(nextExpiry.expiry)}. Redeem them on your next visit before they lapse.
          <Link to="/patient/redeem" className="ml-auto font-medium underline shrink-0">
            Redeem now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">Recent purchases</h3>
            <Link to="/patient/purchases" className="text-xs font-medium text-brand-600 inline-flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {myBills.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{b.items.map((it) => it.name).join(', ')}</p>
                  <p className="text-xs text-ink-400">
                    {b.id} · {formatDate(b.date)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-ink-900 shrink-0">{formatCurrency(b.amount)}</p>
              </div>
            ))}
            {myBills.length === 0 && <p className="text-sm text-ink-400">No purchases yet.</p>}
          </div>
        </Card>

        <Card className="p-5" delay={0.1}>
          <div className="flex items-center gap-2 mb-4">
            <Gift size={16} className="text-ink-400" />
            <h3 className="font-semibold text-ink-900">Credit activity</h3>
          </div>
          <div className="space-y-3">
            {myLedger.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">{e.type}</p>
                  <p className="text-xs text-ink-400">{e.ref} · {formatDate(e.date)}</p>
                </div>
                <Badge tone={e.amount >= 0 ? 'brand' : 'rose'}>{e.amount >= 0 ? `+${e.amount}` : e.amount}</Badge>
              </div>
            ))}
            {myLedger.length === 0 && <p className="text-sm text-ink-400">No credit activity yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
