import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react'
import { formatCurrency } from '../../lib/format'
import { loadScript } from '../../lib/loadScript'
import { useRecord } from '../../lib/useCollection'
import { hospital } from '../../data/seedData'

const BRANDS = {
  razorpay: { name: 'Razorpay', color: '#3395FF', dark: '#0C2451' },
  cashfree: { name: 'Cashfree Payments', color: '#12B76A', dark: '#0B3B2E' },
}

// Razorpay: opens their REAL hosted checkout in test mode using only the public
// Key ID (their "Standard Checkout" flow doesn't require a server-created order).
// Cashfree: their SDK has required a server-created payment session for years —
// there is no client-only equivalent, so this stays a labeled simulation until
// a backend exists to create that session.
export default function PaymentGatewayModal({ open, gateway, amount, patientName, patientEmail, patientPhone, onClose, onSuccess }) {
  const [settings] = useRecord('paymentSettings', {})
  const [stage, setStage] = useState('form') // cashfree simulation only
  const [razorpayError, setRazorpayError] = useState('')
  const launchedRef = useRef(false)
  const brand = BRANDS[gateway] ?? BRANDS.razorpay

  useEffect(() => {
    if (open) {
      setStage('form')
      setRazorpayError('')
      launchedRef.current = false
    }
  }, [open, gateway])

  useEffect(() => {
    if (!open || gateway !== 'razorpay' || launchedRef.current) return
    launchedRef.current = true

    const launch = async () => {
      const keyId = settings.razorpay?.keyId
      if (!keyId) {
        setRazorpayError('No Razorpay Key ID configured. Set one in Super Admin → Payment Gateways.')
        return
      }
      try {
        await loadScript('https://checkout.razorpay.com/v1/checkout.js')
        const rzp = new window.Razorpay({
          key: keyId,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: hospital.name,
          description: patientName ? `Bill payment — ${patientName}` : 'Bill payment',
          prefill: {
            name: patientName || '',
            email: patientEmail || '',
            contact: (patientPhone || '').replace(/[^\d+]/g, ''),
          },
          theme: { color: brand.color },
          handler: (response) => onSuccess?.(response.razorpay_payment_id),
          modal: { ondismiss: () => onClose?.() },
        })
        rzp.on('payment.failed', (resp) => {
          setRazorpayError(resp.error?.description || 'Payment failed. Please try again.')
        })
        rzp.open()
      } catch {
        setRazorpayError('Could not load Razorpay checkout — check your connection and try again.')
      }
    }
    launch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, gateway])

  // Cashfree simulation only.
  const pay = () => {
    setStage('processing')
    setTimeout(() => {
      setStage('success')
      setTimeout(() => onSuccess?.(`cf_${Math.random().toString(36).slice(2, 12)}`), 700)
    }, 1400)
  }

  if (gateway === 'razorpay') {
    if (!open || !razorpayError) return null
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center"
          >
            <ShieldAlert size={32} className="text-rose-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-800 mb-1">Couldn't open Razorpay checkout</p>
            <p className="text-xs text-ink-500 mb-4">{razorpayError}</p>
            <button className="btn-secondary w-full" onClick={onClose}>
              Close
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/60"
            onClick={stage === 'form' ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white shadow-2xl"
          >
            <div className="px-5 py-4 flex items-center justify-between text-white" style={{ backgroundColor: brand.dark }}>
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: brand.color }}
                >
                  {brand.name[0]}
                </div>
                <span className="text-sm font-semibold">{brand.name}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide bg-white/15 rounded px-1.5 py-0.5">
                  Simulated
                </span>
              </div>
              {stage === 'form' && (
                <button onClick={onClose} className="text-white/70 hover:text-white">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="p-6">
              {stage === 'form' && (
                <>
                  <p className="text-xs text-ink-400 mb-1">Amount payable</p>
                  <p className="text-3xl font-semibold text-ink-900 mb-4">{formatCurrency(amount)}</p>
                  <div className="rounded-lg bg-ink-50 px-3 py-2.5 text-xs text-ink-500 mb-5">
                    Billing to <span className="font-medium text-ink-700">{patientName}</span> · {hospital.name}
                  </div>

                  <div className="space-y-2 mb-5">
                    {['UPI', 'Credit / Debit Card', 'Netbanking'].map((method, i) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2.5 text-sm cursor-pointer has-checked:border-brand-400 has-checked:bg-brand-50"
                      >
                        <input type="radio" name="method" defaultChecked={i === 0} className="accent-brand-600" />
                        {method}
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={pay}
                    className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: brand.color }}
                  >
                    Pay {formatCurrency(amount)}
                  </button>
                  <p className="flex items-center justify-center gap-1 text-[11px] text-ink-300 mt-3">
                    <Lock size={11} /> Simulated — real checkout needs a backend to create the payment session
                  </p>
                </>
              )}

              {stage === 'processing' && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 size={32} className="animate-spin" style={{ color: brand.color }} />
                  <p className="text-sm text-ink-500">Processing your payment…</p>
                </div>
              )}

              {stage === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 gap-3"
                >
                  <CheckCircle2 size={40} className="text-brand-500" />
                  <p className="text-sm font-medium text-ink-800">Payment successful</p>
                  <p className="text-xs text-ink-400">{formatCurrency(amount)} received</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
