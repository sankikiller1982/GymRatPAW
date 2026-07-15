import Dexie from 'dexie'

const db = new Dexie('GymRatDB')

db.version(1).stores({
  alumnos: '++id, nombre, telefono, whatsapp, created_at',
  ejercicios: '++id, nombre, categoria, dificultad, created_at',
  rutinas: '++id, alumnoId, nombre, fechaInicio, fechaFin, created_at',
  rutinaEjercicios: '++id, rutinaId, ejercicioId, orden, series, reps, peso, tiempoDescanso, notas',
  sesiones: '++id, rutinaId, alumnoId, fecha, duracion, completado',
  weeklyPlan: '++id, rutinaId, dia, orden',
  settings: 'key'
})

export default db
