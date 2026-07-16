import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, GripVertical, Search, X, Filter } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppStore } from '../stores/useAppStore'

function SortableExercise({ item, ejercicio, onRemove, onUpdate }) {
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
            <input
              type="number"
              value={item.series}
              onChange={e => onUpdate(item.tempId, { series: e.target.value })}
              className="w-14 bg-gym-dark-card border border-gym-dark-border rounded-lg px-2 py-1 text-xs text-center"
              placeholder="Series"
              inputMode="numeric"
            />
            <input
              type="text"
              value={item.reps}
              onChange={e => onUpdate(item.tempId, { reps: e.target.value })}
              className="w-16 bg-gym-dark-card border border-gym-dark-border rounded-lg px-2 py-1 text-xs text-center"
              placeholder="Reps"
              inputMode="text"
            />
            <input
              type="text"
              value={item.peso}
              onChange={e => onUpdate(item.tempId, { peso: e.target.value })}
              className="w-16 bg-gym-dark-card border border-gym-dark-border rounded-lg px-2 py-1 text-xs text-center"
              placeholder="Peso"
              inputMode="decimal"
            />
          </div>
        </div>
        <button onClick={() => onRemove(item.tempId)} className="p-1.5 rounded-lg hover:bg-red-500/10">
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>
    </div>
  )
}

