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
    const res = await fetch('/exercises.json')
    if (!res.ok) throw new Error('Dataset not found')
    const data = await res.json()

    const exercises = data.map(ex => ({
      nombre: ex.name,
      descripcion: ex.instructions?.es || ex.instructions?.en || `Ejercicio de ${ex.category}. Objetivo: ${ex.target}.`,
      descripcion_en: ex.instructions?.en || '',
      descripcion_es: ex.instructions?.es || '',
      descripcion_it: ex.instructions?.it || '',
      descripcion_tr: ex.instructions?.tr || '',
      descripcion_ru: ex.instructions?.ru || '',
      descripcion_zh: ex.instructions?.zh || '',
      descripcion_hi: ex.instructions?.hi || '',
      descripcion_pl: ex.instructions?.pl || '',
      descripcion_ko: ex.instructions?.ko || '',
      categoria: CATEGORY_MAP[ex.category] || 'Personalizado',
      dificultad: 'Intermedio',
      duracion: '',
      reps: '10-12',
      series: '3',
      descanso: '60',
      videoUrl: '',
      imagen: ex.image ? `/${ex.image}` : null,
      gif: ex.gif_url ? `/${ex.gif_url}` : null,
      equipamiento: ex.equipment || '',
      musculoObjetivo: ex.target || '',
      musculoGrupo: ex.muscle_group || '',
      musculosSecundarios: Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles.join(', ') : (ex.secondary_muscles || ''),
      mediaId: ex.media_id || '',
      attribution: ex.attribution || '© Gym visual — https://gymvisual.com/',
      observaciones: `Equipamiento: ${ex.equipment || 'N/A'}. Músculo principal: ${ex.target || 'N/A'}. Músculos secundarios: ${Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles.join(', ') : 'N/A'}.`,
      created_at: new Date().toISOString(),
    }))

    await db.ejercicios.bulkAdd(exercises)
    return exercises.length
  } catch (e) {
    console.warn('Could not import dataset:', e.message)
    return 0
  }
}