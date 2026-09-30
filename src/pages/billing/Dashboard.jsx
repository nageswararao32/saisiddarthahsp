import { Link } from 'react-router-dom'
import { Receipt, Users, Gift, BellRing, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useCollection } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { sum } from '../../lib/analytics'
import { formatCurrency, formatDate, daysUntil, firstName } from '../../lib/format'

export default function BillingDashboard() {
  const { session } = useAuth()
  const { rows: bills } = useCollection('bills')
  const { rows: patients } = useCollection('patients')
  const { rows: ledger } = useCollection('creditLedger')

  const today = new Date().toISOString().slice(0, 10)
  const todaysBills = bills.filter((b) => b.date === today)
  const todaysSales = sum(todaysBills, (b) => b.amount)

  const expiring = ledger
    .filter((e) => e.type === 'Earned' && e.expiry && daysUntil(e.expiry) >= 0 && daysUntil(e.expiry) <= 7)
    .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))
    .slice(0, 5)
    .map((e) => ({ ...e, patient: patients.find((p) => p.id === e.patientId) }))

  const recentBills = bills
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session?.name?.split(' ')[0] ?? ''}`}
        description="Front-desk, billing and credit-issuance overview for today."
        actions={
          <Link to="/billing/new-bill" className="btn-primary">
            <Receipt size={16} /> New bill
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Receipt} label="Today's bills" value={todaysBills.length} tone="accent" />
        <StatCard icon={Users} label="Total patients" value={patients.length} tone="brand" delay={0.05} />
        <StatCard icon={Gift} label="Today's sales" value={formatCurrency(todaysSales)} tone="amber" delay={0.1} />
        <StatCard icon={BellRing} label="Expiring in 7 days" value={expiring.length} tone="rose" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">Recent bills</h3>
            <Link to="/billing/reports" className="text-xs font-medium text-brand-600 inline-flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentBills.map((b) => {
              const patient = patients.find((p) => p.id === b.patientId)
              return (
                <div key={b.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{patient?.name ?? '—'}</p>
                    <p className="text-xs text-ink-400">
                      {b.id} · {formatDate(b.date)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink-900 shrink-0">{formatCurrency(b.amount)}</p>
                </div>
              )
            })}
            {recentBills.length === 0 && <p className="text-sm text-ink-400">No bills yet.</p>}
          </div>
        </Card>

        <Card className="p-5" delay={0.1}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">Priority: expiring credits</h3>
            <Link to="/billing/retention" className="text-xs font-medium text-brand-600 inline-flex items-center gap-1">
              Manage <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {expiring.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{e.patient?.name ?? '—'}</p>
                  <p className="text-xs text-ink-400">{e.amount} credits</p>
                </div>
                <Badge tone={daysUntil(e.expiry) <= 2 ? 'rose' : 'amber'}>
                  {daysUntil(e.expiry) === 0 ? 'Expires today' : `${daysUntil(e.expiry)}d left`}
                </Badge>
              </div>
            ))}
            {expiring.length === 0 && <p className="text-sm text-ink-400">Nothing expiring this week.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
