import db from './db'

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

// CSV Export (no API key needed)
export async function exportToCSV(alumnos, ejercicios, rutinas) {
  const rutinaEjercicios = await db.rutinaEjercicios.toArray()
  const sesiones = await db.sesiones.toArray()
  const weeklyPlan = await db.weeklyPlan.toArray()

  const sheets = {
    'Alumnos': alumnosToCSV(alumnos),
    'Ejercicios': ejerciciosToCSV(ejercicios),
    'Rutinas': rutinasToCSV(rutinas, alumnos),
    'Rutina_Ejercicios': rutinaEjToCSV(rutinaEjercicios, ejercicios),
    'Sesiones': sesionesToCSV(sesiones, rutinas, alumnos),
    'Plan_Semanal': weeklyPlanToCSV(weeklyPlan, ejercicios),
  }

  // Create a multi-sheet CSV (one file per sheet, zipped concept)
  // For simplicity, we'll create separate downloads
  for (const [name, csv] of Object.entries(sheets)) {
    downloadCSV(csv, `GymRat_${name}.csv`)
    await new Promise(r => setTimeout(r, 300)) // stagger downloads
  }
}

export async function exportToSingleCSV(alumnos, ejercicios, rutinas) {
  const rutinaEjercicios = await db.rutinaEjercicios.toArray()
  const sesiones = await db.sesiones.toArray()

  let csv = 'SECCIÓN,REGISTRO,CAMPO1,CAMPO2,CAMPO3,CAMPO4,CAMPO5,CAMPO6,CAMPO7,CAMPO8\n'

  // Alumnos
  alumnos.forEach(a => {
    csv += `ALUMNO,"${esc(a.nombre)}","${esc(a.telefono||'')}","${esc(a.whatsapp||'')}","${esc(a.edad||'')}","${esc(a.peso||'')}","${esc(a.altura||'')}","${esc(a.objetivo||'')}","${esc(a.observaciones||'')}"\n`
  })

  csv += '\n'

  // Ejercicios
  ejercicios.forEach(e => {
    csv += `EJERCICIO,"${esc(e.nombre)}","${esc(e.categoria||'')}","${esc(e.dificultad||'')}","${esc(e.series||'')}","${esc(e.reps||'')}","${esc(e.descanso||'')}","${esc(e.descripcion||'')}"\n`
  })

  csv += '\n'

  // Rutinas
  rutinas.forEach(r => {
    const alumno = alumnos.find(a => a.id === r.alumnoId)
    csv += `RUTINA,"${esc(r.nombre)}","${esc(alumno?.nombre||'')}","${esc(r.objetivo||'')}","${esc(r.fechaInicio||'')}","${esc(r.fechaFin||'')}","${esc(r.observaciones||'')}"\n`
  })

  csv += '\n'

  // Rutina-Ejercicios
  rutinaEjercicios.forEach(re => {
    const ej = ejercicios.find(e => e.id === re.ejercicioId)
    const rutina = rutinas.find(r => r.id === re.rutinaId)
    csv += `RUTINA_EJ,"${esc(rutina?.nombre||'')}","${esc(ej?.nombre||'')}","${re.orden}","${re.series}","${esc(re.reps||'')}","${esc(re.peso||'')}","${re.tiempoDescanso}","${esc(re.notas||'')}"\n`
  })

  csv += '\n'

  // Sesiones
  sesiones.forEach(s => {
    const rutina = rutinas.find(r => r.id === s.rutinaId)
    const alumno = alumnos.find(a => a.id === s.alumnoId)
    csv += `SESION,"${esc(rutina?.nombre||'')}","${esc(alumno?.nombre||'')}","${s.fecha}","${s.duracion||0}","${s.completado?'SI':'NO'}"\n`
  })

  downloadCSV(csv, 'GymRat_Completo.csv')
}

