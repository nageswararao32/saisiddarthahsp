import { useState } from 'react'
import { ShieldCheck, Info, Eye, EyeOff } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import FormField from '../../components/ui/FormField'
import { useRecord } from '../../lib/useCollection'

export default function PaymentGateways() {
  const [settings, save] = useRecord('paymentSettings', {})
  const [showKeys, setShowKeys] = useState(false)
  const [saved, setSaved] = useState('')

  const razorpay = settings.razorpay ?? { enabled: false, mode: 'test', keyId: '' }
  const cashfree = settings.cashfree ?? { enabled: false, mode: 'test', appId: '' }

  const patch = (gateway, changes) => {
    save({ [gateway]: { ...settings[gateway], ...changes } })
  }

  const flashSaved = (label) => {
    setSaved(label)
    setTimeout(() => setSaved(''), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Payment Gateways"
        description="Connect Razorpay and Cashfree so billing admins can collect the payable balance after credit redemption."
      />

      <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 mb-6 flex items-start gap-2.5 text-sm text-accent-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Secret keys must live on your backend only — never in this frontend. The fields below store the
          public <span className="font-medium">Key ID / App ID</span> only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GatewayCard
          brand="razorpay"
          title="Razorpay"
          tagline="Cards, UPI, netbanking & wallets"
          statusLabel="Live checkout"
          statusTone="brand"
          statusNote="Opens Razorpay's real hosted checkout in test mode — no backend needed for this."
          accent="#3395FF"
          gateway={razorpay}
          idLabel="Key ID"
          idField="keyId"
          showKeys={showKeys}
          onToggleShow={() => setShowKeys((s) => !s)}
          onChange={(changes) => patch('razorpay', changes)}
          onSave={() => flashSaved('Razorpay')}
        />
        <GatewayCard
          brand="cashfree"
          title="Cashfree Payments"
          tagline="UPI, cards & pay-later, India-first"
          statusLabel="Simulated"
          statusTone="amber"
          statusNote="Cashfree's SDK requires a server-created payment session — real checkout needs a small backend."
          accent="#12B76A"
          gateway={cashfree}
          idLabel="App ID"
          idField="appId"
          showKeys={showKeys}
          onToggleShow={() => setShowKeys((s) => !s)}
          onChange={(changes) => patch('cashfree', changes)}
          onSave={() => flashSaved('Cashfree')}
        />
      </div>

      {saved && (
        <p className="mt-4 text-sm text-brand-600 inline-flex items-center gap-1.5">
          <ShieldCheck size={15} /> {saved} settings saved.
        </p>
      )}
    </div>
  )
}

function GatewayCard({
  title,
  tagline,
  accent,
  gateway,
  idLabel,
  idField,
  showKeys,
  onToggleShow,
  onChange,
  onSave,
  statusLabel,
  statusTone,
  statusNote,
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: accent }}
          >
            {title[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink-900">{title}</p>
              {statusLabel && <Badge tone={statusTone}>{statusLabel}</Badge>}
            </div>
            <p className="text-xs text-ink-400">{tagline}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ enabled: !gateway.enabled })}
          className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
            gateway.enabled ? 'bg-brand-500' : 'bg-ink-200'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              gateway.enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="space-y-3">
        <FormField label={idLabel}>
          <div className="relative">
            <input
              type={showKeys ? 'text' : 'password'}
              className="input pr-10 font-mono text-xs"
              value={gateway[idField] ?? ''}
              onChange={(e) => onChange({ [idField]: e.target.value })}
            />
            <button
              type="button"
              onClick={onToggleShow}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
            >
              {showKeys ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </FormField>

        <FormField label="Mode">
          <select className="input" value={gateway.mode} onChange={(e) => onChange({ mode: e.target.value })}>
            <option value="test">Test / Sandbox</option>
            <option value="live">Live</option>
          </select>
        </FormField>

        {statusNote && <p className="text-[11px] text-ink-400 leading-relaxed">{statusNote}</p>}

        <div className="flex items-center justify-between pt-1">
          <Badge tone={gateway.enabled ? 'brand' : 'ink'}>{gateway.enabled ? 'Enabled' : 'Disabled'}</Badge>
          <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </Card>
  )
}
