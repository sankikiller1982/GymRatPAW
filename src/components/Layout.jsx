import { Outlet, NavLink, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, X } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'

export default function Layout() {
  const sidebarOpen = useAppStore(s => s.sidebarOpen)
  const toggleSidebar = useAppStore(s => s.toggleSidebar)

  return (
    <div className="flex h-screen overflow-hidden bg-gym-dark">
      <Sidebar />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-4">
        <header className="sticky top-0 z-20 bg-gym-dark/80 backdrop-blur-md border-b border-gym-dark-border px-4 py-3 flex items-center gap-3 safe-top">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-bold">GymRat</h1>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

function BottomNav() {
  const location = useLocation()
  const path = location.pathname

  const nav = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    { path: '/alumnos', label: 'Alumnos', icon: '👥' },
    { path: '/ejercicios', label: 'Ejercicios', icon: '💪' },
    { path: '/rutinas', label: 'Rutinas', icon: '📋' },
    { path: '/historial', label: 'Historial', icon: '📊' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gym-dark-card/95 backdrop-blur-md border-t border-gym-dark-border lg:hidden safe-bottom z-40">
      <div className="flex justify-around py-2">
        {nav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              isActive ? 'text-gym-orange' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
