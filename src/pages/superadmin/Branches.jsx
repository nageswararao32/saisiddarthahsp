import { useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useCollection } from '../../lib/useCollection'
import { nextId } from '../../lib/storage'

const emptyForm = { name: '', city: '', staff: '', status: 'Active' }

export default function Branches() {
  const { rows, create, update, remove } = useCollection('branches')
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', data }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }
  const openEdit = (row) => {
    setForm({ name: row.name, city: row.city, staff: row.staff, status: row.status })
    setModal({ mode: 'edit', id: row.id })
  }

  const submit = (e) => {
    e.preventDefault()
    if (modal.mode === 'create') {
      create({ id: nextId('BR', rows), ...form, staff: Number(form.staff) || 0 })
    } else {
      update(modal.id, { ...form, staff: Number(form.staff) || 0 })
    }
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Branches & Settings"
        description="Manage hospital branches, staff strength and operating status."
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add branch
          </button>
        }
      />

      <Card className="p-5">
        <Table
          columns={[
            {
              key: 'name',
              header: 'Branch',
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                    <Building2 size={15} />
                  </div>
                  <span className="font-medium text-ink-800">{r.name}</span>
                </div>
              ),
            },
            { key: 'city', header: 'City' },
            { key: 'staff', header: 'Staff' },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <Badge tone={r.status === 'Active' ? 'brand' : 'ink'}>{r.status}</Badge>,
            },
            {
              key: 'actions',
              header: '',
              className: 'text-right',
              render: (r) => (
                <div className="flex justify-end gap-1">
                  <button className="btn-icon" onClick={() => openEdit(r)}>
                    <Pencil size={15} />
                  </button>
                  <button className="btn-icon hover:!text-rose-600" onClick={() => setDeleteTarget(r)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add branch' : 'Edit branch'}
      >
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Branch name">
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="City">
            <input required className="input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </FormField>
          <FormField label="Staff count">
            <input
              type="number"
              min="0"
              className="input"
              value={form.staff}
              onChange={(e) => setForm((f) => ({ ...f, staff: e.target.value }))}
            />
          </FormField>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {modal?.mode === 'create' ? 'Add branch' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Delete branch"
        description={deleteTarget ? `Remove "${deleteTarget.name}" from the system.` : ''}
      />
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
