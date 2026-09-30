import { formatDate, daysUntil } from './format'
import { hospital } from '../data/seedData'

export function reminderMessage(patient, entry) {
  const days = daysUntil(entry.expiry)
  const when = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days (${formatDate(entry.expiry)})`
  return `Hi ${patient.name}, this is ${hospital.name}. You have ${entry.amount} reward credits expiring ${when}. Visit us soon to redeem them before they lapse!`
}

export function whatsappLink(phone, message) {
  const digits = String(phone ?? '').replace(/[^\d]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function smsLink(phone, message) {
  return `sms:${phone}?body=${encodeURIComponent(message)}`
}

export function emailLink(email, subject, message) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}
