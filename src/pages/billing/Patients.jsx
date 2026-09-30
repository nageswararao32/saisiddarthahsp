import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Wallet, KeyRound, Copy, Check } from 'lucide-react'
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

const emptyForm = { name: '', email: '', phone: '', dob: '', address: '', branchId: '' }

function randomPassword() {
  return `Nova${Math.floor(1000 + Math.random() * 9000)}`
}

export default function Patients() {
  const { rows, create, update, remove } = useCollection('patients')
  const { rows: branches } = useCollection('branches')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [credentialInfo, setCredentialInfo] = useState(null)
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    )
  }, [rows, query])

  const branchName = (id) => branches.find((b) => b.id === id)?.name ?? '—'

  const openCreate = () => {
    setForm({ ...emptyForm, branchId: branches[0]?.id ?? '' })
    setModal({ mode: 'create' })
  }
  const openEdit = (row) => {
    setForm({ name: row.name, email: row.email, phone: row.phone, dob: row.dob, address: row.address, branchId: row.branchId })
    setModal({ mode: 'edit', id: row.id })
  }

  const submit = (e) => {
    e.preventDefault()
    if (modal.mode === 'create') {
      const password = randomPassword()
      const record = { id: nextId('PT', rows), ...form, password, creditBalance: 0, joinedOn: new Date().toISOString().slice(0, 10) }
      create(record)
      setModal(null)
      setCredentialInfo({ name: record.name, email: record.email, password })
    } else {
      update(modal.id, form)
      setModal(null)
    }
  }

  const copyCreds = () => {
    navigator.clipboard?.writeText(`Email: ${credentialInfo.email}\nPassword: ${credentialInfo.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Register new patients and maintain profiles across branches."
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Register patient
          </button>
        }
      />

      <Card className="p-5">
        <div className="relative mb-4 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            className="input pl-9"
            placeholder="Search by name, phone, email or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Table
          columns={[
            {
              key: 'name',
              header: 'Patient',
              render: (r) => (
                <div>
                  <p className="font-medium text-ink-800">{r.name}</p>
                  <p className="text-xs text-ink-400">{r.id} · {r.phone}</p>
                </div>
              ),
            },
            { key: 'branch', header: 'Branch', render: (r) => branchName(r.branchId) },
            {
              key: 'credits',
              header: 'Credit balance',
              render: (r) => (
                <span className="inline-flex items-center gap-1 font-medium text-brand-700">
                  <Wallet size={13} /> {r.creditBalance}
                </span>
              ),
            },
            { key: 'joinedOn', header: 'Joined', render: (r) => formatDate(r.joinedOn) },
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
          rows={filtered}
          emptyLabel="No patients match your search."
        />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Register patient' : 'Edit patient'}
      >
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Full name">
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <input
                type="email"
                required
                className="input"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </FormField>
            <FormField label="Phone">
              <input required className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date of birth">
              <input type="date" className="input" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} />
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
          <FormField label="Address">
            <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </FormField>

          {modal?.mode === 'create' && (
            <p className="text-xs text-ink-400 flex items-center gap-1.5">
              <KeyRound size={13} /> A login password will be generated for this patient after registration.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {modal?.mode === 'create' ? 'Register patient' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!credentialInfo} onClose={() => setCredentialInfo(null)} title="Patient registered" width="max-w-sm">
        {credentialInfo && (
          <div className="space-y-3">
            <p className="text-sm text-ink-600">
              Share these login details with <span className="font-medium">{credentialInfo.name}</span>. They can
              change their password after signing in.
            </p>
            <div className="rounded-lg bg-ink-50 p-3.5 text-sm space-y-1 font-mono">
              <p><span className="text-ink-400 font-sans">Email:</span> {credentialInfo.email}</p>
              <p><span className="text-ink-400 font-sans">Password:</span> {credentialInfo.password}</p>
            </div>
            <button className="btn-secondary w-full" onClick={copyCreds}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy credentials'}
            </button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Remove patient"
        description={deleteTarget ? `Remove "${deleteTarget.name}" and their profile.` : ''}
      />
    </div>
  )
}
