import { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { hospital } from '../../data/seedData'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

function currentPageTitle(role, pathname) {
  const exact = role.nav.find((item) => item.to === pathname)
  if (exact) return exact.label
  const candidates = role.nav
    .filter((item) => !item.end && pathname.startsWith(item.to))
    .sort((a, b) => b.to.length - a.to.length)
  return candidates[0]?.label ?? role.label
}

export default function DashboardLayout({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('HMS:sidebarCollapsed') === '1')
  const { session, logout } = useAuth()
  const location = useLocation()

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem('HMS:sidebarCollapsed', c ? '0' : '1')
      return !c
    })
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar role={role} onLogout={logout} collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-950/40 z-30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-40 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-ink-100">
                <Link to="/" className="flex items-center gap-2 min-w-0" onClick={() => setMobileOpen(false)}>
                  <img src={logo} alt="" className="h-7 w-7 shrink-0" />
                  <span className="text-sm font-semibold truncate">{hospital.name}</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-ink-400">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                {role.nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-3 border-t border-ink-100">
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-ink-50"
                >
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={`flex flex-col min-h-screen transition-[padding] duration-200 ${collapsed ? 'md:pl-[76px]' : 'md:pl-64'}`}>
        <Topbar
          title={currentPageTitle(role, location.pathname)}
          subtitle={role.label}
          actor={session?.name}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
