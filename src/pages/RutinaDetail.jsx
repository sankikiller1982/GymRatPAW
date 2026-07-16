import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Trash2, Copy, FileText, Share2, User } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { generateRoutinePDF, sharePDF } from '../lib/pdfGenerator'
import db from '../lib/db'

export default function RutinaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rutinas, alumnos, ejercicios, deleteRutina, showToast } = useAppStore()
  const [items, setItems] = useState([])

  const rutina = rutinas.find(r => r.id === Number(id))
  const alumno = alumnos.find(a => a.id === rutina?.alumnoId)

  useEffect(() => {
    if (id) {
      db.rutinaEjercicios.where('rutinaId').equals(Number(id)).toArray().then(setItems)
    }
  }, [id])

  const sorted = [...items].sort((a, b) => a.orden - b.orden)

  if (!rutina) return <p className="text-gray-400 text-center py-8">Rutina no encontrada</p>

  const handleDelete = async () => {
    if (confirm('¿Eliminar esta rutina?')) {
      await deleteRutina(rutina.id)
      showToast('Rutina eliminada', 'success')
      navigate('/rutinas')
    }
  }

  const handleDuplicate = async () => {
    const newId = await useAppStore.getState().addRutina({
      alumnoId: rutina.alumnoId,
      nombre: `${rutina.nombre} (copia)`,
      objetivo: rutina.objetivo,
      fechaInicio: rutina.fechaInicio,
      fechaFin: rutina.fechaFin,
      observaciones: rutina.observaciones,
    })
    for (const item of items) {
      await useAppStore.getState().addEjercicioToRutina({
        rutinaId: newId,
        ejercicioId: item.ejercicioId,
        orden: item.orden,
        series: item.series,
        reps: item.reps,
        peso: item.peso,
        tiempoDescanso: item.tiempoDescanso,
        notas: item.notas,
      })
    }
    showToast('Rutina duplicada', 'success')
    navigate(`/rutinas/${newId}`)
  }

  const handlePDF = () => {
    generateRoutinePDF(rutina, alumno, sorted, ejercicios)
    showToast('PDF generado', 'success')
  }

  const handleShare = async () => {
    await sharePDF(rutina, alumno, sorted, ejercicios)
    showToast('Compartido', 'success')
  }

  const catColors = {
    Pecho: 'text-red-400', Espalda: 'text-blue-400', Piernas: 'text-green-400',
    Glúteos: 'text-pink-400', Hombros: 'text-yellow-400', Bíceps: 'text-orange-400',
    Tríceps: 'text-violet-400', Core: 'text-teal-400',
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold flex-1 truncate">{rutina.nombre}</h2>
        <button onClick={handleDuplicate} className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border">
          <Copy size={18} className="text-gray-400" />
        </button>
        <button onClick={handleDelete} className="p-2 rounded-xl bg-gym-dark-card hover:bg-red-500/10">
          <Trash2 size={18} className="text-red-400" />
        </button>
      </div>

      {alumno && (
        <button onClick={() => navigate(`/alumnos/${alumno.id}`)} className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-gym-orange/20 flex items-center justify-center text-gym-orange font-bold text-sm">
            {alumno.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{alumno.nombre}</p>
            {alumno.objetivo && <p className="text-xs text-gray-400">{alumno.objetivo}</p>}
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {rutina.objetivo && (
          <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3">
            <p className="text-xs text-gray-400">Objetivo</p>
            <p className="text-sm font-medium mt-0.5">{rutina.objetivo}</p>
          </div>
        )}
        {rutina.fechaInicio && (
          <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3">
            <p className="text-xs text-gray-400">Inicio</p>
            <p className="text-sm font-medium mt-0.5">{rutina.fechaInicio}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/workout/${rutina.id}`)}
          className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
        >
          <Play size={16} /> Entrenar
        </button>
        <button
          onClick={handlePDF}
          className="bg-blue-500 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <FileText size={16} /> PDF
        </button>
        <button
          onClick={handleShare}
          className="bg-purple-500 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div>
        <h3 className="font-bold mb-3">Ejercicios ({sorted.length})</h3>
        <div className="space-y-2">
          {sorted.map((item, idx) => {
            const ej = ejercicios.find(e => e.id === item.ejercicioId)
            return (
              <div key={item.id} className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {/* Imagen/GIF del ejercicio */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gym-dark flex-shrink-0 relative">
                    {ej?.gif ? (
                      <img
                        src={ej.gif}
                        alt={ej.nombre}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : ej?.imagen ? (
                      <img
                        src={ej.imagen}
                        alt={ej.nombre}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="text-2xl font-bold opacity-20">{ej?.categoria?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ej?.nombre || 'Ejercicio'}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="bg-gym-dark px-2 py-0.5 rounded text-xs">{item.series} series</span>
                      <span className="bg-gym-dark px-2 py-0.5 rounded text-xs">{item.reps} reps</span>
                      {item.peso && <span className="bg-gym-dark px-2 py-0.5 rounded text-xs">{item.peso} kg</span>}
                      <span className="bg-gym-dark px-2 py-0.5 rounded text-xs">{item.tiempoDescanso}s descanso</span>
                    </div>
                    {item.notas && <p className="text-xs text-gray-400 mt-1">{item.notas}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
