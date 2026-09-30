import { NavLink, Link } from 'react-router-dom'
import { LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react'
import clsx from 'clsx'
import logo from '../../assets/logo.png'
import { hospital } from '../../data/seedData'

export default function Sidebar({ role, onLogout, collapsed, onToggleCollapse }) {
  return (
    <aside
      className={clsx(
        'hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r border-ink-100 bg-white transition-[width] duration-200 z-30',
        collapsed ? 'md:w-[76px]' : 'md:w-64'
      )}
    >
      <Link to="/" className="flex items-center gap-3 px-5 h-16 border-b border-ink-100 shrink-0 overflow-hidden">
        <img src={logo} alt={hospital.name} className="h-8 w-8 object-contain shrink-0" />
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-ink-900 truncate" title={hospital.name}>{hospital.name}</p>
            <p className="text-[11px] text-ink-400">HMS</p>
          </div>
        )}
      </Link>

      {!collapsed && (
        <div className="px-5 pt-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            {role.subtitle}
          </p>
          <p className="text-lg font-semibold text-ink-900">{role.label}</p>
        </div>
      )}
      {collapsed && <div className="pt-4" />}

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {role.nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                collapsed && 'justify-center px-0',
                isActive
                  ? role.color === 'brand'
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-accent-50 text-accent-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              )
            }
          >
            <item.icon size={18} strokeWidth={2} className="shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-100 space-y-1">
        <button
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          className={clsx(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-800 transition-colors whitespace-nowrap',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Log out'}
        </button>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={clsx(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-400 hover:bg-ink-50 hover:text-ink-700 transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}
