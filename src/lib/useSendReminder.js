import { useCollection } from './useCollection'
import { useAuth } from '../context/AuthContext'
import { nextId } from './storage'

// Records a reminder notification (visible in the patient's bell) and an audit
// trail entry whenever a billing admin sends a WhatsApp / SMS / Email nudge.
export function useSendReminder() {
  const { session } = useAuth()
  const { rows: notifications, create: createNotification } = useCollection('notifications')
  const { create: pushAudit } = useCollection('auditLog')
  const { update: updateLedger } = useCollection('creditLedger')

  return function sendReminder(patient, entry, channel, message) {
    createNotification({
      id: nextId('NOTE', notifications),
      patientId: patient.id,
      channel,
      message,
      createdOn: new Date().toISOString(),
      read: false,
      sentBy: session?.name,
    })
    pushAudit({
      id: `AUD-RMD-${entry.id}-${channel}`,
      actor: `Billing Admin · ${session?.name}`,
      action: `Sent ${channel} reminder to ${patient.name} (${entry.amount} credits expiring)`,
      time: new Date().toISOString().slice(0, 10),
    })
    if (entry.id) updateLedger(entry.id, { contacted: true })
  }
}
