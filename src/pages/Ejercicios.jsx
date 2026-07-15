import { useState } from 'react'
import { Search, Plus, Trash2, Edit, X, Copy, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'

const CATEGORIAS = [
  'Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros',
  'Bíceps', 'Tríceps', 'Core', 'Cardio', 'Movilidad', 'Personalizado'
]

const DIFICULTADES = ['Principiante', 'Intermedio', 'Avanzado']

export default function Ejercicios() {
  const { ejercicios, addEjercicio, deleteEjercicio, reimportEjercicios } = useAppStore()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [reimporting, setReimporting] = useState(false)
  const emptyForm = { nombre: '', descripcion: '', categoria: '', dificultad: 'Intermedio', duracion: '', reps: '', series: '3', descanso: '60', videoUrl: '', observaciones: '' }
  const [form, setForm] = useState(emptyForm)

  const handleReimport = async () => {
    if (!confirm('¿Reimportar los 1,324 ejercicios del dataset? Se borrarán tus ejercicios personalizados.')) return
    setReimporting(true)
    try {
      const count = await reimportEjercicios()
      alert(`¡Importados ${count} ejercicios!`)
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setReimporting(false)
    }
  }

  const filtered = ejercicios.filter(e => {
    const matchSearch = e.nombre?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || e.categoria === filterCat
    return matchSearch && matchCat
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    if (editando) {
      await useAppStore.getState().updateEjercicio(editando.id, form)
    } else {
      await addEjercicio(form)
    }
    setForm(emptyForm)
    setEditando(null)
    setShowForm(false)
  }

  const handleEdit = (ej) => {
    setForm({ ...emptyForm, ...ej })
    setEditando(ej)
    setShowForm(true)
  }

  const handleDuplicate = async (ej) => {
    const { id, created_at, ...rest } = ej
    await addEjercicio({ ...rest, nombre: `${rest.nombre} (copia)` })
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este ejercicio?')) {
      await deleteEjercicio(id)
    }
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Ejercicios</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleReimport} disabled={reimporting} className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border transition-colors text-gray-400 hover:text-gym-orange" title="Reimportar dataset (1,324 ejercicios)">
            <RefreshCw size={18} className={reimporting ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setEditando(null); setForm(emptyForm); setShowForm(true) }} className="bg-gym-orange text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar ejercicio..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gym-orange" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <button onClick={() => setFilterCat('')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filterCat ? 'bg-gym-orange text-white' : 'bg-gym-dark-card border border-gym-dark-border text-gray-400'}`}>
          Todos ({ejercicios.length})
        </button>
        {CATEGORIAS.map(cat => {
          const count = ejercicios.filter(e => e.categoria === cat).length
          return (
            <button key={cat} onClick={() => setFilterCat(cat === filterCat ? '' : cat)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCat === cat ? 'bg-gym-orange text-white' : 'bg-gym-dark-card border border-gym-dark-border text-gray-400'}`}>
              {cat} ({count})
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        {filtered.map(ej => (
          <div key={ej.id} className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-3 flex items-center gap-3">
            {ej.imagen && (
              <img
                src={ej.imagen}
                alt={ej.nombre}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gym-dark"
                onError={e => { e.target.style.display = 'none' }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{ej.nombre}</p>
              <div className="flex items-center gap-2 mt-1">
                {ej.categoria && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catColors[ej.categoria] || 'bg-gray-500/20 text-gray-400'}`}>
                    {ej.categoria}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{ej.dificultad}</span>
                {ej.series && <span className="text-[10px] text-gray-400">{ej.series}×{ej.reps || '?'}</span>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleDuplicate(ej)} className="p-2 rounded-lg hover:bg-gym-dark-border transition-colors" title="Duplicar">
                <Copy size={14} className="text-gray-400" />
              </button>
              <button onClick={() => handleEdit(ej)} className="p-2 rounded-lg hover:bg-gym-dark-border transition-colors">
                <Edit size={14} className="text-gray-400" />
              </button>
              <button onClick={() => handleDelete(ej.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No se encontraron ejercicios</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-gym-dark-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editando ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gym-dark-border"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
                <input type="text" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="Ej: Press de banca" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange resize-none" rows={3} placeholder="Descripción del ejercicio..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange">
                    <option value="">Seleccionar...</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Dificultad</label>
                  <select value={form.dificultad} onChange={e => setForm({ ...form, dificultad: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange">
                    {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Series</label>
                  <input type="number" value={form.series} onChange={e => setForm({ ...form, series: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reps</label>
                  <input type="text" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="10-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Descanso (s)</label>
                  <input type="number" value={form.descanso} onChange={e => setForm({ ...form, descanso: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="60" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL Video (YouTube/Vimeo/Drive)</label>
                <input type="url" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange resize-none" rows={2} placeholder="Notas adicionales..." />
              </div>
              <button type="submit" className="w-full bg-gym-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-gym-orange-dark transition-colors">
                {editando ? 'Guardar Cambios' : 'Crear Ejercicio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
