import clsx from 'clsx'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Card from './Card'

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-50 text-accent-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
}

export default function StatCard({ icon: Icon, label, value, trend, tone = 'brand', delay = 0 }) {
  const isUp = typeof trend === 'number' ? trend >= 0 : null
  return (
    <Card hover delay={delay} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          <p className="text-2xl font-semibold text-ink-900 mt-1.5 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={clsx('h-10 w-10 rounded-xl flex items-center justify-center', tones[tone])}>
            <Icon size={19} strokeWidth={2} />
          </div>
        )}
      </div>
      {trend !== undefined && trend !== null && (
        <div
          className={clsx(
            'mt-3 inline-flex items-center gap-1 text-xs font-medium',
            isUp ? 'text-brand-600' : 'text-rose-500'
          )}
        >
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </Card>
  )
}
