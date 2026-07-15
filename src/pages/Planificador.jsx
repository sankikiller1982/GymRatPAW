import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, GripVertical, Calendar, Moon } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import db from '../lib/db'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DIAS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Planificador() {
  const { rutinas, ejercicios, alumnos } = useAppStore()
  const navigate = useNavigate()
  const [selectedRutina, setSelectedRutina] = useState('')
  const [weekPlan, setWeekPlan] = useState(
    DIAS.map((dia, i) => ({ dia: i, nombre: dia, activo: true, ejercicios: [], notas: '' }))
  )
  const [showAddExercise, setShowAddExercise] = useState(null) // dia index
  const [searchEx, setSearchEx] = useState('')

  useEffect(() => {
    if (selectedRutina) {
      db.weeklyPlan.where('rutinaId').equals(Number(selectedRutina)).toArray().then(plan => {
        if (plan.length > 0) {
          const restored = DIAS.map((dia, i) => {
            const dayPlan = plan.find(p => p.dia === i)
            return {
              dia: i,
              nombre: dia,
              activo: dayPlan ? dayPlan.activo : true,
              ejercicios: dayPlan ? dayPlan.ejercicios || [] : [],
              notas: dayPlan ? dayPlan.notas || '' : '',
            }
          })
          setWeekPlan(restored)
        }
      })
    }
  }, [selectedRutina])

  const savePlan = async () => {
    if (!selectedRutina) return
    const rutinaId = Number(selectedRutina)
    await db.weeklyPlan.where('rutinaId').equals(rutinaId).delete()
    for (const day of weekPlan) {
      await db.weeklyPlan.add({
        rutinaId,
        dia: day.dia,
        activo: day.activo,
        ejercicios: day.ejercicios,
        notas: day.notas,
      })
    }
  }

  const toggleDay = (idx) => {
    setWeekPlan(prev => prev.map((d, i) => i === idx ? { ...d, activo: !d.activo } : d))
  }

  const addExerciseToDay = (diaIdx, ejercicio) => {
    setWeekPlan(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d
      const exists = d.ejercicios.find(e => e.ejercicioId === ejercicio.id)
      if (exists) return d
      return {
        ...d,
        ejercicios: [...d.ejercicios, {
          ejercicioId: ejercicio.id,
          series: ejercicio.series || '3',
          reps: ejercicio.reps || '10',
          peso: '',
          notas: '',
        }]
      }
    }))
    setShowAddExercise(null)
    setSearchEx('')
  }

  const removeExerciseFromDay = (diaIdx, ejIdx) => {
    setWeekPlan(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d
      return { ...d, ejercicios: d.ejercicios.filter((_, j) => j !== ejIdx) }
    }))
  }

  const updateDayNotes = (diaIdx, notas) => {
    setWeekPlan(prev => prev.map((d, i) => i === diaIdx ? { ...d, notas } : d))
  }

  const filteredExercises = ejercicios.filter(e =>
    e.nombre?.toLowerCase().includes(searchEx.toLowerCase())
  )

  const totalExercises = weekPlan.reduce((acc, d) => acc + d.ejercicios.length, 0)
  const activeDays = weekPlan.filter(d => d.activo).length

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold">Planificador Semanal</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Seleccionar Rutina</label>
        <select
          value={selectedRutina}
          onChange={e => setSelectedRutina(e.target.value)}
          className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange"
        >
          <option value="">Elegí una rutina...</option>
          {rutinas.map(r => {
            const alumno = alumnos.find(a => a.id === r.alumnoId)
            return (
              <option key={r.id} value={r.id}>
                {r.nombre} — {alumno?.nombre || 'Sin alumno'}
              </option>
            )
          })}
        </select>
      </div>

      {selectedRutina && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gym-orange">{activeDays}</p>
              <p className="text-xs text-gray-400">Días activos</p>
            </div>
            <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{totalExercises}</p>
              <p className="text-xs text-gray-400">Ejercicios</p>
            </div>
            <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{7 - activeDays}</p>
              <p className="text-xs text-gray-400">Descanso</p>
            </div>
          </div>

          <div className="space-y-3">
            {weekPlan.map((day, diaIdx) => (
              <div
                key={diaIdx}
                className={`bg-gym-dark-card border rounded-2xl overflow-hidden transition-colors ${
                  day.activo ? 'border-gym-dark-border' : 'border-red-500/20 opacity-60'
                }`}
              >
                <div
                  className={`flex items-center justify-between p-4 cursor-pointer ${
                    day.activo ? 'bg-gym-dark-card' : 'bg-red-500/5'
                  }`}
                  onClick={() => toggleDay(diaIdx)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      day.activo ? 'bg-gym-orange/20 text-gym-orange' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {DIAS_SHORT[diaIdx]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{day.nombre}</p>
                      <p className="text-xs text-gray-400">
                        {day.activo
                          ? `${day.ejercicios.length} ejercicio${day.ejercicios.length !== 1 ? 's' : ''}`
                          : 'Día de descanso'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.activo && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowAddExercise(diaIdx) }}
                        className="p-2 rounded-lg bg-gym-orange/10 hover:bg-gym-orange/20 transition-colors"
                      >
                        <Plus size={16} className="text-gym-orange" />
                      </button>
                    )}
                    <Moon size={16} className={day.activo ? 'text-gray-500' : 'text-red-400'} />
                  </div>
                </div>

                {day.activo && day.ejercicios.length > 0 && (
                  <div className="px-4 pb-3 space-y-1.5">
                    {day.ejercicios.map((ej, ejIdx) => {
                      const ejercicio = ejercicios.find(e => e.id === ej.ejercicioId)
                      return (
                        <div key={ejIdx} className="flex items-center gap-2 bg-gym-dark rounded-xl p-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gym-orange/10 flex items-center justify-center text-gym-orange text-[10px] font-bold flex-shrink-0">
                            {ejIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{ejercicio?.nombre || 'Ejercicio'}</p>
                            <p className="text-[10px] text-gray-400">{ej.series}×{ej.reps}</p>
                          </div>
                          <button
                            onClick={() => removeExerciseFromDay(diaIdx, ejIdx)}
                            className="p-1 rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {day.activo && (
                  <div className="px-4 pb-3">
                    <input
                      type="text"
                      placeholder="Notas del día..."
                      value={day.notas}
                      onChange={e => updateDayNotes(diaIdx, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-full bg-gym-dark border border-gym-dark-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gym-orange text-gray-300"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={savePlan}
            className="w-full bg-gym-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-gym-orange-dark transition-colors"
          >
            Guardar Plan Semanal
          </button>
        </>
      )}

      {!selectedRutina && (
        <div className="text-center py-12 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Elegí una rutina para planificar</p>
          <p className="text-sm mt-1">Asigná ejercicios a cada día de la semana</p>
        </div>
      )}

      {showAddExercise !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-gym-dark-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Agregar a {DIAS[showAddExercise]}</h3>
              <button onClick={() => { setShowAddExercise(null); setSearchEx('') }} className="p-2 rounded-lg hover:bg-gym-dark-border">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={searchEx}
              onChange={e => setSearchEx(e.target.value)}
              className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gym-orange mb-3"
            />
            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredExercises.map(ej => (
                <button
                  key={ej.id}
                  onClick={() => addExerciseToDay(showAddExercise, ej)}
                  className="w-full text-left p-3 rounded-xl hover:bg-gym-dark-border transition-colors flex items-center gap-3"
                >
                  {ej.imagen ? (
                    <img src={ej.imagen} alt={ej.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gym-dark" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gym-orange/10 flex items-center justify-center text-gym-orange text-xs font-bold flex-shrink-0">
                      {ej.categoria?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ej.nombre}</p>
                    <p className="text-xs text-gray-400">{ej.categoria} · {ej.series || '3'}×{ej.reps || '10'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
