import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, Trash2, User } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'

export default function Rutinas() {
  const { rutinas, alumnos, deleteRutina } = useAppStore()
  const navigate = useNavigate()

  const sorted = [...rutinas].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const getAlumnoName = (id) => {
    const a = alumnos.find(al => al.id === id)
    return a?.nombre || 'Sin alumno'
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta rutina y todos sus ejercicios?')) {
      await deleteRutina(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Rutinas</h2>
        <button onClick={() => navigate('/rutinas/nueva')} className="bg-gym-orange text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="space-y-2">
        {sorted.map(rutina => (
          <div key={rutina.id} className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-4 flex items-center gap-3">
            <button onClick={() => navigate(`/rutinas/${rutina.id}`)} className="flex-1 flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-lg bg-gym-orange/10 flex items-center justify-center">
                <ClipboardList size={20} className="text-gym-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{rutina.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <User size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{getAlumnoName(rutina.alumnoId)}</span>
                </div>
                {rutina.fechaInicio && (
                  <p className="text-xs text-gray-500 mt-0.5">{rutina.fechaInicio}</p>
                )}
              </div>
            </button>
            <button onClick={() => handleDelete(rutina.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
              <Trash2 size={16} className="text-red-400" />
            </button>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay rutinas creadas</p>
            <p className="text-sm mt-1">Crea una nueva rutina para empezar</p>
          </div>
        )}
      </div>
    </div>
  )
}
