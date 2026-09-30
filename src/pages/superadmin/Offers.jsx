import { useState } from 'react'
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormField from '../../components/ui/FormField'
import { useCollection } from '../../lib/useCollection'
import { nextId } from '../../lib/storage'
import { formatDate } from '../../lib/format'

const emptyForm = { title: '', description: '', start: '', end: '' }

function statusOf(offer) {
  const today = new Date().toISOString().slice(0, 10)
  if (offer.end < today) return 'Expired'
  if (offer.start > today) return 'Scheduled'
  return 'Active'
}

export default function Offers() {
  const { rows, create, update, remove } = useCollection('offers')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }
  const openEdit = (row) => {
    setForm({ title: row.title, description: row.description, start: row.start, end: row.end })
    setModal({ mode: 'edit', id: row.id })
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = { ...form, status: statusOf(form) }
    if (modal.mode === 'create') {
      create({ id: nextId('OFR', rows), ...payload })
    } else {
      update(modal.id, payload)
    }
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Offers & Campaigns"
        description="Configure promotional campaigns with start and end dates."
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> New offer
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((offer) => (
          <Card key={offer.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="h-9 w-9 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                <Megaphone size={16} />
              </div>
              <Badge tone={statusOf(offer) === 'Active' ? 'brand' : statusOf(offer) === 'Scheduled' ? 'accent' : 'ink'}>
                {statusOf(offer)}
              </Badge>
            </div>
            <h3 className="font-semibold text-ink-900">{offer.title}</h3>
            <p className="text-sm text-ink-500 mt-1">{offer.description}</p>
            <p className="text-xs text-ink-400 mt-3">
              {formatDate(offer.start)} — {formatDate(offer.end)}
            </p>
            <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-ink-100">
              <button className="btn-icon" onClick={() => openEdit(offer)}>
                <Pencil size={15} />
              </button>
              <button className="btn-icon hover:!text-rose-600" onClick={() => setDeleteTarget(offer)}>
                <Trash2 size={15} />
              </button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-ink-400 col-span-2">No offers configured yet.</p>}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'New offer' : 'Edit offer'}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Title">
            <input required className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Description">
            <textarea
              required
              rows={3}
              className="input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date">
              <input
                type="date"
                required
                className="input"
                value={form.start}
                onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
              />
            </FormField>
            <FormField label="End date">
              <input
                type="date"
                required
                className="input"
                value={form.end}
                onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {modal?.mode === 'create' ? 'Create offer' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Delete offer"
        description={deleteTarget ? `Remove "${deleteTarget.title}".` : ''}
      />
    </div>
  )
}