function esc(val) {
  return String(val || '').replace(/"/g, '""')
}

function alumnosToCSV(alumnos) {
  let csv = 'Nombre,Teléfono,WhatsApp,Edad,Peso,Altura,Objetivo,Observaciones,Fecha Creación\n'
  alumnos.forEach(a => {
    csv += `"${esc(a.nombre)}","${esc(a.telefono||'')}","${esc(a.whatsapp||'')}","${esc(a.edad||'')}","${esc(a.peso||'')}","${esc(a.altura||'')}","${esc(a.objetivo||'')}","${esc(a.observaciones||'')}","${esc(a.created_at||'')}"\n`
  })
  return csv
}

function ejerciciosToCSV(ejercicios) {
  let csv = 'Nombre,Categoría,Dificultad,Series,Reps,Descanso(s),Descripción,Video URL,Observaciones\n'
  ejercicios.forEach(e => {
    csv += `"${esc(e.nombre)}","${esc(e.categoria||'')}","${esc(e.dificultad||'')}","${esc(e.series||'')}","${esc(e.reps||'')}","${esc(e.descanso||'')}","${esc(e.descripcion||'')}","${esc(e.videoUrl||'')}","${esc(e.observaciones||'')}"\n`
  })
  return csv
}

function rutinasToCSV(rutinas, alumnos) {
  let csv = 'Nombre,Alumno,Objetivo,Fecha Inicio,Fecha Fin,Observaciones\n'
  rutinas.forEach(r => {
    const alumno = alumnos.find(a => a.id === r.alumnoId)
    csv += `"${esc(r.nombre)}","${esc(alumno?.nombre||'')}","${esc(r.objetivo||'')}","${esc(r.fechaInicio||'')}","${esc(r.fechaFin||'')}","${esc(r.observaciones||'')}"\n`
  })
  return csv
}

function rutinaEjToCSV(items, ejercicios) {
  let csv = 'Rutina ID,Ejercicio ID,Ejercicio,Orden,Series,Reps,Peso,Descanso(s),Notas\n'
  items.forEach(item => {
    const ej = ejercicios.find(e => e.id === item.ejercicioId)
    csv += `"${item.rutinaId}","${item.ejercicioId}","${esc(ej?.nombre||'')}","${item.orden}","${item.series}","${esc(item.reps||'')}","${esc(item.peso||'')}","${item.tiempoDescanso}","${esc(item.notas||'')}"\n`
  })
  return csv
}

function sesionesToCSV(sesiones, rutinas, alumnos) {
  let csv = 'Fecha,Rutina,Alumno,Duración(min),Completado\n'
  sesiones.forEach(s => {
    const rutina = rutinas.find(r => r.id === s.rutinaId)
    const alumno = alumnos.find(a => a.id === s.alumnoId)
    csv += `"${esc(s.fecha)}","${esc(rutina?.nombre||'')}","${esc(alumno?.nombre||'')}","${s.duracion||0}","${s.completado?'Sí':'No'}"\n`
  })
  return csv
}

function weeklyPlanToCSV(plan, ejercicios) {
  let csv = 'Día,Activo,Ejercicio,Series,Reps,Peso,Notas Día\n'
  const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
  plan.forEach(p => {
    if (p.ejercicios && p.ejercicios.length > 0) {
      p.ejercicios.forEach(ej => {
        const ejercicio = ejercicios.find(e => e.id === ej.ejercicioId)
        csv += `"${DIAS[p.dia]}","${p.activo?'Sí':'No'}","${esc(ejercicio?.nombre||'')}","${ej.series}","${esc(ej.reps||'')}","${esc(ej.peso||'')}","${esc(p.notas||'')}"\n`
      })
    } else {
      csv += `"${DIAS[p.dia]}","${p.activo?'Sí':'No'}","","","","","${esc(p.notas||'')}"\n`
    }
  })
  return csv
}

function downloadCSV(csv, filename) {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Google Sheets API sync (requires API key + OAuth)
export async function syncToGoogleSheets(spreadsheetId, apiKey, accessToken, data) {
  const { alumnos, ejercicios, rutinas, rutinaEjercicios, sesiones } = data

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  // 1. Get or create sheets
  const metaRes = await fetch(`${SHEETS_BASE}/${spreadsheetId}?key=${apiKey}`, { headers })
  const meta = await metaRes.json()
  const existingSheets = meta.sheets?.map(s => s.properties.title) || []

  const requiredSheets = ['Alumnos', 'Ejercicios', 'Rutinas', 'Rutina_Ejercicios', 'Sesiones']
  const sheetsToCreate = requiredSheets.filter(s => !existingSheets.includes(s))

  if (sheetsToCreate.length > 0) {
    await fetch(`${SHEETS_BASE}/${spreadsheetId}:batchUpdate?key=${apiKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: sheetsToCreate.map(title => ({
          addSheet: { properties: { title } }
        }))
      })
    })
  }

  // 2. Clear and write each sheet
  const sheetData = {
    'Alumnos': {
      headers: ['Nombre', 'Teléfono', 'WhatsApp', 'Edad', 'Peso', 'Altura', 'Objetivo', 'Observaciones'],
      rows: alumnos.map(a => [a.nombre, a.telefono||'', a.whatsapp||'', a.edad||'', a.peso||'', a.altura||'', a.objetivo||'', a.observaciones||''])
    },
    'Ejercicios': {
      headers: ['Nombre', 'Categoría', 'Dificultad', 'Series', 'Reps', 'Descanso(s)', 'Descripción'],
      rows: ejercicios.map(e => [e.nombre, e.categoria||'', e.dificultad||'', e.series||'', e.reps||'', e.descanso||'', e.descripcion||''])
    },
    'Rutinas': {
      headers: ['Nombre', 'Alumno ID', 'Alumno', 'Objetivo', 'Fecha Inicio', 'Fecha Fin'],
      rows: rutinas.map(r => {
        const alumno = alumnos.find(a => a.id === r.alumnoId)
        return [r.nombre, r.alumnoId, alumno?.nombre||'', r.objetivo||'', r.fechaInicio||'', r.fechaFin||'']
      })
    },
    'Rutina_Ejercicios': {
      headers: ['Rutina ID', 'Ejercicio', 'Orden', 'Series', 'Reps', 'Peso', 'Descanso(s)'],
      rows: rutinaEjercicios.map(re => {
        const ej = ejercicios.find(e => e.id === re.ejercicioId)
        return [re.rutinaId, ej?.nombre||'', re.orden, re.series, re.reps||'', re.peso||'', re.tiempoDescanso]
      })
    },
    'Sesiones': {
      headers: ['Fecha', 'Rutina', 'Alumno', 'Duración(min)', 'Completado'],
      rows: sesiones.map(s => {
        const rutina = rutinas.find(r => r.id === s.rutinaId)
        const alumno = alumnos.find(a => a.id === s.alumnoId)
        return [s.fecha, rutina?.nombre||'', alumno?.nombre||'', s.duracion||0, s.completado?'Sí':'No']
      })
    },
  }

  for (const [sheetName, { headers: h, rows }] of Object.entries(sheetData)) {
    // Clear
    await fetch(
      `${SHEETS_BASE}/${spreadsheetId}/values/${sheetName}!A:Z?key=${apiKey}`,
      { method: 'PUT', headers, body: JSON.stringify({ values: [] }) }
    )
    // Write
    await fetch(
      `${SHEETS_BASE}/${spreadsheetId}/values/${sheetName}!A1?key=${apiKey}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ values: [h, ...rows] }),
      }
    )
  }

  return true
}
