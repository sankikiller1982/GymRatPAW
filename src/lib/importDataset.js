import db from './db'

const CATEGORY_MAP = {
  'chest': 'Pecho',
  'back': 'Espalda',
  'upper legs': 'Piernas',
  'lower legs': 'Piernas',
  'waist': 'Core',
  'shoulders': 'Hombros',
  'upper arms': 'Bíceps',
  'lower arms': 'Movilidad',
  'cardio': 'Cardio',
  'neck': 'Movilidad',
}

export async function importExercisesFromDataset() {
  const count = await db.ejercicios.count()
  if (count > 0) return count

  try {
    const res = await fetch('/exercises-dataset/data/exercises.json')
    if (!res.ok) throw new Error('Dataset not found')
    const data = await res.json()

    const exercises = data.map(ex => ({
      nombre: ex.name,
      descripcion: `Ejercicio de ${ex.category}. Grupo muscular objetivo: ${ex.target}.`,
      categoria: CATEGORY_MAP[ex.category] || 'Personalizado',
      dificultad: 'Intermedio',
      duracion: '',
      reps: '10-12',
      series: '3',
      descanso: '60',
      videoUrl: '',
      imagen: ex.image || null,
      gif: ex.gif_url || null,
      equipamiento: ex.equipment || '',
      musculoObjetivo: ex.target || '',
      musculoGrupo: ex.muscle_group || '',
      instrucciones: ex.instructions || {},
      observaciones: `Músculo: ${ex.muscle_group || 'N/A'}. Equipamiento: ${ex.equipment || 'N/A'}`,
      created_at: new Date().toISOString(),
    }))

    await db.ejercicios.bulkAdd(exercises)
    return exercises.length
  } catch (e) {
    console.warn('Could not import dataset:', e.message)
    return 0
  }
}
