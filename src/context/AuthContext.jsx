import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ADMIN_ACCOUNTS } from '../data/seedData'
import { readAll, writeAll, nextId } from '../lib/storage'

const AuthContext = createContext(null)
const SESSION_KEY = 'HMS:session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  }, [session])

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase()

    for (const account of Object.values(ADMIN_ACCOUNTS)) {
      if (account.email === cleanEmail && account.password === password) {
        const user = { role: account.role, name: account.name, email: account.email }
        setSession(user)
        return { ok: true, user }
      }
    }

    const patients = readAll('patients', [])
    const patient = patients.find((p) => p.email.toLowerCase() === cleanEmail)
    if (patient && patient.password === password) {
      const user = { role: 'patient', name: patient.name, email: patient.email, patientId: patient.id }
      setSession(user)
      return { ok: true, user }
    }

    if (patient && patient.password !== password) {
      return { ok: false, error: 'Incorrect password.' }
    }

    return { ok: false, error: 'No account found with that email.' }
  }

  const signupPatient = (data) => {
    const cleanEmail = data.email.trim().toLowerCase()
    const isAdminEmail = Object.values(ADMIN_ACCOUNTS).some((a) => a.email === cleanEmail)
    const patients = readAll('patients', [])
    if (isAdminEmail || patients.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'An account already exists with that email.' }
    }

    const record = {
      id: nextId('PT', patients),
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      phone: data.phone || '',
      dob: data.dob || '',
      address: data.address || '',
      branchId: data.branchId || 'BR-1001',
      creditBalance: 0,
      joinedOn: new Date().toISOString().slice(0, 10),
    }
    writeAll('patients', [...patients, record])
    const user = { role: 'patient', name: record.name, email: record.email, patientId: record.id }
    setSession(user)
    return { ok: true, user }
  }

  const logout = () => setSession(null)

  const value = useMemo(() => ({ session, login, signupPatient, logout }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
