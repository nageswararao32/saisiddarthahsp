import { useState } from 'react'
import { ShieldCheck, Save } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import { useRecord } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/format'

export default function CreditPolicy() {
  const { session } = useAuth()
  const [policy, save] = useRecord('creditPolicy', {})
  const [form, setForm] = useState(policy)
  const [saved, setSaved] = useState(false)

  const current = Object.keys(form).length ? form : policy

  const set = (patch) => setForm((f) => ({ ...(Object.keys(f).length ? f : policy), ...patch }))

  const submit = (e) => {
    e.preventDefault()
    save({ ...current, updatedOn: new Date().toISOString().slice(0, 10), updatedBy: session?.name })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Credit Policy"
        description="Earning rules, validity period, eligibility and redemption limits — applied hospital-wide."
      />

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-ink-900 mb-4">Earning formula (% of bill value)</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Medicines">
              <input
                type="number"
                className="input"
                value={current.medicineRate ?? ''}
                onChange={(e) => set({ medicineRate: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Consultations / services">
              <input
                type="number"
                className="input"
                value={current.serviceRate ?? ''}
                onChange={(e) => set({ serviceRate: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Lab tests">
              <input
                type="number"
                className="input"
                value={current.testRate ?? ''}
                onChange={(e) => set({ testRate: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Scans">
              <input
                type="number"
                className="input"
                value={current.scanRate ?? ''}
                onChange={(e) => set({ scanRate: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <h3 className="font-semibold text-ink-900 mt-6 mb-4">Redemption rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Validity period (days)">
              <input
                type="number"
                className="input"
                value={current.validityDays ?? ''}
                onChange={(e) => set({ validityDays: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Minimum bill for credit (₹)">
              <input
                type="number"
                className="input"
                value={current.minBillForCredit ?? ''}
                onChange={(e) => set({ minBillForCredit: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Redemption cap (% of bill)">
              <input
                type="number"
                className="input"
                value={current.redemptionCap ?? ''}
                onChange={(e) => set({ redemptionCap: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Partial redemption">
              <select
                className="input"
                value={current.partialRedemption ? 'yes' : 'no'}
                onChange={(e) => set({ partialRedemption: e.target.value === 'yes' })}
              >
                <option value="yes">Allowed</option>
                <option value="no">Full redemption only</option>
              </select>
            </FormField>
          </div>

          <button type="submit" className="btn-primary mt-6">
            <Save size={15} /> Save policy
          </button>
          {saved && <span className="ml-3 text-sm text-brand-600">Saved.</span>}
        </Card>

        <Card className="p-5 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-brand-600" />
            <h3 className="font-semibold text-ink-900">Policy summary</h3>
          </div>
          <ul className="text-sm text-ink-600 space-y-2.5">
            <li>Credits post with source bill, earned date and an expiry of purchase date + {current.validityDays ?? '—'} days.</li>
            <li>Bills under ₹{current.minBillForCredit ?? 0} do not qualify for credits.</li>
            <li>Up to {current.redemptionCap ?? '—'}% of a bill can be paid using credits.</li>
            <li>{current.partialRedemption ? 'Patients may redeem any amount up to the eligible cap.' : 'Patients must redeem the full eligible amount, or none.'}</li>
          </ul>
          {policy.updatedOn && (
            <p className="text-xs text-ink-400 mt-4 pt-4 border-t border-ink-100">
              Last updated {formatDate(policy.updatedOn)} by {policy.updatedBy}
            </p>
          )}
        </Card>
      </form>
    </div>
  )
}
