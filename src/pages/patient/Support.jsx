import { useState } from 'react'
import { LifeBuoy, Send, Trash2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import FormField from '../../components/ui/FormField'
import { useCollection } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'
import { nextId } from '../../lib/storage'
import { formatDate } from '../../lib/format'

export default function Support() {
  const { session } = useAuth()
  const { rows, create, remove } = useCollection('supportTickets')
  const [form, setForm] = useState({ subject: '', category: 'Billing', message: '' })

  const myTickets = rows
    .filter((t) => t.patientId === session.patientId)
    .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))

  const submit = (e) => {
    e.preventDefault()
    if (!form.subject || !form.message) return
    create({
      id: nextId('TKT', rows),
      patientId: session.patientId,
      ...form,
      status: 'Open',
      createdOn: new Date().toISOString().slice(0, 10),
    })
    setForm({ subject: '', category: 'Billing', message: '' })
  }

  return (
    <div>
      <PageHeader title="Help & Support" description="Questions about bills, credits or redemption? Reach the hospital team here." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-ink-900 mb-4">Raise a request</h3>
          <form onSubmit={submit} className="space-y-4">
            <FormField label="Subject">
              <input
                required
                className="input"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </FormField>
            <FormField label="Category">
              <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                <option>Billing</option>
                <option>Credits & Redemption</option>
                <option>Appointment</option>
                <option>Other</option>
              </select>
            </FormField>
            <FormField label="Message">
              <textarea
                required
                rows={4}
                className="input"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </FormField>
            <button type="submit" className="btn-primary w-full">
              <Send size={15} /> Submit request
            </button>
          </form>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy size={16} className="text-ink-400" />
            <h3 className="font-semibold text-ink-900">Your requests</h3>
          </div>
          <div className="space-y-3">
            {myTickets.map((t) => (
              <div key={t.id} className="rounded-lg border border-ink-100 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{t.subject}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{t.category} · {formatDate(t.createdOn)}</p>
                  </div>
                  <button className="btn-icon hover:!text-rose-600 shrink-0" onClick={() => remove(t.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-ink-600 mt-2">{t.message}</p>
                <Badge tone={t.status === 'Open' ? 'amber' : 'brand'} className="mt-2">
                  {t.status}
                </Badge>
              </div>
            ))}
            {myTickets.length === 0 && <p className="text-sm text-ink-400">No requests raised yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
