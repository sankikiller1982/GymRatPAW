import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, GripVertical, Calendar, Moon, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  const [showAddExercise, setShowAddExercise] = useState(null)
  const [searchEx, setSearchEx] = useState('')

  useEffect(() => {
    if (selectedRutina) {
      db.weeklyPlan.where('rutinaId').equals(Number(selectedRutina)).toArray().then(plan => {
        if (plan.length > 0) {
          const restored = DIAS.map((dia, i) => {
            const dayPlan = plan.find(p => p.dia === i)
            return {
              dia: i, nombre: dia, activo: dayPlan?.activo ?? true,
              ejercicios: dayPlan?.ejercicios || [], notas: dayPlan?.notas || ''
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
      await db.weeklyPlan.add({ rutinaId, dia: day.dia, activo: day.activo, ejercicios: day.ejercicios, notas: day.notas })
    }
    alert('Plan semanal guardado')
  }

  const toggleDay = (idx) => {
    setWeekPlan(prev => prev.map((d, i) => i === idx ? { ...d, activo: !d.activo } : d))
  }

  const addExerciseToDay = (diaIdx, ejercicio) => {
    setWeekPlan(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d
      const exists = d.ejercicios.find(e => e.ejercicioId === ejercicio.id)
      if (exists) return d
      return { ...d, ejercicios: [...d.ejercicios, { tempId: `temp-${Date.now()}`, ejercicioId: ejercicio.id, series: ejercicio.series || '3', reps: ejercicio.reps || '10', peso: '', tiempoDescanso: ejercicio.descanso || '60', notas: '' }] }
    }))
    setShowAddExercise(null)
    setSearchEx('')
  }

  const removeExerciseFromDay = (diaIdx, tempId) => {
    setWeekPlan(prev => prev.map((d, i) => i === diaIdx ? { ...d, ejercicios: d.ejercicios.filter(e => e.tempId !== tempId) } : d))
  }

  const updateExerciseInDay = (diaIdx, tempId, data) => {
    setWeekPlan(prev => prev.map((d, i) => i === diaIdx ? { ...d, ejercicios: d.ejercicios.map(e => e.tempId === tempId ? { ...e, ...data } : e) } : d))
  }

  const updateDayNotes = (diaIdx, notas) => {
    setWeekPlan(prev => prev.map((d, i) => i === diaIdx ? { ...d, notas } : d))
  }

  const reorderDayExercises = (diaIdx, activeId, overId) => {
    setWeekPlan(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d
      const oldIndex = d.ejercicios.findIndex(e => e.tempId === activeId)
      const newIndex = d.ejercicios.findIndex(e => e.tempId === overId)
      const newEjercicios = arrayMove(d.ejercicios, oldIndex, newIndex)
      return { ...d, ejercicios: newEjercicios }
    }))
  }

  const moveExerciseToDay = (fromDayIdx, toDayIdx, tempId) => {
    setWeekPlan(prev => {
      const newPrev = [...prev]
      const item = newPrev[fromDayIdx].ejercicios.find(e => e.tempId === tempId)
      if (!item) return prev
      newPrev[fromDayIdx] = { ...newPrev[fromDayIdx], ejercicios: newPrev[fromDayIdx].ejercicios.filter(e => e.tempId !== tempId) }
      newPrev[toDayIdx] = { ...newPrev[toDayIdx], ejercicios: [...newPrev[toDayIdx].ejercicios, { ...item, tempId: `temp-${Date.now()}` }] }
      return newPrev
    })
  }

  const filteredExercises = ejercicios.filter(e => e.nombre?.toLowerCase().includes(searchEx.toLowerCase()))

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

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
        <select value={selectedRutina} onChange={e => setSelectedRutina(e.target.value)} className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange">
          <option value="">Elegí una rutina...</option>
          {rutinas.map(r => {
            const alumno = alumnos.find(a => a.id === r.alumnoId)
            return <option key={r.id} value={r.id}>{r.nombre} — {alumno?.nombre || 'Sin alumno'}</option>
          })}
        </select>
      </div>

      {selectedRutina && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gym-orange">{weekPlan.filter(d => d.activo).length}</p>
              <p className="text-xs text-gray-400">Días activos</p>
            </div>
            <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{weekPlan.reduce((a, d) => a + d.ejercicios.length, 0)}</p>
              <p className="text-xs text-gray-400">Ejercicios</p>
            </div>
            <div className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{weekPlan.filter(d => !d.activo).length}</p>
              <p className="text-xs text-gray-400">Descanso</p>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter}>
            <div className="space-y-3">
              {weekPlan.map((day, diaIdx) => (
                <DayColumn
                  key={diaIdx}
                  day={day}
                  diaIdx={diaIdx}
                  ejercicios={ejercicios}
                  onToggle={toggleDay}
                  onAddExercise={() => setShowAddExercise(diaIdx)}
                  onRemoveExercise={removeExerciseFromDay}
                  onUpdateExercise={updateExerciseInDay}
                  onUpdateNotes={updateDayNotes}
                  onDragEnd={reorderDayExercises}
                  onMoveToDay={moveExerciseToDay}
                />
              ))}
            </div>
          </DndContext>

          <button onClick={savePlan} className="w-full bg-gym-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-gym-orange-dark transition-colors">
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
        <ExerciseDrawer
          diaIdx={showAddExercise}
          filteredExercises={filteredExercises}
          onClose={() => { setShowAddExercise(null); setSearchEx('') }}
          onAdd={addExerciseToDay}
          searchEx={searchEx}
          setSearchEx={setSearchEx}
        />
      )}
    </div>
  )
}

