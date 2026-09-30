import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import RequireRole from './components/auth/RequireRole'
import DashboardLayout from './components/layout/DashboardLayout'
import { roles } from './config/nav'
import Login from './pages/Login'

import SuperAdminDashboard from './pages/superadmin/Dashboard'
import Branches from './pages/superadmin/Branches'
import Users from './pages/superadmin/Users'
import Catalog from './pages/superadmin/Catalog'
import CreditPolicy from './pages/superadmin/CreditPolicy'
import Offers from './pages/superadmin/Offers'
import PaymentGateways from './pages/superadmin/PaymentGateways'
import SuperAdminReports from './pages/superadmin/Reports'

import BillingDashboard from './pages/billing/Dashboard'
import Patients from './pages/billing/Patients'
import NewBill from './pages/billing/NewBill'
import Retention from './pages/billing/Retention'
import BillingReports from './pages/billing/Reports'

import PatientDashboard from './pages/patient/Dashboard'
import Purchases from './pages/patient/Purchases'
import Redeem from './pages/patient/Redeem'
import Support from './pages/patient/Support'
import Profile from './pages/patient/Profile'

function RootRedirect() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  const home = { superadmin: '/super-admin', billing: '/billing', patient: '/patient' }[session.role]
  return <Navigate to={home} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/super-admin"
            element={
              <RequireRole role="superadmin">
                <DashboardLayout role={roles.superadmin} />
              </RequireRole>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="branches" element={<Branches />} />
            <Route path="users" element={<Users />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="credit-policy" element={<CreditPolicy />} />
            <Route path="offers" element={<Offers />} />
            <Route path="payment-gateways" element={<PaymentGateways />} />
            <Route path="reports" element={<SuperAdminReports />} />
          </Route>

          <Route
            path="/billing"
            element={
              <RequireRole role="billing">
                <DashboardLayout role={roles.billing} />
              </RequireRole>
            }
          >
            <Route index element={<BillingDashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="new-bill" element={<NewBill />} />
            <Route path="retention" element={<Retention />} />
            <Route path="reports" element={<BillingReports />} />
          </Route>

          <Route
            path="/patient"
            element={
              <RequireRole role="patient">
                <DashboardLayout role={roles.patient} />
              </RequireRole>
            }
          >
            <Route index element={<PatientDashboard />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="redeem" element={<Redeem />} />
            <Route path="support" element={<Support />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
