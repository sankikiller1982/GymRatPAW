import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import db from '../lib/db'

const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      sidebarOpen: false,
      currentView: 'dashboard',
      theme: 'dark',
      language: 'es',
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setView: (view) => set({ currentView: view, sidebarOpen: false }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),

      // Alumnos
      alumnos: [],
      loadAlumnos: async () => {
        const alumnos = await db.alumnos.toArray()
        set({ alumnos })
      },
      addAlumno: async (alumno) => {
        const id = await db.alumnos.add({ ...alumno, created_at: new Date().toISOString() })
        await get().loadAlumnos()
        return id
      },
      updateAlumno: async (id, data) => {
        await db.alumnos.update(id, data)
        await get().loadAlumnos()
      },
      deleteAlumno: async (id) => {
        await db.alumnos.delete(id)
        await get().loadAlumnos()
      },

      // Ejercicios
      ejercicios: [],
      loadEjercicios: async () => {
        const ejercicios = await db.ejercicios.toArray()
        set({ ejercicios })
      },
      addEjercicio: async (ejercicio) => {
        const id = await db.ejercicios.add({ ...ejercicio, created_at: new Date().toISOString() })
        await get().loadEjercicios()
        return id
      },
      updateEjercicio: async (id, data) => {
        await db.ejercicios.update(id, data)
        await get().loadEjercicios()
      },
      deleteEjercicio: async (id) => {
        await db.ejercicios.delete(id)
        await get().loadEjercicios()
      },

      // Rutinas
      rutinas: [],
      loadRutinas: async () => {
        const rutinas = await db.rutinas.toArray()
        set({ rutinas })
      },
      addRutina: async (rutina) => {
        const id = await db.rutinas.add({ ...rutina, created_at: new Date().toISOString() })
        await get().loadRutinas()
        return id
      },
      updateRutina: async (id, data) => {
        await db.rutinas.update(id, data)
        await get().loadRutinas()
      },
      deleteRutina: async (id) => {
        await db.rutinaEjercicios.where('rutinaId').equals(id).delete()
        await db.weeklyPlan.where('rutinaId').equals(id).delete()
        await db.rutinas.delete(id)
        await get().loadRutinas()
      },

      // Rutina Ejercicios
      rutinaEjercicios: [],
      loadRutinaEjercicios: async (rutinaId) => {
        const items = await db.rutinaEjercicios.where('rutinaId').equals(rutinaId).toArray()
        set({ rutinaEjercicios: items })
      },
      addEjercicioToRutina: async (item) => {
        const maxOrden = await db.rutinaEjercicios
          .where('rutinaId').equals(item.rutinaId)
          .max('orden') || 0
        await db.rutinaEjercicios.add({ ...item, orden: maxOrden + 1 })
      },
      updateRutinaEjercicio: async (id, data) => {
        await db.rutinaEjercicios.update(id, data)
      },
      removeEjercicioFromRutina: async (id) => {
        await db.rutinaEjercicios.delete(id)
      },
      reorderRutinaEjercicios: async (rutinaId, orderedIds) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await db.rutinaEjercicios.update(orderedIds[i], { orden: i + 1 })
        }
      },

      // Sesiones
      sesiones: [],
      loadSesiones: async () => {
        const sesiones = await db.sesiones.toArray()
        set({ sesiones })
      },
      addSesion: async (sesion) => {
        const id = await db.sesiones.add({ ...sesion, fecha: new Date().toISOString() })
        await get().loadSesiones()
        return id
      },

      // Weekly Plan
      weeklyPlan: [],
      loadWeeklyPlan: async (rutinaId) => {
        const plan = await db.weeklyPlan.where('rutinaId').equals(rutinaId).toArray()
        set({ weeklyPlan: plan })
      },
      updateWeeklyPlan: async (rutinaId, plan) => {
        await db.weeklyPlan.where('rutinaId').equals(rutinaId).delete()
        for (const entry of plan) {
          await db.weeklyPlan.add({ ...entry, rutinaId })
        }
      },

      // Stats
      stats: { totalAlumnos: 0, totalRutinas: 0, totalSesiones: 0, totalEjercicios: 0 },
      loadStats: async () => {
        const [totalAlumnos, totalRutinas, totalSesiones, totalEjercicios] = await Promise.all([
          db.alumnos.count(),
          db.rutinas.count(),
          db.sesiones.count(),
          db.ejercicios.count(),
        ])
        set({ stats: { totalAlumnos, totalRutinas, totalSesiones, totalEjercicios } })
      },

      // Initialize - loads all data on startup
      initialize: async () => {
        const [alumnos, ejercicios, rutinas, sesiones] = await Promise.all([
          db.alumnos.toArray(),
          db.ejercicios.toArray(),
          db.rutinas.toArray(),
          db.sesiones.toArray(),
        ])
        set({ alumnos, ejercicios, rutinas, sesiones })
        await get().loadStats()
      },

      // Selected
      selectedAlumno: null,
      selectedRutina: null,
      setSelectedAlumno: (alumno) => set({ selectedAlumno: alumno }),
      setSelectedRutina: (rutina) => set({ selectedRutina: rutina }),
    }),
    {
      name: 'gymrat-ui-state',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)

export { useAppStore }