import { useState } from 'react'
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormField from '../../components/ui/FormField'
import { useCollection } from '../../lib/useCollection'
import { nextId } from '../../lib/storage'

const emptyForm = { name: '', email: '', role: 'Billing Admin', branchId: '', status: 'Active' }

export default function Users() {
  const { rows, create, update, remove } = useCollection('staff')
  const { rows: branches } = useCollection('branches')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const branchName = (id) => branches.find((b) => b.id === id)?.name ?? '—'

  const openCreate = () => {
    setForm({ ...emptyForm, branchId: branches[0]?.id ?? '' })
    setModal({ mode: 'create' })
  }
  const openEdit = (row) => {
    setForm({ name: row.name, email: row.email, role: row.role, branchId: row.branchId, status: row.status })
    setModal({ mode: 'edit', id: row.id })
  }

  const submit = (e) => {
    e.preventDefault()
    if (modal.mode === 'create') {
      create({ id: nextId('STF', rows), ...form })
    } else {
      update(modal.id, form)
    }
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="Manage billing admins and authorized staff access across branches."
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add user
          </button>
        }
      />

      <Card className="p-5">
        <Table
          columns={[
            {
              key: 'name',
              header: 'User',
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
                    <UserCog size={15} />
                  </div>
                  <div>
                    <p className="font-medium text-ink-800">{r.name}</p>
                    <p className="text-xs text-ink-400">{r.email}</p>
                  </div>
                </div>
              ),
            },
            { key: 'role', header: 'Role', render: (r) => <Badge tone="accent">{r.role}</Badge> },
            { key: 'branch', header: 'Branch', render: (r) => branchName(r.branchId) },
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

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add user' : 'Edit user'}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Full name">
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Role">
              <select className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option>Billing Admin</option>
                <option>Super Admin</option>
              </select>
            </FormField>
            <FormField label="Branch">
              <select
                className="input"
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.city}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {modal?.mode === 'create' ? 'Add user' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Remove user"
        description={deleteTarget ? `Revoke access for "${deleteTarget.name}".` : ''}
      />
    </div>
  )
}
