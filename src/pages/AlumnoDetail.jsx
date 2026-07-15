import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ClipboardList, Phone, MessageCircle, Weight, Ruler, Target } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import db from '../lib/db'

export default function AlumnoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { alumnos, rutinas } = useAppStore()
  const [alumnoRutinas, setAlumnoRutinas] = useState([])

  const alumno = alumnos.find(a => a.id === Number(id))

  useEffect(() => {
    if (id) {
      db.rutinas.where('alumnoId').equals(Number(id)).toArray().then(setAlumnoRutinas)
    }
  }, [id, rutinas])

  if (!alumno) return <p className="text-gray-400 text-center py-8">Alumno no encontrado</p>

  const infoItems = [
    alumno.telefono && { icon: Phone, label: 'Teléfono', value: alumno.telefono },
    alumno.edad && { icon: null, label: 'Edad', value: `${alumno.edad} años` },
    alumno.peso && { icon: Weight, label: 'Peso', value: `${alumno.peso} kg` },
    alumno.altura && { icon: Ruler, label: 'Altura', value: `${alumno.altura} cm` },
    alumno.objetivo && { icon: Target, label: 'Objetivo', value: alumno.objetivo },
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold">Ficha del Alumno</h2>
      </div>

      <div className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gym-orange/20 flex items-center justify-center text-gym-orange font-bold text-2xl mx-auto mb-3">
          {alumno.nombre?.charAt(0).toUpperCase()}
        </div>
        <h3 className="text-xl font-bold">{alumno.nombre}</h3>
        {alumno.objetivo && <p className="text-sm text-gray-400 mt-1">{alumno.objetivo}</p>}
        <div className="flex justify-center gap-3 mt-4">
          {alumno.telefono && (
            <a href={`tel:${alumno.telefono}`} className="p-3 rounded-xl bg-gym-dark hover:bg-gym-dark-border transition-colors">
              <Phone size={18} className="text-blue-400" />
            </a>
          )}
          {alumno.whatsapp && (
            <a href={`https://wa.me/${alumno.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className="p-3 rounded-xl bg-gym-dark hover:bg-gym-dark-border transition-colors">
              <MessageCircle size={18} className="text-green-400" />
            </a>
          )}
        </div>
      </div>

      {infoItems.length > 0 && (
        <div className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-3">
            {infoItems.map((item, i) => (
              <div key={i} className="bg-gym-dark rounded-xl p-3">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {alumno.observaciones && (
        <div className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-300 mb-1">Observaciones</p>
          <p className="text-sm text-gray-400">{alumno.observaciones}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Rutinas ({alumnoRutinas.length})</h3>
          <button
            onClick={() => navigate(`/rutinas/nueva/${alumno.id}`)}
            className="bg-gym-orange text-white px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Crear rutina
          </button>
        </div>
        {alumnoRutinas.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin rutinas asignadas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alumnoRutinas.map(rutina => (
              <button
                key={rutina.id}
                onClick={() => navigate(`/rutinas/${rutina.id}`)}
                className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl p-4 flex items-center gap-3 text-left hover:border-gym-orange/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gym-orange/10 flex items-center justify-center">
                  <ClipboardList size={18} className="text-gym-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rutina.nombre}</p>
                  <p className="text-xs text-gray-400">{rutina.fechaInicio || 'Sin fecha'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
