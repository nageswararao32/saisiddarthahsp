import { useMemo, useState } from 'react'
import { Search, Receipt, UserRound } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useCollection } from '../../lib/useCollection'
import { expiringForPatient } from '../../lib/analytics'
import { daysUntil, formatDate } from '../../lib/format'
import BillModal from '../../components/billing/BillModal'

export default function NewBill() {
  const { rows: patients } = useCollection('patients')
  const { rows: branches } = useCollection('branches')
  const { rows: ledger } = useCollection('creditLedger')
  const [query, setQuery] = useState('')
  const [billingPatientId, setBillingPatientId] = useState(null)

  const branchName = (id) => branches.find((b) => b.id === id)?.city ?? '—'

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? patients.filter(
          (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.id.toLowerCase().includes(q)
        )
      : patients

    return filtered.map((p) => {
      const next = expiringForPatient(p.id, ledger, 30).sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))[0]
      return { ...p, nextExpiry: next }
    })
  }, [patients, ledger, query])

  const billingPatient = patients.find((p) => p.id === billingPatientId)

  return (
    <div>
      <PageHeader title="New Bill" description="Pick a patient to create a bill, apply eligible credits, and collect payment." />

      <Card className="p-5">
        <div className="relative mb-4 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            className="input pl-9"
            placeholder="Search by name, phone or patient ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Table
          columns={[
            {
              key: 'patient',
              header: 'Patient',
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                    <UserRound size={15} />
                  </div>
                  <div>
                    <p className="font-medium text-ink-800">{r.name}</p>
                    <p className="text-xs text-ink-400">{r.id} · {r.phone}</p>
                  </div>
                </div>
              ),
            },
            { key: 'branch', header: 'Branch', render: (r) => branchName(r.branchId) },
            {
              key: 'balance',
              header: 'Credit balance',
              render: (r) => <span className="font-medium text-brand-700">{r.creditBalance}</span>,
            },
            {
              key: 'nextExpiry',
              header: 'Next expiry',
              render: (r) =>
                r.nextExpiry ? (
                  <Badge tone={daysUntil(r.nextExpiry.expiry) <= 7 ? 'rose' : 'ink'}>
                    {r.nextExpiry.amount} credits · {formatDate(r.nextExpiry.expiry)}
                  </Badge>
                ) : (
                  <span className="text-xs text-ink-300">—</span>
                ),
            },
            {
              key: 'actions',
              header: '',
              className: 'text-right',
              render: (r) => (
                <button className="btn-primary !py-1.5 !px-3.5 text-xs" onClick={() => setBillingPatientId(r.id)}>
                  <Receipt size={13} /> Bill now
                </button>
              ),
            },
          ]}
          rows={rows}
          emptyLabel="No patients match your search."
        />
      </Card>

      <BillModal open={!!billingPatient} onClose={() => setBillingPatientId(null)} patient={billingPatient} />
    </div>
  )
}
