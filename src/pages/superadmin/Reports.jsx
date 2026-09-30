import { useMemo, useState } from 'react'
import { Download, ScrollText, Receipt, IndianRupee, Gift, Printer, ListChecks } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import SegmentedControl from '../../components/ui/SegmentedControl'
import { useCollection } from '../../lib/useCollection'
import { formatCurrency, formatDate } from '../../lib/format'
import { sum, dailyTrend } from '../../lib/analytics'
import ReceiptModal from '../../components/billing/ReceiptModal'

export default function SuperAdminReports() {
  const { rows: bills } = useCollection('bills')
  const { rows: patients } = useCollection('patients')
  const { rows: branches } = useCollection('branches')
  const { rows: auditLog } = useCollection('auditLog')
  const [branchId, setBranchId] = useState('all')
  const [receiptBill, setReceiptBill] = useState(null)

  const filtered = useMemo(
    () => (branchId === 'all' ? bills : bills.filter((b) => b.branchId === branchId)),
    [bills, branchId]
  )

  const branchOptions = [{ value: 'all', label: 'All branches' }, ...branches.map((b) => ({ value: b.id, label: b.city }))]
  const totalSales = sum(filtered, (b) => b.amount)
  const totalCredits = sum(filtered, (b) => b.creditsEarned)
  const trend = useMemo(() => dailyTrend(filtered, 14), [filtered])

  const exportCsv = () => {
    const header = 'Invoice,Patient,Branch,Date,Amount,Credits Earned\n'
    const body = filtered
      .map((b) => {
        const patient = patients.find((p) => p.id === b.patientId)
        const branch = branches.find((br) => br.id === b.branchId)
        return [b.id, patient?.name ?? '', branch?.city ?? '', b.date, b.amount, b.creditsEarned].join(',')
      })
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hospital-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Reports & Audit"
        description="Export operational reports and review the audit trail of key actions."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl options={branchOptions} value={branchId} onChange={setBranchId} />
            <button className="btn-secondary" onClick={exportCsv}>
              <Download size={15} /> Export
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Receipt} label="Bills" value={filtered.length} tone="accent" />
        <StatCard icon={IndianRupee} label="Total billed" value={formatCurrency(totalSales)} tone="brand" delay={0.05} />
        <StatCard icon={Gift} label="Credits issued" value={totalCredits} tone="amber" delay={0.1} />
      </div>

      <Card className="p-5 mb-6">
        <h3 className="font-semibold text-ink-900 mb-1">Sales trend</h3>
        <p className="text-xs text-ink-400 mb-4">Last 14 days{branchId !== 'all' ? ` · ${branches.find((b) => b.id === branchId)?.city}` : ' · all branches'}</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trend} margin={{ left: -20, top: 4, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8892a6' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8892a6' }} width={48} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Billed']}
              contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 12 }}
            />
            <Bar dataKey="amount" fill="#1d74e8" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks size={16} className="text-ink-400" />
          <h3 className="font-semibold text-ink-900">All bills</h3>
        </div>
        <Table
          columns={[
            { key: 'id', header: 'Invoice' },
            { key: 'patient', header: 'Patient', render: (r) => patients.find((p) => p.id === r.patientId)?.name ?? '—' },
            { key: 'branch', header: 'Branch', render: (r) => branches.find((b) => b.id === r.branchId)?.city ?? '—' },
            { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
            { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'creditsEarned', header: 'Credits' },
            {
              key: 'actions',
              header: '',
              className: 'text-right',
              render: (r) => (
                <button className="btn-icon" onClick={() => setReceiptBill(r)}>
                  <Printer size={15} />
                </button>
              ),
            },
          ]}
          rows={filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date))}
          emptyLabel="No bills for this branch."
        />
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <ScrollText size={16} className="text-ink-400" />
          <h3 className="font-semibold text-ink-900">Audit trail</h3>
        </div>
        <div className="space-y-4">
          {auditLog
            .slice()
            .reverse()
            .map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-4 text-sm border-b border-ink-50 last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="text-ink-700">{entry.action}</p>
                  <Badge tone="ink" className="mt-1.5">
                    {entry.actor}
                  </Badge>
                </div>
                <span className="text-xs text-ink-300 shrink-0">{formatDate(entry.time)}</span>
              </div>
            ))}
          {auditLog.length === 0 && <p className="text-sm text-ink-400">No audit activity yet.</p>}
        </div>
      </Card>

      <ReceiptModal
        open={!!receiptBill}
        onClose={() => setReceiptBill(null)}
        bill={receiptBill}
        patient={patients.find((p) => p.id === receiptBill?.patientId)}
      />
    </div>
  )
}
