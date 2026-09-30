import { useState } from 'react'
import { Receipt, ChevronDown, Printer } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useCollection } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDate } from '../../lib/format'
import ReceiptModal from '../../components/billing/ReceiptModal'

export default function Purchases() {
  const { session } = useAuth()
  const { rows: bills } = useCollection('bills')
  const { rows: patients } = useCollection('patients')
  const [openId, setOpenId] = useState(null)
  const [receiptBill, setReceiptBill] = useState(null)

  const patient = patients.find((p) => p.id === session.patientId)
  const myBills = bills
    .filter((b) => b.patientId === session.patientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div>
      <PageHeader title="Purchase History" description="Every bill, with the item, quantity and amount paid." />

      <div className="space-y-3">
        {myBills.map((bill) => (
          <Card key={bill.id} className="overflow-hidden">
            <button
              className="w-full flex items-center justify-between gap-4 p-4 text-left"
              onClick={() => setOpenId(openId === bill.id ? null : bill.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                  <Receipt size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800">{bill.id}</p>
                  <p className="text-xs text-ink-400">{formatDate(bill.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge tone="brand">+{bill.creditsEarned} credits</Badge>
                <p className="text-sm font-semibold text-ink-900">{formatCurrency(bill.amount)}</p>
                <ChevronDown size={16} className={`text-ink-300 transition-transform ${openId === bill.id ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {openId === bill.id && (
              <div className="px-4 pb-4 border-t border-ink-100 pt-3">
                <table className="w-full text-sm">
                  <tbody>
                    {bill.items.map((it, i) => (
                      <tr key={i} className="border-b border-ink-50 last:border-0">
                        <td className="py-1.5 text-ink-600">{it.name}</td>
                        <td className="py-1.5 text-ink-400 text-right">
                          {it.qty} × {formatCurrency(it.price)}
                        </td>
                        <td className="py-1.5 text-ink-800 text-right font-medium w-24">{formatCurrency(it.qty * it.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bill.redeemed > 0 && (
                  <p className="text-xs text-ink-400 mt-2">{bill.redeemed} credits were redeemed against this bill.</p>
                )}
                <button
                  className="btn-secondary !py-1.5 !px-3 text-xs mt-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    setReceiptBill(bill)
                  }}
                >
                  <Printer size={13} /> Print receipt
                </button>
              </div>
            )}
          </Card>
        ))}
        {myBills.length === 0 && <p className="text-sm text-ink-400">No purchases recorded yet.</p>}
      </div>

      <ReceiptModal open={!!receiptBill} onClose={() => setReceiptBill(null)} bill={receiptBill} patient={patient} />
    </div>
  )
}
