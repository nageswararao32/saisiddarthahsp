import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, description, children, footer, width = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 sm:pt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={`relative w-full ${width} rounded-2xl bg-white shadow-xl`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-ink-900">{title}</h3>
                {description && <p className="text-xs text-ink-500 mt-0.5">{description}</p>}
              </div>
              <button onClick={onClose} className="btn-icon -mr-1.5 -mt-1">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-ink-100 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
