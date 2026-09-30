import { useMemo, useState } from 'react'
import { Phone, CheckCircle2, Circle, Search, Users } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import ContactIcons from '../../components/shared/ContactIcons'
import PatientDetailModal from '../../components/shared/PatientDetailModal'
import { useCollection } from '../../lib/useCollection'
import { useSendReminder } from '../../lib/useSendReminder'
import { daysUntil, formatDate } from '../../lib/format'

export default function Retention() {
  const { rows: ledger, update } = useCollection('creditLedger')
  const { rows: patients } = useCollection('patients')
  const sendReminder = useSendReminder()
  const [query, setQuery] = useState('')
  const [window, setWindow] = useState(30)
  const [detailPatient, setDetailPatient] = useState(null)

  const expiring = useMemo(() => {
    return ledger
      .filter((e) => e.type === 'Earned' && e.expiry && daysUntil(e.expiry) >= 0 && daysUntil(e.expiry) <= window)
      .map((e) => ({ ...e, patient: patients.find((p) => p.id === e.patientId) }))
      .filter((e) => e.patient)
      .filter((e) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return e.patient.name.toLowerCase().includes(q) || e.patient.phone.includes(q)
      })
      .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))
  }, [ledger, patients, query, window])

  const urgentCount = expiring.filter((e) => daysUntil(e.expiry) <= 7).length

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        description="Prioritize patients whose credit lots are approaching expiry and reach out before they lapse."
        actions={
          urgentCount > 0 && (
            <Badge tone="rose">
              <Users size={12} /> {urgentCount} need contact within 7 days
            </Badge>
          )
        }
      />

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              className="input pl-9"
              placeholder="Search patient by name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="input sm:w-48" value={window} onChange={(e) => setWindow(Number(e.target.value))}>
            <option value={7}>Final week (7 days)</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
        </div>

        <Table
          columns={[
            {
              key: 'patient',
              header: 'Patient',
              render: (r) => (
                <button
                  onClick={() => setDetailPatient(r.patient)}
                  className="text-left hover:text-brand-700 transition-colors"
                >
                  <p className="font-medium text-ink-800">{r.patient.name}</p>
                  <p className="text-xs text-ink-400 inline-flex items-center gap-1">
                    <Phone size={11} /> {r.patient.phone}
                  </p>
                </button>
              ),
            },
            { key: 'amount', header: 'Credits', render: (r) => <Badge tone="brand">{r.amount}</Badge> },
            { key: 'expiry', header: 'Expiry date', render: (r) => formatDate(r.expiry) },
            {
              key: 'daysLeft',
              header: 'Time left',
              render: (r) => (
                <Badge tone={daysUntil(r.expiry) <= 2 ? 'rose' : daysUntil(r.expiry) <= 7 ? 'amber' : 'ink'}>
                  {daysUntil(r.expiry) === 0 ? 'Expires today' : `${daysUntil(r.expiry)} days`}
                </Badge>
              ),
            },
            {
              key: 'contact',
              header: 'Reminder',
              render: (r) =>
                daysUntil(r.expiry) <= 7 ? (
                  <ContactIcons
                    patient={r.patient}
                    entry={r}
                    size="sm"
                    onSent={(channel, message) => sendReminder(r.patient, r, channel, message)}
                  />
                ) : (
                  <span className="text-xs text-ink-300">Not urgent yet</span>
                ),
            },
            {
              key: 'contacted',
              header: 'Follow-up',
              render: (r) => (
                <button
                  onClick={() => update(r.id, { contacted: !r.contacted })}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 transition-colors ${
                    r.contacted ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                  }`}
                >
                  {r.contacted ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                  {r.contacted ? 'Contacted' : 'Mark contacted'}
                </button>
              ),
            },
          ]}
          rows={expiring}
          emptyLabel="No credit lots expiring in this window."
        />
      </Card>

      <PatientDetailModal open={!!detailPatient} onClose={() => setDetailPatient(null)} patient={detailPatient} />
    </div>
  )
}
