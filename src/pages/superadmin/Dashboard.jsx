import { IndianRupee, Users, Gift, CircleCheck, Building2, ScrollText } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useCollection } from '../../lib/useCollection'
import { monthlyTrend, creditSummary, branchPerformance, sum } from '../../lib/analytics'
import { formatCurrency, formatNumber, formatDate } from '../../lib/format'

const PIE_COLORS = ['#2c9a5f', '#1d74e8', '#f59e0b']

export default function SuperAdminDashboard() {
  const { rows: bills } = useCollection('bills')
  const { rows: ledger } = useCollection('creditLedger')
  const { rows: patients } = useCollection('patients')
  const { rows: branches } = useCollection('branches')
  const { rows: auditLog } = useCollection('auditLog')

  const totalSales = sum(bills, (b) => b.amount)
  const { issued, redeemed, expiringSoon } = creditSummary(ledger)
  const trend = monthlyTrend(bills, ledger)
  const branchStats = branchPerformance(branches, bills, patients)
  const pieData = [
    { name: 'Issued', value: issued },
    { name: 'Redeemed', value: redeemed },
    { name: 'Expiring soon', value: expiringSoon },
  ]

  return (
    <div>
      <PageHeader
        title="Owner Dashboard"
        description="Configuration, oversight and performance across all branches at a glance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={IndianRupee} label="Total sales" value={formatCurrency(totalSales)} tone="brand" trend={8.4} />
        <StatCard icon={Users} label="Active patients" value={formatNumber(patients.length)} tone="accent" trend={4.1} />
        <StatCard icon={Gift} label="Credits issued" value={formatNumber(issued)} tone="amber" trend={12.7} delay={0.05} />
        <StatCard
          icon={CircleCheck}
          label="Credits redeemed"
          value={formatNumber(redeemed)}
          tone="brand"
          trend={-3.2}
          delay={0.1}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-ink-900">Sales & credits trend</h3>
              <p className="text-xs text-ink-400">Last 6 months across all branches</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ left: -16, top: 10, right: 8 }}>
              <defs>
                <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2c9a5f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2c9a5f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="credits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d74e8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1d74e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8892a6' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8892a6' }} width={48} />
              <Tooltip
                formatter={(value, name) => [name === 'sales' ? formatCurrency(value) : formatNumber(value), name === 'sales' ? 'Sales' : 'Credits']}
                contentStyle={{ borderRadius: 12, border: '1px solid #eceef2', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="sales" stroke="#2c9a5f" strokeWidth={2} fill="url(#sales)" />
              <Area type="monotone" dataKey="credits" stroke="#1d74e8" strokeWidth={2} fill="url(#credits)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5" delay={0.1}>
          <h3 className="font-semibold text-ink-900">Credit flow</h3>
          <p className="text-xs text-ink-400 mb-2">Issued vs. redeemed vs. expiring</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatNumber(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: '#67728a' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-ink-400" />
            <h3 className="font-semibold text-ink-900">Branch performance</h3>
          </div>
          <div className="space-y-3">
            {branchStats.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{b.name}</p>
                  <p className="text-xs text-ink-400">
                    {b.city} · {b.patients} patients · {b.billCount} bills
                  </p>
                </div>
                <p className="text-sm font-semibold text-ink-900 shrink-0">{formatCurrency(b.sales)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" delay={0.1}>
          <div className="flex items-center gap-2 mb-4">
            <ScrollText size={16} className="text-ink-400" />
            <h3 className="font-semibold text-ink-900">Recent audit trail</h3>
          </div>
          <div className="space-y-4">
            {auditLog
              .slice()
              .reverse()
              .slice(0, 4)
              .map((entry) => (
                <div key={entry.id} className="text-sm">
                  <p className="text-ink-700">{entry.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge tone="ink">{entry.actor}</Badge>
                    <span className="text-xs text-ink-300">{formatDate(entry.time)}</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
