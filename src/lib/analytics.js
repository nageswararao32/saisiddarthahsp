import { daysUntil } from './format'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function sum(arr, pick) {
  return arr.reduce((acc, item) => acc + (pick ? pick(item) : item), 0)
}

export function monthlyTrend(bills, ledger, months = 6) {
  const buckets = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTH_LABELS[d.getMonth()], sales: 0, credits: 0 })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))

  bills.forEach((bill) => {
    const d = new Date(bill.date)
    const k = `${d.getFullYear()}-${d.getMonth()}`
    if (byKey[k]) byKey[k].sales += bill.amount
  })
  ledger.forEach((entry) => {
    if (entry.type !== 'Earned') return
    const d = new Date(entry.date)
    const k = `${d.getFullYear()}-${d.getMonth()}`
    if (byKey[k]) byKey[k].credits += entry.amount
  })

  return buckets
}

export function creditSummary(ledger) {
  const issued = sum(ledger.filter((e) => e.type === 'Earned'), (e) => e.amount)
  const redeemed = Math.abs(sum(ledger.filter((e) => e.type === 'Redeemed'), (e) => e.amount))
  const expiringSoon = sum(
    ledger.filter((e) => e.type === 'Earned' && e.expiry && daysUntil(e.expiry) >= 0 && daysUntil(e.expiry) <= 7),
    (e) => e.amount
  )
  const expired = Math.abs(sum(ledger.filter((e) => e.type === 'Expired'), (e) => e.amount))
  return { issued, redeemed, expiringSoon, expired }
}

export function branchPerformance(branches, bills, patients) {
  return branches.map((branch) => {
    const branchBills = bills.filter((b) => b.branchId === branch.id)
    return {
      ...branch,
      sales: sum(branchBills, (b) => b.amount),
      billCount: branchBills.length,
      patients: patients.filter((p) => p.branchId === branch.id).length,
    }
  })
}

export function patientCreditBalance(patientId, ledger) {
  return sum(
    ledger.filter((e) => e.patientId === patientId),
    (e) => e.amount
  )
}

export function dailyTrend(bills, days = 14) {
  const buckets = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets.push({ key, label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), amount: 0 })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
  bills.forEach((bill) => {
    if (byKey[bill.date]) byKey[bill.date].amount += bill.amount
  })
  return buckets
}

export function expiringForPatient(patientId, ledger, withinDays = 30) {
  return ledger.filter(
    (e) =>
      e.patientId === patientId &&
      e.type === 'Earned' &&
      e.expiry &&
      daysUntil(e.expiry) >= 0 &&
      daysUntil(e.expiry) <= withinDays
  )
}
