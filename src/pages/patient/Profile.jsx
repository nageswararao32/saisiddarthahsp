import { useState } from 'react'
import { Save, KeyRound, UserRound } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import { useCollection } from '../../lib/useCollection'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { session } = useAuth()
  const { rows: branches } = useCollection('branches')
  const { rows: patients, update } = useCollection('patients')
  const patient = patients.find((p) => p.id === session.patientId)

  const [form, setForm] = useState({
    name: patient.name,
    phone: patient.phone,
    dob: patient.dob,
    address: patient.address,
    branchId: patient.branchId,
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [savedProfile, setSavedProfile] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

  const saveProfile = (e) => {
    e.preventDefault()
    update(patient.id, form)
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 2000)
  }

  const changePassword = (e) => {
    e.preventDefault()
    if (passwords.current !== patient.password) {
      setPasswordMsg('Current password is incorrect.')
      return
    }
    if (passwords.next.length < 4) {
      setPasswordMsg('New password must be at least 4 characters.')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg('New passwords do not match.')
      return
    }
    update(patient.id, { password: passwords.next })
    setPasswords({ current: '', next: '', confirm: '' })
    setPasswordMsg('Password updated.')
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Keep your registered details up to date." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserRound size={16} className="text-ink-400" />
            <h3 className="font-semibold text-ink-900">Profile details</h3>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <FormField label="Full name">
              <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Email" hint="Contact the hospital to change your registered email.">
              <input className="input" value={patient.email} disabled />
            </FormField>
            <FormField label="Phone">
              <input required className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </FormField>
            <FormField label="Date of birth">
              <input type="date" className="input" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} />
            </FormField>
            <FormField label="Preferred branch">
              <select className="input" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Address">
              <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </FormField>
            <button type="submit" className="btn-primary">
              <Save size={15} /> Save changes
            </button>
            {savedProfile && <span className="ml-3 text-sm text-brand-600">Saved.</span>}
          </form>
        </Card>

        <Card className="p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={16} className="text-ink-400" />
            <h3 className="font-semibold text-ink-900">Change password</h3>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            <FormField label="Current password">
              <input
                type="password"
                required
                className="input"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              />
            </FormField>
            <FormField label="New password">
              <input
                type="password"
                required
                className="input"
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
              />
            </FormField>
            <FormField label="Confirm new password">
              <input
                type="password"
                required
                className="input"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              />
            </FormField>
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg === 'Password updated.' ? 'text-brand-600' : 'text-rose-600'}`}>{passwordMsg}</p>
            )}
            <button type="submit" className="btn-primary">
              Update password
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}
