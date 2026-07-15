import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Trash2, Edit, X } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'

export default function Alumnos() {
  const { alumnos, addAlumno, deleteAlumno, showToast } = useAppStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', telefono: '', whatsapp: '', edad: '', peso: '', altura: '', objetivo: '', observaciones: '' })
  const navigate = useNavigate()

  const filtered = alumnos.filter(a =>
    a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    a.telefono?.includes(search)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    if (editando) {
      await useAppStore.getState().updateAlumno(editando.id, form)
      showToast('Alumno actualizado', 'success')
    } else {
      await addAlumno(form)
      showToast('Alumno creado', 'success')
    }
    setForm({ nombre: '', telefono: '', whatsapp: '', edad: '', peso: '', altura: '', objetivo: '', observaciones: '' })
    setEditando(null)
    setShowForm(false)
  }

  const handleEdit = (alumno) => {
    setForm({
      nombre: alumno.nombre || '',
      telefono: alumno.telefono || '',
      whatsapp: alumno.whatsapp || '',
      edad: alumno.edad || '',
      peso: alumno.peso || '',
      altura: alumno.altura || '',
      objetivo: alumno.objetivo || '',
      observaciones: alumno.observaciones || '',
    })
    setEditando(alumno)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este alumno?')) {
      await deleteAlumno(id)
      showToast('Alumno eliminado', 'success')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Alumnos</h2>
        <button
          onClick={() => { setEditando(null); setForm({ nombre: '', telefono: '', whatsapp: '', edad: '', peso: '', altura: '', objetivo: '', observaciones: '' }); setShowForm(true) }}
          className="bg-gym-orange text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gym-dark-card border border-gym-dark-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gym-orange transition-colors"
        />
      </div>

      <div className="space-y-2">
        {filtered.map(alumno => (
          <div
            key={alumno.id}
            className="bg-gym-dark-card border border-gym-dark-border rounded-xl p-4 flex items-center gap-3"
          >
            <button
              onClick={() => navigate(`/alumnos/${alumno.id}`)}
              className="flex-1 flex items-center gap-3 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gym-orange/20 flex items-center justify-center text-gym-orange font-bold">
                {alumno.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{alumno.nombre}</p>
                <p className="text-xs text-gray-400 truncate">
                  {alumno.objetivo || 'Sin objetivo definido'}
                </p>
              </div>
            </button>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(alumno)} className="p-2 rounded-lg hover:bg-gym-dark-border transition-colors">
                <Edit size={16} className="text-gray-400" />
              </button>
              <button onClick={() => handleDelete(alumno.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No se encontraron alumnos</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-gym-dark-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editando ? 'Editar Alumno' : 'Nuevo Alumno'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gym-dark-border">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange"
                  placeholder="Nombre del alumno"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                  <input type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="+54 11 1234-5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="+54 11 1234-5678" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Edad</label>
                  <input type="number" value={form.edad} onChange={e => setForm({ ...form, edad: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="25" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Peso (kg)</label>
                  <input type="number" step="0.1" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="75" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Altura (cm)</label>
                  <input type="number" value={form.altura} onChange={e => setForm({ ...form, altura: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange" placeholder="175" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Objetivo</label>
                <select value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange">
                  <option value="">Seleccionar...</option>
                  <option value="Ganar masa muscular">Ganar masa muscular</option>
                  <option value="Perder peso">Perder peso</option>
                  <option value="Mantenerse en forma">Mantenerse en forma</option>
                  <option value="Mejorar resistencia">Mejorar resistencia</option>
                  <option value="Rehabilitación">Rehabilitación</option>
                  <option value="Fuerza">Fuerza</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gym-orange resize-none" rows={3} placeholder="Lesiones, preferencias, etc." />
              </div>
              <button type="submit" className="w-full bg-gym-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-gym-orange-dark transition-colors">
                {editando ? 'Guardar Cambios' : 'Crear Alumno'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
