import { MessageCircle, MessageSquareText, Mail } from 'lucide-react'
import { reminderMessage, whatsappLink, smsLink, emailLink } from '../../lib/contact'
import { daysUntil } from '../../lib/format'
import { hospital } from '../../data/seedData'

// Quick-contact icons for a patient whose credit lot is expiring soon.
// Only rendered by callers when daysUntil(entry.expiry) <= 7.
export default function ContactIcons({ patient, entry, onSent, size = 'md' }) {
  if (!patient || !entry) return null
  const days = daysUntil(entry.expiry)
  if (days > 7 || days < 0) return null

  const message = reminderMessage(patient, entry)
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  const iconSize = size === 'sm' ? 13 : 15

  const send = (channel, url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    onSent?.(channel, message)
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="Send WhatsApp reminder"
        onClick={() => send('WhatsApp', whatsappLink(patient.phone, message))}
        className={`${dim} rounded-full flex items-center justify-center bg-[#25D366]/10 text-[#1DA851] hover:bg-[#25D366]/20 transition-colors`}
      >
        <MessageCircle size={iconSize} />
      </button>
      <button
        type="button"
        title="Send SMS reminder"
        onClick={() => send('SMS', smsLink(patient.phone, message))}
        className={`${dim} rounded-full flex items-center justify-center bg-accent-50 text-accent-600 hover:bg-accent-100 transition-colors`}
      >
        <MessageSquareText size={iconSize} />
      </button>
      <button
        type="button"
        title="Send email reminder"
        onClick={() => send('Email', emailLink(patient.email, `Your ${hospital.name} credits are expiring soon`, message))}
        className={`${dim} rounded-full flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors`}
      >
        <Mail size={iconSize} />
      </button>
    </div>
  )
}