export default function RutinaCreate() {
  const { alumnoId } = useParams()
  const navigate = useNavigate()
  const { ejercicios, alumnos, addRutina, addEjercicioToRutina, showToast } = useAppStore()
  const [selectedAlumno, setSelectedAlumno] = useState(alumnoId ? Number(alumnoId) : '')
  const [nombre, setNombre] = useState('')
  const [objetivo, setObjetivo] = useState('')
const [observaciones, setObservaciones] = useState('')
  const [exerciseItems, setExerciseItems] = useState([])
  const [showDrawer, setShowDrawer] = useState(false)
  const [searchEx, setSearchEx] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

  let nextTempId = 0

  const CATEGORIAS = [
    'Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros',
    'Bíceps', 'Tríceps', 'Core', 'Cardio', 'Movilidad', 'Personalizado'
  ]

  const catColors = {
    Pecho: 'bg-red-500/20 text-red-400',
    Espalda: 'bg-blue-500/20 text-blue-400',
    Piernas: 'bg-green-500/20 text-green-400',
    Glúteos: 'bg-pink-500/20 text-pink-400',
    Hombros: 'bg-yellow-500/20 text-yellow-400',
    Bíceps: 'bg-orange-500/20 text-orange-400',
    Tríceps: 'bg-violet-500/20 text-violet-400',
    Core: 'bg-teal-500/20 text-teal-400',
    Cardio: 'bg-rose-500/20 text-rose-400',
    Movilidad: 'bg-cyan-500/20 text-cyan-400',
    Personalizado: 'bg-gray-500/20 text-gray-400',
}
 
  const categoryChips = CATEGORIAS.map(cat => {
    const count = ejercicios.filter(e => e.categoria === cat).length
    return (
      <button
        key={cat}
        onClick={() => setFilterCat(cat === filterCat ? '' : cat)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          filterCat === cat ? 'bg-gym-orange text-white' : `bg-gym-dark-card border border-gym-dark-border ${catColors[cat] || 'text-gray-400'}`
        }`}
      >
        {cat} ({count})
      </button>
    )
  })

  const filteredExercises = ejercicios.filter(e => {
    const matchSearch = e.nombre?.toLowerCase().includes(searchEx.toLowerCase())
    const matchCat = !filterCat || e.categoria === filterCat
    return matchSearch && matchCat
  })

  const addExercise = (ej) => {
    const tempId = `temp-${Date.now()}-${nextTempId++}`
    setExerciseItems(prev => [...prev, {
      tempId,
      ejercicioId: ej.id,
      series: ej.series || '3',
      reps: ej.reps || '10',
      peso: '',
      tiempoDescanso: ej.descanso || '60',
      notas: '',
    }])
    setShowDrawer(false)
    setSearchEx('')
  }

  const removeExercise = (tempId) => {
    setExerciseItems(prev => prev.filter(i => i.tempId !== tempId))
  }

  const updateExercise = (tempId, data) => {
    setExerciseItems(prev => prev.map(i => i.tempId === tempId ? { ...i, ...data } : i))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setExerciseItems(prev => {
        const oldIndex = prev.findIndex(i => i.tempId === active.id)
        const newIndex = prev.findIndex(i => i.tempId === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleSave = async () => {
    if (!selectedAlumno || !nombre.trim()) {
      showToast('Selecciona un alumno y ponle nombre a la rutina', 'error')
      return
    }
    try {
      console.log('addRutina:', addRutina, 'addEjercicioToRutina:', addEjercicioToRutina)
      if (typeof addRutina !== 'function') {
        showToast('Error: addRutina no está disponible', 'error')
        return
      }
      if (typeof addEjercicioToRutina !== 'function') {
        showToast('Error: addEjercicioToRutina no está disponible', 'error')
        return
      }
      const rutinaId = await addRutina({
        alumnoId: Number(selectedAlumno),
        nombre,
        objetivo,
        observaciones,
      })
      console.log('rutinaId:', rutinaId)
      for (let i = 0; i < exerciseItems.length; i++) {
        const item = exerciseItems[i]
        await addEjercicioToRutina({
          rutinaId,
          ejercicioId: item.ejercicioId,
          orden: i + 1,
          series: Number(item.series) || 3,
          reps: item.reps,
          peso: item.peso,
          tiempoDescanso: Number(item.tiempoDescanso) || 60,
          notas: item.notas,
        })
      }
      showToast('Rutina creada correctamente', 'success')
      navigate(`/rutinas/${rutinaId}`)
    } catch (error) {
      console.error('Error al crear rutina:', error)
      showToast('Error al crear rutina: ' + error.message, 'error')
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold">Nueva Rutina</h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Alumno *</label>
          <select value={selectedAlumno} onChange={e => setSelectedAlumno(e.target.value)} className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange">
            <option value="">Seleccionar alumno...</option>
            {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de la rutina *</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="Ej: Rutina Torso-Pierna" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Objetivo</label>
          <input type="text" value={objetivo} onChange={e => setObjetivo(e.target.value)} className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="Ej: Hipertrofia, Fuerza..." />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Ejercicios ({exerciseItems.length})</h3>
          <button onClick={() => setShowDrawer(true)} className="bg-gym-orange text-white px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1">
            <Plus size={14} /> Agregar
          </button>
        </div>

        {exerciseItems.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exerciseItems.map(i => i.tempId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {exerciseItems.map((item) => (
                  <SortableExercise
                    key={item.tempId}
                    item={item}
                    ejercicio={ejercicios.find(e => e.id === item.ejercicioId)}
                    onRemove={removeExercise}
                    onUpdate={updateExercise}
                  />
))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gym-dark-border rounded-xl">
            <p className="text-sm">Agrega ejercicios desde la biblioteca</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Observaciones</label>
        <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange resize-none" rows={3} placeholder="Notas para el alumno..." />
      </div>

      <button onClick={handleSave} className="w-full bg-gym-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-gym-orange-dark transition-colors">
        Crear Rutina
      </button>

      {showDrawer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-gym-dark-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Seleccionar Ejercicio</h3>
              <button onClick={() => { setShowDrawer(false); setSearchEx('') }} className="p-2 rounded-lg hover:bg-gym-dark-border"><X size={18} /></button>
            </div>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar..." value={searchEx} onChange={e => setSearchEx(e.target.value)} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gym-orange" />
            </div>
            <div className="sticky top-0 z-10 bg-gym-dark-card/95 backdrop-blur-sm px-4 pb-2 -mx-4 mb-3 border-b border-gym-dark-border">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <button
                onClick={() => setFilterCat('')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !filterCat ? 'bg-gym-orange text-white' : 'bg-gym-dark-card border border-gym-dark-border text-gray-400'
                }`}
              >
                Todos ({ejercicios.length})
              </button>
              {categoryChips}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pt-2">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {ejercicios.length === 0 ? (
                      <>
                        <p className="font-medium">No hay ejercicios disponibles</p>
                        <p className="text-xs mt-1">Ve a la pestaña <strong>Ejercicios</strong> y toca el botón 🔄 para importar el dataset</p>
                      </>
                    ) : (
                      <p>No se encontraron ejercicios con ese filtro</p>
                    )}
                  </div>
                ) : (
                  filteredExercises.map(ej => (
                    <button 
                      key={ej.id} 
                      onClick={() => { console.log('Click ejercicio:', ej.nombre); addExercise(ej); }}
                      className="w-full text-left p-3 rounded-xl hover:bg-gym-dark-border transition-colors flex items-center gap-3 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
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
)))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}