function DayColumn({ day, diaIdx, ejercicios, onToggle, onAddExercise, onRemoveExercise, onUpdateExercise, onUpdateNotes, onDragEnd, onMoveToDay }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
      const { active, over } = e
      if (active.id !== over?.id) {
        if (over?.data?.current?.type === 'DayColumn') {
          onMoveToDay(diaIdx, over.data.current.index, active.id)
        } else {
          onDragEnd(diaIdx, active.id, over.id)
        }
      }
    }}>
    <div className={`bg-gym-dark-card border rounded-2xl overflow-hidden transition-colors ${day.activo ? 'border-gym-dark-border' : 'border-red-500/20 opacity-60'}`}>
      <div className={`flex items-center justify-between p-4 cursor-pointer ${day.activo ? 'bg-gym-dark-card' : 'bg-red-500/5'}`} onClick={() => onToggle(diaIdx)}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${day.activo ? 'bg-gym-orange/20 text-gym-orange' : 'bg-red-500/20 text-red-400'}`}>
            {DIAS_SHORT[diaIdx]}
          </div>
          <div>
            <p className="font-medium text-sm">{day.nombre}</p>
            <p className="text-xs text-gray-400">
              {day.activo ? `${day.ejercicios.length} ejercicio${day.ejercicios.length !== 1 ? 's' : ''}` : 'Día de descanso'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {day.activo && (
            <button onClick={() => onAddExercise(diaIdx)} className="p-2 rounded-lg bg-gym-orange/10 hover:bg-gym-orange/20 transition-colors">
              <Plus size={16} className="text-gym-orange" />
            </button>
          )}
          <Moon size={16} className={day.activo ? 'text-gray-500' : 'text-red-400'} />
        </div>
      </div>

      {day.activo && day.ejercicios.length > 0 && (
        <SortableContext items={day.ejercicios.map(e => e.tempId)} strategy={verticalListSortingStrategy}>
          <div className="px-4 pb-3 space-y-2">
            {day.ejercicios.map((item, ejIdx) => (
              <SortableDayExercise
                key={item.tempId}
                item={item}
                ejercicio={ejercicios.find(e => e.id === item.ejercicioId)}
                dayIdx={diaIdx}
                onRemove={onRemoveExercise}
                onUpdate={onUpdateExercise}
              />
            ))}
          </div>
        </SortableContext>
      )}

      {day.activo && (
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Notas del día..."
            value={day.notas}
            onChange={e => onUpdateNotes(diaIdx, e.target.value)}
            onClick={e => e.stopPropagation()}
            className="w-full bg-gym-dark border border-gym-dark-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gym-orange text-gray-300"
          />
        </div>
      )}
    </div>
    </DndContext>
  )
}

function SortableDayExercise({ item, ejercicio, dayIdx, onRemove, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.tempId })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="bg-gym-dark border border-gym-dark-border rounded-xl p-3">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="p-1 touch-none">
          <GripVertical size={16} className="text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{ejercicio?.nombre || 'Ejercicio'}</p>
          <div className="flex gap-2 mt-1">
            <input type="number" value={item.series} onChange={e => onUpdate(dayIdx, item.tempId, { series: e.target.value })} className="w-12 bg-gym-dark-card border border-gym-dark-border rounded-lg px-2 py-1 text-xs text-center" placeholder="S" />
            <input type="text" value={item.reps} onChange={e => onUpdate(dayIdx, item.tempId, { reps: e.target.value })} className="w-14 bg-gym-dark-card border border-gym-dark-border rounded-lg px-2 py-1 text-xs text-center" placeholder="Reps" />
            <input type="text" value={item.peso} onChange={e => onUpdate(dayIdx, item.tempId, { peso: e.target.value })} className="w-14 bg-gym-dark-card border border-gym-dark-border rounded-lg px-2 py-1 text-xs text-center" placeholder="Peso" />
          </div>
        </div>
        <button onClick={() => onRemove(dayIdx, item.tempId)} className="p-1.5 rounded-lg hover:bg-red-500/10">
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>
    </div>
  )
}

function ExerciseDrawer({ diaIdx, filteredExercises, onClose, onAdd, searchEx, setSearchEx }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-gym-dark-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Agregar a {DIAS[diaIdx]}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gym-dark-border"><Plus size={18} className="rotate-45" /></button>
        </div>
        <input type="text" placeholder="Buscar ejercicio..." value={searchEx} onChange={e => setSearchEx(e.target.value)} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gym-orange mb-3" />
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredExercises.map(ej => (
            <button key={ej.id} onClick={() => onAdd(diaIdx, ej)} className="w-full text-left p-3 rounded-xl hover:bg-gym-dark-border transition-colors flex items-center gap-3">
              {ej.imagen ? (
                <img src={ej.imagen} alt={ej.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gym-dark" onError={e => { e.target.style.display = 'none' }} />
              ) : null}
              <div className={`w-10 h-10 rounded-lg bg-gym-orange/10 flex items-center justify-center text-gym-orange text-xs font-bold flex-shrink-0 ${ej.imagen ? 'hidden' : ''}`}>
                {ej.categoria?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ej.nombre}</p>
                <p className="text-xs text-gray-400">{ej.categoria} · {ej.dificultad}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}