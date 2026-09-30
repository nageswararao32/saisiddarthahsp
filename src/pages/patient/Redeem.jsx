import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, CheckCircle2, Ticket } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { useCollection, useRecord } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/format'

export default function Redeem() {
  const { session } = useAuth()
  const { rows: patients, update: updatePatient } = useCollection('patients')
  const { create: createLedgerEntry } = useCollection('creditLedger')
  const [policy] = useRecord('creditPolicy', {})
  const patient = patients.find((p) => p.id === session.patientId)

  const [amount, setAmount] = useState(0)
  const [voucher, setVoucher] = useState(null)

  const redeem = () => {
    if (amount <= 0 || amount > patient.creditBalance) return
    const code = `RDM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    createLedgerEntry({
      id: `CR-${code}`,
      patientId: patient.id,
      date: new Date().toISOString().slice(0, 10),
      type: 'Redeemed',
      ref: code,
      amount: -amount,
      expiry: null,
    })
    updatePatient(patient.id, { creditBalance: patient.creditBalance - amount })
    setVoucher({ code, amount, date: new Date().toISOString().slice(0, 10) })
    setAmount(0)
  }

  if (voucher) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle2 size={44} className="text-brand-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-lg font-semibold text-ink-900">Redemption voucher created</h2>
          <p className="text-sm text-ink-500 mt-1">Show this code at billing on your next visit.</p>
          <div className="mt-5 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 py-5">
            <p className="text-2xl font-mono font-semibold text-brand-700 tracking-wider">{voucher.code}</p>
            <p className="text-sm text-brand-600 mt-1">{voucher.amount} credits · {formatDate(voucher.date)}</p>
          </div>
          <button className="btn-primary w-full mt-6" onClick={() => setVoucher(null)}>
            Redeem more credits
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Redeem Credits" description="Redeem eligible credits toward your next hospital visit." />

      <Card className="p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Gift size={20} />
          </div>
          <div>
            <p className="text-sm text-ink-500">Available balance</p>
            <p className="text-xl font-semibold text-ink-900">{patient.creditBalance} credits</p>
          </div>
        </div>

        <label className="block text-xs font-medium text-ink-600 mb-1.5">Amount to redeem</label>
        <input
          type="range"
          min="0"
          max={patient.creditBalance}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-brand-600"
          disabled={patient.creditBalance === 0}
        />
        <div className="flex items-center justify-between text-sm mt-1.5 mb-5">
          <span className="text-ink-400">0</span>
          <span className="font-semibold text-brand-600">{amount} credits</span>
          <span className="text-ink-400">{patient.creditBalance}</span>
        </div>

        {policy.redemptionCap && (
          <p className="text-xs text-ink-400 mb-4">
            Subject to hospital policy: up to {policy.redemptionCap}% of your bill value may be paid using credits.
          </p>
        )}

        <button disabled={amount <= 0} onClick={redeem} className="btn-primary w-full disabled:opacity-50">
          <Ticket size={16} /> Generate redemption voucher
        </button>
        {patient.creditBalance === 0 && (
          <p className="text-xs text-ink-400 mt-3 text-center">You have no credits available to redeem right now.</p>
        )}
      </Card>
    </div>
  )
}
