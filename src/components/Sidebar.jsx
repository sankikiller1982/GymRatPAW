import { NavLink } from 'react-router-dom'
import { Home, Users, Dumbbell, ClipboardList, History, Calendar, Download, X } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/alumnos', label: 'Alumnos', icon: Users },
  { to: '/ejercicios', label: 'Ejercicios', icon: Dumbbell },
  { to: '/rutinas', label: 'Rutinas', icon: ClipboardList },
  { to: '/planificador', label: 'Planificador', icon: Calendar },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/exportar', label: 'Exportar', icon: Download },
]

export default function Sidebar() {
  const sidebarOpen = useAppStore(s => s.sidebarOpen)
  const toggleSidebar = useAppStore(s => s.toggleSidebar)

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gym-dark-card border-r border-gym-dark-border
      transform transition-transform duration-200 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-4 flex items-center justify-between border-b border-gym-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gym-orange flex items-center justify-center font-bold text-sm">
            GR
          </div>
          <span className="font-bold text-lg">GymRat</span>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden p-1 rounded-lg hover:bg-gym-dark-border">
          <X size={18} />
        </button>
      </div>
      <nav className="p-3 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => sidebarOpen && toggleSidebar()}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isActive
                ? 'bg-gym-orange/10 text-gym-orange'
                : 'text-gray-400 hover:text-white hover:bg-gym-dark-border'
              }
            `}
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
