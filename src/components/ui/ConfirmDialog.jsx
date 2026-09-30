import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete' }) {
  return (
    <Modal open={open} onClose={onClose} width="max-w-sm" title={title} description={description}>
      <div className="flex items-start gap-3 -mt-1 mb-1">
        <div className="h-9 w-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <AlertTriangle size={17} className="text-rose-500" />
        </div>
        <p className="text-sm text-ink-500 pt-1.5">This action cannot be undone.</p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-danger !bg-rose-600 !text-white hover:!bg-rose-700"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
