import { useNavigate } from 'react-router-dom'
import { History, ClipboardList, User, Calendar, CheckCircle } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Historial() {
  const { sesiones, rutinas, alumnos } = useAppStore()
  const navigate = useNavigate()

  const sorted = [...sesiones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const getRutinaName = (id) => rutinas.find(r => r.id === id)?.nombre || 'Rutina eliminada'
  const getAlumnoName = (id) => alumnos.find(a => a.id === id)?.nombre || 'Alumno'

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold">Historial</h2>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <History size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin sesiones registradas</p>
          <p className="text-sm mt-1">Completa un entrenamiento para verlo aquí</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(sesion => (
            <div key={sesion.id} className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sesion.completado ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  {sesion.completado ? (
                    <CheckCircle size={18} className="text-green-400" />
                  ) : (
                    <History size={18} className="text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{getRutinaName(sesion.rutinaId)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <User size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{getAlumnoName(sesion.alumnoId)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {format(new Date(sesion.fecha), "dd 'de' MMMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sesion.completado ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {sesion.completado ? 'Completado' : 'Parcial'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
