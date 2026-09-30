import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Minus,
  Trash2,
  Wallet,
  Receipt,
  CreditCard,
  Landmark,
  Smartphone,
  CheckCircle2,
  Printer,
  Building2,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import ContactIcons from '../shared/ContactIcons'
import { useCollection, useRecord } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { useSendReminder } from '../../lib/useSendReminder'
import { nextId } from '../../lib/storage'
import { formatCurrency, daysUntil } from '../../lib/format'
import { expiringForPatient } from '../../lib/analytics'
import PaymentGatewayModal from './PaymentGatewayModal'
import ReceiptModal from './ReceiptModal'
import MedicinePicker from './MedicinePicker'

const PAY_METHODS = [
  { key: 'cash', label: 'Cash', icon: Landmark },
  { key: 'upi', label: 'UPI', icon: Smartphone },
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'razorpay', label: 'Razorpay', icon: CreditCard },
  { key: 'cashfree', label: 'Cashfree', icon: CreditCard },
]

export default function BillModal({ open, onClose, patient }) {
  const { session } = useAuth()
  const { rows: catalog } = useCollection('catalog')
  const { rows: bills, create: createBill } = useCollection('bills')
  const { rows: ledger, create: createLedgerEntry } = useCollection('creditLedger')
  const { rows: branches } = useCollection('branches')
  const { update: updatePatient } = useCollection('patients')
  const { create: pushAudit } = useCollection('auditLog')
  const [policy] = useRecord('creditPolicy', {})
  const sendReminder = useSendReminder()

  const [items, setItems] = useState([])
  const [redeemAmount, setRedeemAmount] = useState(0)
  const [method, setMethod] = useState('cash')
  const [gatewayOpen, setGatewayOpen] = useState(false)
  const [completedBill, setCompletedBill] = useState(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  if (!patient) return null

  const branch = branches.find((b) => b.id === patient.branchId)
  const subtotal = items.reduce((acc, it) => acc + it.qty * it.price, 0)
  const creditsEarned = Math.round(items.reduce((acc, it) => acc + it.qty * it.price * (it.creditRate / 100), 0))
  const maxRedeemable = Math.min(
    patient.creditBalance,
    policy.partialRedemption === false ? patient.creditBalance : Math.floor((subtotal * (policy.redemptionCap ?? 100)) / 100)
  )
  const payable = Math.max(subtotal - redeemAmount, 0)
  const nextExpiring = expiringForPatient(patient.id, ledger, 7).sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))[0]

  const addItem = (catalogItem, qty = 1) => {
    if (!catalogItem || qty < 1) return
    setItems((prev) => {
      const existing = prev.find((it) => it.catalogId === catalogItem.id)
      if (existing) {
        return prev.map((it) => (it.catalogId === catalogItem.id ? { ...it, qty: it.qty + qty } : it))
      }
      return [
        ...prev,
        {
          catalogId: catalogItem.id,
          name: catalogItem.name,
          unit: catalogItem.unit,
          price: catalogItem.price,
          creditRate: catalogItem.creditRate,
          qty,
        },
      ]
    })
  }

  const setItemQty = (catalogId, qty) =>
    setItems((prev) => prev.map((it) => (it.catalogId === catalogId ? { ...it, qty: Math.max(1, qty) } : it)))

  const removeItem = (catalogId) => setItems((prev) => prev.filter((it) => it.catalogId !== catalogId))

  const finalize = (paymentRef) => {
    const billId = nextId('INV', bills)
    const record = {
      id: billId,
      patientId: patient.id,
      branchId: patient.branchId,
      date: new Date().toISOString().slice(0, 10),
      items: items.map(({ catalogId, name, qty, unit, price }) => ({ catalogId, name, qty, unit, price })),
      amount: subtotal,
      creditsEarned,
      redeemed: redeemAmount,
      paymentMethod: method,
      paymentRef: paymentRef ?? null,
      createdBy: session?.name,
    }
    createBill(record)

    if (redeemAmount > 0) {
      createLedgerEntry({
        id: `CR-${billId}-redeem`,
        patientId: patient.id,
        date: record.date,
        type: 'Redeemed',
        ref: billId,
        amount: -redeemAmount,
        expiry: null,
      })
    }
    if (creditsEarned > 0) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + (policy.validityDays ?? 30))
      createLedgerEntry({
        id: `CR-${billId}-earn`,
        patientId: patient.id,
        date: record.date,
        type: 'Earned',
        ref: billId,
        amount: creditsEarned,
        expiry: expiry.toISOString().slice(0, 10),
      })
    }

    updatePatient(patient.id, { creditBalance: patient.creditBalance - redeemAmount + creditsEarned })
    pushAudit({
      id: `AUD-${billId}`,
      actor: `Billing Admin · ${session?.name}`,
      action: `Created bill ${billId} for ${patient.name} (${formatCurrency(subtotal)})`,
      time: record.date,
    })

    setCompletedBill(record)
  }

  const submitBill = () => {
    if (items.length === 0) return
    if (payable > 0 && (method === 'razorpay' || method === 'cashfree')) {
      setGatewayOpen(true)
    } else {
      finalize(method === 'cash' ? null : `${method}_${Math.random().toString(36).slice(2, 10)}`)
    }
  }

  const handleClose = () => {
    setItems([])
    setRedeemAmount(0)
    setMethod('cash')
    setCompletedBill(null)
    onClose()
  }

  const footer =
    !completedBill && nextExpiring ? (
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-500">
          <span className="font-medium text-rose-600">{nextExpiring.amount} credits</span> expire{' '}
          {daysUntil(nextExpiring.expiry) === 0 ? 'today' : `in ${daysUntil(nextExpiring.expiry)} days`} — send a reminder:
        </p>
        <ContactIcons
          patient={patient}
          entry={nextExpiring}
          size="sm"
          onSent={(channel, message) => sendReminder(patient, nextExpiring, channel, message)}
        />
      </div>
    ) : undefined

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={completedBill ? 'Bill created' : `Bill · ${patient.name}`}
        description={completedBill ? completedBill.id : `${patient.id} · ${patient.phone}`}
        width="max-w-2xl"
        footer={footer}
      >
        {completedBill ? (
          <div className="text-center py-2">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle2 size={44} className="text-brand-500 mx-auto mb-4" />
            </motion.div>
            <p className="text-sm text-ink-500">Bill created successfully for {patient.name}.</p>
            <div className="mt-5 rounded-xl bg-ink-50 p-5 text-left text-sm space-y-2 max-w-sm mx-auto">
              <Row label="Amount billed" value={formatCurrency(completedBill.amount)} />
              <Row label="Credits redeemed" value={completedBill.redeemed} />
              <Row label="Credits earned" value={completedBill.creditsEarned} />
              <Row label="Payment method" value={completedBill.paymentMethod.toUpperCase()} />
            </div>
            <div className="flex gap-2 mt-6 max-w-sm mx-auto">
              <button className="btn-secondary flex-1" onClick={() => setReceiptOpen(true)}>
                <Printer size={15} /> Print receipt
              </button>
              <button className="btn-primary flex-1" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-ink-100 px-4 py-3">
              <div className="flex items-center gap-1.5 text-sm text-ink-600">
                <Building2 size={14} className="text-ink-400" /> {branch?.name ?? '—'}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
                <Wallet size={14} /> {patient.creditBalance} credits available
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900 mb-2">Bill items</p>
              <div className="mb-3">
                <MedicinePicker catalog={catalog} onAdd={addItem} />
              </div>

              <div className="divide-y divide-ink-50 rounded-lg border border-ink-100">
                {items.map((it) => (
                  <div key={it.catalogId} className="flex items-center justify-between px-3 py-2.5 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">{it.name}</p>
                      <p className="text-xs text-ink-400">
                        {formatCurrency(it.price)} ({it.unit})
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="btn-icon !p-1.5"
                        onClick={() => setItemQty(it.catalogId, it.qty - 1)}
                        disabled={it.qty <= 1}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-ink-800">{it.qty}</span>
                      <button className="btn-icon !p-1.5" onClick={() => setItemQty(it.catalogId, it.qty + 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-ink-900 w-20 text-right shrink-0">
                      {formatCurrency(it.qty * it.price)}
                    </p>
                    <button className="btn-icon hover:!text-rose-600 shrink-0" onClick={() => removeItem(it.catalogId)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {items.length === 0 && <p className="text-sm text-ink-400 px-3 py-4">No items added yet — search above to add a medicine or service.</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm font-semibold text-ink-900 mb-2">Redeem credits</p>
                <p className="text-xs text-ink-400 mb-2">
                  Eligible up to {maxRedeemable} credits {policy.redemptionCap ? `(cap ${policy.redemptionCap}% of bill)` : ''}
                </p>
                <input
                  type="range"
                  min="0"
                  max={maxRedeemable}
                  value={Math.min(redeemAmount, maxRedeemable)}
                  onChange={(e) => setRedeemAmount(Number(e.target.value))}
                  className="w-full accent-brand-600"
                  disabled={maxRedeemable === 0}
                />
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-ink-400">0</span>
                  <span className="font-semibold text-brand-600">{redeemAmount} credits</span>
                  <span className="text-ink-400">{maxRedeemable}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink-900 mb-2">Payment method</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PAY_METHODS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                        method === m.key ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <m.icon size={13} /> {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-ink-50 p-4 space-y-2">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row label="Credits redeemed" value={`− ${redeemAmount}`} />
              <div className="border-t border-ink-200 pt-2">
                <Row label="Payable now" value={formatCurrency(payable)} strong />
              </div>
              <Row label="Credits earned" value={<Badge tone="brand">+{creditsEarned}</Badge>} />
            </div>

            <button
              disabled={items.length === 0}
              onClick={submitBill}
              className="btn-primary w-full disabled:opacity-50"
            >
              <Receipt size={16} /> Create bill & collect payment
            </button>
          </div>
        )}
      </Modal>

      <PaymentGatewayModal
        open={gatewayOpen}
        gateway={method}
        amount={payable}
        patientName={patient.name}
        patientEmail={patient.email}
        patientPhone={patient.phone}
        onClose={() => setGatewayOpen(false)}
        onSuccess={(ref) => {
          setGatewayOpen(false)
          finalize(ref)
        }}
      />

      <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} bill={completedBill} patient={patient} />
    </>
  )
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-500">{label}</span>
      <span className={strong ? 'text-base font-semibold text-ink-900' : 'text-sm font-medium text-ink-700'}>{value}</span>
    </div>
  )
}
