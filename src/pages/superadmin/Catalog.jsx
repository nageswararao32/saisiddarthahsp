import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormField from '../../components/ui/FormField'
import { useCollection } from '../../lib/useCollection'
import { nextId } from '../../lib/storage'
import { formatCurrency } from '../../lib/format'

const emptyForm = { name: '', type: 'Medicine', unit: '', price: '', creditRate: '' }
const typeTones = { Medicine: 'brand', Service: 'accent', Test: 'amber', Scan: 'rose' }
const PAGE_SIZE = 25

export default function Catalog() {
  const { rows, create, update, remove } = useCollection('catalog')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      const matchesType = typeFilter === 'All' || r.type === typeFilter
      return matchesQuery && matchesType
    })
  }, [rows, query, typeFilter])

  const visibleRows = filtered.slice(0, visible)

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }
  const openEdit = (row) => {
    setForm({ name: row.name, type: row.type, unit: row.unit, price: row.price, creditRate: row.creditRate })
    setModal({ mode: 'edit', id: row.id })
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = { ...form, price: Number(form.price) || 0, creditRate: Number(form.creditRate) || 0 }
    if (modal.mode === 'create') {
      create({ id: nextId('ITM', rows), ...payload })
    } else {
      update(modal.id, payload)
    }
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Product & Service Catalog"
        description="Govern medicines, tests, scans and pricing, plus each item's credit-earning rate."
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add item
          </button>
        }
      />

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              className="input pl-9"
              placeholder="Search medicines, tests, scans…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setVisible(PAGE_SIZE)
              }}
            />
          </div>
          <select
            className="input sm:w-44"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setVisible(PAGE_SIZE)
            }}
          >
            <option value="All">All types</option>
            <option>Medicine</option>
            <option>Service</option>
            <option>Test</option>
            <option>Scan</option>
          </select>
          <Badge tone="ink" className="sm:ml-auto shrink-0">
            {filtered.length} of {rows.length} items
          </Badge>
        </div>

        <Table
          columns={[
            {
              key: 'name',
              header: 'Item',
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-ink-100 flex items-center justify-center text-ink-500">
                    <Package size={15} />
                  </div>
                  <div>
                    <p className="font-medium text-ink-800">{r.name}</p>
                    <p className="text-xs text-ink-400">{r.unit}</p>
                  </div>
                </div>
              ),
            },
            { key: 'type', header: 'Type', render: (r) => <Badge tone={typeTones[r.type] ?? 'ink'}>{r.type}</Badge> },
            { key: 'price', header: 'Price', render: (r) => formatCurrency(r.price) },
            { key: 'creditRate', header: 'Credit rate', render: (r) => `${r.creditRate}%` },
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
          rows={visibleRows}
          emptyLabel="No items match your search."
        />

        {visible < filtered.length && (
          <div className="text-center pt-4">
            <button className="btn-secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Load more ({filtered.length - visible} remaining)
            </button>
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add catalog item' : 'Edit item'}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Item name">
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type">
              <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option>Medicine</option>
                <option>Service</option>
                <option>Test</option>
                <option>Scan</option>
              </select>
            </FormField>
            <FormField label="Unit">
              <input
                required
                placeholder="e.g. Strip, Visit, Test"
                className="input"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (₹)">
              <input
                type="number"
                min="0"
                required
                className="input"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </FormField>
            <FormField label="Credit rate (%)">
              <input
                type="number"
                min="0"
                max="100"
                required
                className="input"
                value={form.creditRate}
                onChange={(e) => setForm((f) => ({ ...f, creditRate: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {modal?.mode === 'create' ? 'Add item' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Remove item"
        description={deleteTarget ? `Remove "${deleteTarget.name}" from the catalog.` : ''}
      />
    </div>
  )
}
