import { hospital } from '../../data/seedData'
import { formatCurrency, formatDate } from '../../lib/format'
import logoFull from '../../assets/logo-full.png'

export default function Receipt({ bill, patient, branch, validityDays = 30 }) {
  const payable = Math.max(bill.amount - (bill.redeemed ?? 0), 0)
  const expiry = new Date(bill.date)
  expiry.setDate(expiry.getDate() + validityDays)

  return (
    <div id="printable-receipt" className="bg-white text-ink-900 p-8 text-sm">
      <div className="flex items-start justify-between border-b border-ink-200 pb-5">
        <div>
          <img src={logoFull} alt={hospital.name} className="h-14 object-contain mb-2" />
          <p className="text-xs text-ink-500 max-w-[280px] leading-relaxed">{hospital.address}</p>
          <p className="text-xs text-ink-500">
            {hospital.phone} · {hospital.email}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-semibold tracking-wide">RECEIPT</p>
          <p className="text-xs text-ink-500 mt-1">Invoice No: {bill.id}</p>
          <p className="text-xs text-ink-500">Date: {formatDate(bill.date)}</p>
          {branch && <p className="text-xs text-ink-500">Branch: {branch.name}</p>}
          <p className="text-[11px] text-ink-400 mt-1">GSTIN: {hospital.gstin}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-b border-ink-100">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 mb-1">Billed to</p>
          <p className="font-medium">{patient?.name}</p>
          <p className="text-xs text-ink-500">{patient?.id}</p>
          <p className="text-xs text-ink-500">{patient?.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 mb-1">Payment</p>
          <p className="font-medium uppercase">{bill.paymentMethod}</p>
          {bill.paymentRef && <p className="text-xs text-ink-500 font-mono">{bill.paymentRef}</p>}
          <p className="text-xs text-ink-500">Served by: {bill.createdBy}</p>
        </div>
      </div>

      <table className="w-full text-xs mt-4">
        <thead>
          <tr className="border-b border-ink-200 text-ink-500 uppercase text-[10px] tracking-wide">
            <th className="text-left py-2">#</th>
            <th className="text-left py-2">Item</th>
            <th className="text-left py-2">Unit</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((it, i) => (
            <tr key={i} className="border-b border-ink-50">
              <td className="py-2 text-ink-400">{i + 1}</td>
              <td className="py-2 font-medium">{it.name}</td>
              <td className="py-2 text-ink-500">{it.unit}</td>
              <td className="py-2 text-right">{it.qty}</td>
              <td className="py-2 text-right">{formatCurrency(it.price)}</td>
              <td className="py-2 text-right font-medium">{formatCurrency(it.qty * it.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>{formatCurrency(bill.amount)}</span>
          </div>
          <div className="flex justify-between text-ink-600">
            <span>Credits redeemed</span>
            <span>− {bill.redeemed ?? 0}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-ink-200 pt-1.5 mt-1.5">
            <span>Amount paid</span>
            <span>{formatCurrency(payable)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-brand-50 border border-brand-100 px-4 py-3 text-xs text-brand-700">
        <span className="font-semibold">{bill.creditsEarned} credits earned</span> on this purchase — valid until{' '}
        {formatDate(expiry)}.
      </div>

      <div className="flex items-end justify-between mt-10 pt-5 border-t border-dashed border-ink-200">
        <p className="text-[11px] text-ink-400 max-w-xs">
          This is a computer-generated receipt from {hospital.system}. For queries about this bill, contact{' '}
          {hospital.phone}.
        </p>
        <div className="text-center">
          <div className="h-10 w-32 border-b border-ink-300" />
          <p className="text-[10px] text-ink-400 mt-1">Authorized signatory</p>
        </div>
      </div>

      <p className="text-center text-[11px] text-ink-400 mt-6">Thank you for choosing {hospital.name}.</p>
    </div>
  )
}
