import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const homeByRole = {
  superadmin: '/super-admin',
  billing: '/billing',
  patient: '/patient',
}

export default function RequireRole({ role, children }) {
  const { session } = useAuth()

  if (!session) return <Navigate to="/login" replace />
  if (session.role !== role) return <Navigate to={homeByRole[session.role] ?? '/login'} replace />

  return children
}
