import { AnimatePresence, motion } from 'framer-motion'
import { X, Printer } from 'lucide-react'
import Receipt from './Receipt'
import { useCollection, useRecord } from '../../lib/useCollection'

export default function ReceiptModal({ open, onClose, bill, patient }) {
  const { rows: branches } = useCollection('branches')
  const [policy] = useRecord('creditPolicy', {})
  const branch = branches.find((b) => b.id === (bill?.branchId ?? patient?.branchId))

  return (
    <AnimatePresence>
      {open && bill && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/50 backdrop-blur-[2px] print:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl print:shadow-none print:max-w-none"
          >
            <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-3 print:hidden">
              <p className="text-sm font-medium text-ink-700">Bill receipt · {bill.id}</p>
              <div className="flex items-center gap-2">
                <button className="btn-primary !py-2" onClick={() => window.print()}>
                  <Printer size={15} /> Print receipt
                </button>
                <button onClick={onClose} className="btn-icon">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
              <Receipt bill={bill} patient={patient} branch={branch} validityDays={policy.validityDays ?? 30} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
