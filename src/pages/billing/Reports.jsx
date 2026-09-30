import { useMemo, useState } from 'react'
import { Download, Receipt, Gift, IndianRupee, Printer, ListChecks } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import StatCard from '../../components/ui/StatCard'
import SegmentedControl from '../../components/ui/SegmentedControl'
import { useCollection } from '../../lib/useCollection'
import { formatCurrency, formatDate } from '../../lib/format'
import { sum, dailyTrend } from '../../lib/analytics'
import ReceiptModal from '../../components/billing/ReceiptModal'

const RANGES = { today: 1, week: 7, month: 30, all: Infinity }
const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: '7 days' },
  { value: 'month', label: '30 days' },
  { value: 'all', label: 'All time' },
]

export default function BillingReports() {
  const { rows: bills } = useCollection('bills')
  const { rows: patients } = useCollection('patients')
  const [range, setRange] = useState('week')
  const [receiptBill, setReceiptBill] = useState(null)

  const filtered = useMemo(() => {
    const days = RANGES[range]
    if (days === Infinity) return bills
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return bills.filter((b) => new Date(b.date) >= cutoff)
  }, [bills, range])

  const totalSales = sum(filtered, (b) => b.amount)
  const totalCredits = sum(filtered, (b) => b.creditsEarned)
  const trend = useMemo(() => dailyTrend(bills, range === 'today' ? 7 : Math.min(RANGES[range] || 14, 30)), [bills, range])

  const exportCsv = () => {
    const header = 'Invoice,Patient,Date,Amount,Credits Earned,Payment Method\n'
    const body = filtered
      .map((b) => {
        const patient = patients.find((p) => p.id === b.patientId)
        return [b.id, patient?.name ?? '', b.date, b.amount, b.creditsEarned, b.paymentMethod].join(',')
      })
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billing-report-${range}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Daily & Monthly Reports"
        description="Billing, credit issuance and follow-up activity for your branch."
        actions={
          <div className="flex items-center gap-2">
            <SegmentedControl options={RANGE_OPTIONS} value={range} onChange={setRange} />
            <button className="btn-secondary" onClick={exportCsv}>
              <Download size={15} /> Export
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Receipt} label="Bills generated" value={filtered.length} tone="accent" />
        <StatCard icon={IndianRupee} label="Total billed" value={formatCurrency(totalSales)} tone="brand" delay={0.05} />
        <StatCard icon={Gift} label="Credits issued" value={totalCredits} tone="amber" delay={0.1} />
      </div>

      <Card className="p-5 mb-6">
        <h3 className="font-semibold text-ink-900 mb-1">Sales trend</h3>
        <p className="text-xs text-ink-400 mb-4">Daily billed amount</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trend} margin={{ left: -20, top: 4, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8892a6' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8892a6' }} width={48} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Billed']}
              contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 12 }}
            />
            <Bar dataKey="amount" fill="#2c9a5f" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks size={16} className="text-ink-400" />
          <h3 className="font-semibold text-ink-900">Transactions</h3>
        </div>
        <Table
          columns={[
            { key: 'id', header: 'Invoice' },
            {
              key: 'patient',
              header: 'Patient',
              render: (r) => patients.find((p) => p.id === r.patientId)?.name ?? '—',
            },
            { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
            { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'creditsEarned', header: 'Credits earned' },
            { key: 'paymentMethod', header: 'Payment', render: (r) => r.paymentMethod?.toUpperCase() },
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
          emptyLabel="No bills in this range."
        />
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
