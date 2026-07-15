import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ClipboardList, History, Dumbbell, Plus, ArrowRight } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Dashboard() {
  const { stats, alumnos, rutinas, loadStats } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => { loadStats() }, [])

  const recentAlumnos = [...alumnos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
  const recentRutinas = [...rutinas].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  const statCards = [
    { label: 'Alumnos', value: stats.totalAlumnos, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Rutinas', value: stats.totalRutinas, icon: ClipboardList, color: 'from-gym-orange to-gym-orange-dark' },
    { label: 'Ejercicios', value: stats.totalEjercicios, icon: Dumbbell, color: 'from-green-500 to-green-600' },
    { label: 'Sesiones', value: stats.totalSesiones, icon: History, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">Gestiona tus alumnos y rutinas</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 text-white`}>
            <card.icon size={24} className="mb-2 opacity-80" />
            <p className="text-2xl font-extrabold">{card.value}</p>
            <p className="text-xs opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/alumnos')}
          className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-gym-orange/50 transition-colors"
        >
          <Plus size={24} className="text-gym-orange" />
          <span className="text-sm font-medium">Nuevo Alumno</span>
        </button>
        <button
          onClick={() => navigate('/rutinas/nueva')}
          className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-gym-orange/50 transition-colors"
        >
          <Plus size={24} className="text-green-400" />
          <span className="text-sm font-medium">Nueva Rutina</span>
        </button>
      </div>

      {recentAlumnos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Últimos Alumnos</h3>
            <button onClick={() => navigate('/alumnos')} className="text-gym-orange text-sm flex items-center gap-1">
              Ver todo <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {recentAlumnos.map(alumno => (
              <button
                key={alumno.id}
                onClick={() => navigate(`/alumnos/${alumno.id}`)}
                className="flex-shrink-0 w-32 bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 text-left hover:border-gym-orange/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gym-orange/20 flex items-center justify-center text-gym-orange font-bold text-sm mb-2">
                  {alumno.nombre?.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium truncate">{alumno.nombre}</p>
                {alumno.objetivo && <p className="text-xs text-gray-400 truncate mt-0.5">{alumno.objetivo}</p>}
              </button>
            ))}
          </div>
        </section>
      )}

      {recentRutinas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Últimas Rutinas</h3>
            <button onClick={() => navigate('/rutinas')} className="text-gym-orange text-sm flex items-center gap-1">
              Ver todo <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentRutinas.map(rutina => (
              <button
                key={rutina.id}
                onClick={() => navigate(`/rutinas/${rutina.id}`)}
                className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 flex items-center gap-3 text-left hover:border-gym-orange/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gym-orange/10 flex items-center justify-center">
                  <ClipboardList size={18} className="text-gym-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rutina.nombre}</p>
                  <p className="text-xs text-gray-400">
                    {rutina.fechaInicio && format(new Date(rutina.fechaInicio), 'dd MMM', { locale: es })}
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-500" />
              </button>
            ))}
          </div>
        </section>
      )}

      {recentAlumnos.length === 0 && recentRutinas.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Dumbbell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">¡Comienza agregando alumnos!</p>
          <p className="text-sm mt-1">Crea tu primer alumno para empezar a diseñar rutinas.</p>
        </div>
      )}
    </div>
  )
}
