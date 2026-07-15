import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const MUSCLE_COLORS = {
  Pecho: { r: 239, g: 68, b: 68, hex: '#EF4444', light: '#FEE2E2' },
  Espalda: { r: 59, g: 130, b: 246, hex: '#3B82F6', light: '#DBEAFE' },
  Piernas: { r: 34, g: 197, b: 94, hex: '#22C55E', light: '#DCFCE7' },
  Glúteos: { r: 236, g: 72, b: 153, hex: '#EC4899', light: '#FCE7F3' },
  Hombros: { r: 234, g: 179, b: 8, hex: '#EAB308', light: '#FEF9C3' },
  Bíceps: { r: 249, g: 115, b: 22, hex: '#F97316', light: '#FFEDD5' },
  Tríceps: { r: 139, g: 92, b: 246, hex: '#8B5CF6', light: '#EDE9FE' },
  Core: { r: 20, g: 184, b: 166, hex: '#14B8A6', light: '#CCFBF1' },
  Cardio: { r: 244, g: 63, b: 94, hex: '#F43F5E', light: '#FFE4E6' },
  Movilidad: { r: 6, g: 182, b: 212, hex: '#06B6D4', light: '#CFFAFE' },
  Personalizado: { r: 107, g: 114, b: 128, hex: '#6B7280', light: '#F3F4F6' },
}

const GRAY = { r: 100, g: 100, b: 100 }
const DARK = { r: 15, g: 23, b: 42 }
const LIGHT_BG = { r: 248, g: 250, b: 252 }
const WHITE = { r: 255, g: 255, b: 255 }
const ORANGE = { r: 249, g: 115, b: 22 }

function getColor(cat) {
  return MUSCLE_COLORS[cat] || MUSCLE_COLORS.Personalizado
}

function drawRoundedRect(doc, x, y, w, h, r, fill, stroke) {
  if (fill) doc.setFillColor(fill.r, fill.g, fill.b)
  if (stroke) doc.setDrawColor(stroke.r, stroke.g, stroke.b)
  doc.roundedRect(x, y, w, h, r, r, fill ? 'F' : stroke ? 'S' : 'FD')
}

function drawCircle(doc, x, y, r, fill) {
  if (fill) doc.setFillColor(fill.r, fill.g, fill.b)
  doc.circle(x, y, r, 'F')
}

async function generateQR(url) {
  if (!url) return null
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 128,
      margin: 1,
      color: { dark: '#1e293b', light: '#ffffff' },
    })
    return dataUrl
  } catch {
    return null
  }
}

function addFooter(doc, pageIdx, total) {
  const pageW = 210
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 180)
  doc.setFont('helvetica', 'normal')
  doc.text('GymRat — Gestor de Rutinas', 15, 290)
  doc.text(`${pageIdx} / ${total}`, pageW - 15, 290, { align: 'right' })
}

export async function generateRoutinePDF(rutina, alumno, items, ejercicios) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  const pageH = 297
  const margin = 15
  const contentW = pageW - margin * 2
  const sorted = [...items].sort((a, b) => a.orden - b.orden)

  // Pre-generate QR codes for all exercises with video URLs
  const qrCache = {}
  for (const item of sorted) {
    const ej = ejercicios.find(e => e.id === item.ejercicioId)
    if (ej?.videoUrl) {
      qrCache[item.ejercicioId] = await generateQR(ej.videoUrl)
    }
  }

  let pageNum = 0

  // ═══════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════
  pageNum++

  // Full gradient background
  for (let i = 0; i < pageH; i++) {
    const t = i / pageH
    const r = Math.round(249 - t * 200)
    const g = Math.round(115 - t * 80)
    const b = Math.round(22 + t * 20)
    doc.setFillColor(Math.max(r, 30), Math.max(g, 15), Math.max(b, 20))
    doc.rect(0, i, pageW, 1, 'F')
  }

  // Decorative circles
  doc.setFillColor(255, 255, 255)
  doc.setGState(new doc.GState({ opacity: 0.06 }))
  doc.circle(pageW - 30, 50, 60, 'F')
  doc.circle(30, pageH - 60, 45, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))

  // Logo area
  doc.setFillColor(255, 255, 255)
  doc.setGState(new doc.GState({ opacity: 0.15 }))
  doc.roundedRect(margin, 35, 50, 50, 6, 6, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('GR', margin + 10, 68)

  // Title
  doc.setFontSize(42)
  doc.setFont('helvetica', 'bold')
  doc.text('GYMRAT', margin, 110)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.setGState(new doc.GState({ opacity: 0.8 }))
  doc.text('RUTINA DE ENTRENAMIENTO', margin, 122)
  doc.setGState(new doc.GState({ opacity: 1 }))

  // Divider line
  doc.setDrawColor(255, 255, 255)
  doc.setGState(new doc.GState({ opacity: 0.3 }))
  doc.setLineWidth(0.5)
  doc.line(margin, 130, margin + 60, 130)
  doc.setGState(new doc.GState({ opacity: 1 }))

  // White info card
  drawRoundedRect(doc, margin, 145, contentW, 65, 5, { r: 255, g: 255, b: 255 })

  // Student name
  doc.setTextColor(DARK.r, DARK.g, DARK.b)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(alumno?.nombre || 'Alumno', margin + 10, 165)

  // Objective chip
  if (alumno?.objetivo) {
    drawRoundedRect(doc, margin + 10, 170, doc.getTextWidth(alumno.objetivo) + 10, 8, 2, { r: 249, g: 115, b: 22 })
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(alumno.objetivo, margin + 15, 175.5)
  }

  // Stats row
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
  const statY = 190
  const statCols = [
    { label: 'EDAD', value: alumno?.edad ? `${alumno.edad} años` : '—' },
    { label: 'PESO', value: alumno?.peso ? `${alumno.peso} kg` : '—' },
    { label: 'ALTURA', value: alumno?.altura ? `${alumno.altura} cm` : '—' },
  ]
  statCols.forEach((s, i) => {
    const sx = margin + 10 + i * 55
    doc.setFontSize(6)
    doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
    doc.text(s.label, sx, statY)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK.r, DARK.g, DARK.b)
    doc.text(s.value, sx, statY + 8)
  })

  // Stats cards at bottom of cover
  const statsY = 225
  const stats = [
    { label: 'Ejercicios', value: `${sorted.length}`, color: ORANGE },
    { label: 'Objetivo', value: rutina.objetivo || '—', color: { r: 59, g: 130, b: 246 } },
    { label: 'Inicio', value: rutina.fechaInicio || '—', color: { r: 34, g: 197, b: 94 } },
  ]

  const cardW = (contentW - 8) / 3
  stats.forEach((s, i) => {
    const cx = margin + i * (cardW + 4)
    drawRoundedRect(doc, cx, statsY, cardW, 35, 4, { r: 255, g: 255, b: 255 })
    // Color accent line
    doc.setFillColor(s.color.r, s.color.g, s.color.b)
    doc.rect(cx, statsY, cardW, 3, 'F')
    doc.setFontSize(6)
    doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label.toUpperCase(), cx + 6, statsY + 13)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK.r, DARK.g, DARK.b)
    const val = s.value.length > 12 ? s.value.substring(0, 12) + '…' : s.value
    doc.text(val, cx + 6, statsY + 24)
  })

  // Footer
  doc.setTextColor(255, 255, 255)
  doc.setGState(new doc.GState({ opacity: 0.5 }))
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('GymRat — Gestor de Rutinas', margin, pageH - 10)
  doc.text(new Date().toLocaleDateString('es-AR'), pageW - margin, pageH - 10, { align: 'right' })
  doc.setGState(new doc.GState({ opacity: 1 }))

  // ═══════════════════════════════════════════════════════════════
  // EXERCISE CARDS (one page per exercise)
  // ═══════════════════════════════════════════════════════════════
  for (let idx = 0; idx < sorted.length; idx++) {
    const item = sorted[idx]
    const ej = ejercicios.find(e => e.id === item.ejercicioId)
    const color = getColor(ej?.categoria)
    pageNum++
    doc.addPage()

    // Light background
    doc.setFillColor(245, 247, 250)
    doc.rect(0, 0, pageW, pageH, 'F')

    // Top colored header
    doc.setFillColor(color.r, color.g, color.b)
    doc.rect(0, 0, pageW, 55, 'F')

    // Exercise number badge
    doc.setFillColor(255, 255, 255)
    doc.setGState(new doc.GState({ opacity: 0.2 }))
    doc.circle(pageW - 35, 27, 20, 'F')
    doc.setGState(new doc.GState({ opacity: 1 }))

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(`${idx + 1}`, pageW - 37, 32)

    // Exercise name
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setGState(new doc.GState({ opacity: 0.8 }))
    doc.text(`EJERCICIO ${idx + 1} DE ${sorted.length}`, margin, 18)
    doc.setGState(new doc.GState({ opacity: 1 }))

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    const ejName = ej?.nombre || 'Ejercicio'
    doc.text(ejName.length > 30 ? ejName.substring(0, 30) : ejName, margin, 38)

    // Category chip
    if (ej?.categoria) {
      drawRoundedRect(doc, margin, 43, doc.getTextWidth(ej.categoria) + 10, 7, 2, { r: 255, g: 255, b: 255 })
      doc.setTextColor(color.r, color.g, color.b)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(ej.categoria, margin + 5, 47.5)
    }

    // ═══ EXERCISE IMAGE ═══
    let imageEndY = 65
    if (ej?.imagen) {
      try {
        doc.addImage(ej.imagen, 'JPEG', pageW - margin - 50, 5, 45, 45)
        // Rounded border effect
        doc.setDrawColor(color.r, color.g, color.b)
        doc.setLineWidth(0.5)
        doc.roundedRect(pageW - margin - 50, 5, 45, 45, 3, 3, 'S')
      } catch {}
    }

    // ═══ MAIN CARD ═══
    const cardY = 65
    const cardH = 200
    drawRoundedRect(doc, margin, cardY, contentW, cardH, 6, { r: 255, g: 255, b: 255 }, { r: 230, g: 230, b: 230 })

    // ─── Stats Row ───
    const statsRowY = cardY + 8
    const statsData = [
      { icon: '◻', label: 'Series', value: `${item.series}` },
      { icon: '↻', label: 'Reps', value: `${item.reps}` },
      { icon: '⚖', label: 'Peso', value: item.peso ? `${item.peso} kg` : '—' },
      { icon: '⏱', label: 'Descanso', value: `${item.tiempoDescanso}s` },
    ]

    const statCardW = (contentW - 16) / 4
    statsData.forEach((s, i) => {
      const sx = margin + 8 + i * (statCardW + 2)
      drawRoundedRect(doc, sx, statsRowY, statCardW, 28, 4, LIGHT_BG)
      // Color dot
      doc.setFillColor(color.r, color.g, color.b)
      doc.circle(sx + 6, statsRowY + 8, 2.5, 'F')
      doc.setFontSize(6)
      doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
      doc.setFont('helvetica', 'normal')
      doc.text(s.label.toUpperCase(), sx + 11, statsRowY + 9)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK.r, DARK.g, DARK.b)
      doc.text(s.value, sx + 6, statsRowY + 22)
    })

    // ─── Description ───
    let descY = statsRowY + 38
    if (ej?.descripcion) {
      doc.setFillColor(color.r, color.g, color.b)
      doc.rect(margin + 8, descY, 2, 4, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK.r, DARK.g, DARK.b)
      doc.text('DESCRIPCIÓN', margin + 14, descY + 3.5)

      descY += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(70, 70, 70)
      const lines = doc.splitTextToSize(ej.descripcion, contentW - 20)
      doc.text(lines, margin + 10, descY)
      descY += lines.length * 4.5 + 6
    }

    // ─── Tips / Notes ───
    if (item.notas) {
      drawRoundedRect(doc, margin + 8, descY, contentW - 16, 18, 4, { r: 255, g: 243, b: 205 })
      doc.setFillColor(234, 179, 8)
      doc.rect(margin + 8, descY, 3, 18, 'F')
      doc.setFillColor(146, 64, 14)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(146, 64, 14)
      doc.text('NOTA DEL ENTRENADOR', margin + 16, descY + 7)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(item.notas, margin + 16, descY + 14)
      descY += 24
    }

    // ─── Video Link / QR ───
    if (ej?.videoUrl && qrCache[item.ejercicioId]) {
      descY += 4
      drawRoundedRect(doc, margin + 8, descY, contentW - 16, 32, 4, LIGHT_BG)

      // QR code
      try {
        const qrImg = qrCache[item.ejercicioId]
        doc.addImage(qrImg, 'PNG', margin + 12, descY + 3, 26, 26)
      } catch {}

      // Link info
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK.r, DARK.g, DARK.b)
      doc.text('VER VIDEO DEL EJERCICIO', margin + 44, descY + 11)

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
      const url = ej.videoUrl
      doc.text(url.length > 50 ? url.substring(0, 50) + '…' : url, margin + 44, descY + 17)

      doc.setFontSize(7)
      doc.setTextColor(color.r, color.g, color.b)
      doc.setFont('helvetica', 'bold')
      doc.text('Escaneá el código QR con la cámara del celular', margin + 44, descY + 25)

      descY += 38
    }

    // ─── Series Checklist ───
    descY += 4
    doc.setFillColor(color.r, color.g, color.b)
    doc.rect(margin + 8, descY, 2, 4, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK.r, DARK.g, DARK.b)
    doc.text('CHECKLIST DE SERIES', margin + 14, descY + 3.5)
    descY += 8

    for (let s = 0; s < (item.series || 3); s++) {
      drawRoundedRect(doc, margin + 8, descY, contentW - 16, 11, 3, LIGHT_BG)
      // Checkbox
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.3)
      doc.roundedRect(margin + 12, descY + 2.5, 6, 6, 1, 1, 'S')
      // Series info
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(70, 70, 70)
      doc.text(`Serie ${s + 1}`, margin + 22, descY + 7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK.r, DARK.g, DARK.b)
      doc.text(`${item.reps} reps`, margin + 50, descY + 7)
      if (item.peso) {
        doc.setTextColor(color.r, color.g, color.b)
        doc.text(`${item.peso} kg`, margin + 80, descY + 7)
      }
      // Small colored indicator
      doc.setFillColor(color.r, color.g, color.b)
      doc.setGState(new doc.GState({ opacity: 0.15 }))
      doc.circle(pageW - margin - 12, descY + 5.5, 4, 'F')
      doc.setGState(new doc.GState({ opacity: 1 }))

      descY += 13
    }

    addFooter(doc, pageNum, sorted.length + 2)
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY PAGE
  // ═══════════════════════════════════════════════════════════════
  pageNum++
  doc.addPage()

  // Background
  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pageW, pageH, 'F')

  // Header
  doc.setFillColor(DARK.r, DARK.g, DARK.b)
  doc.rect(0, 0, pageW, 50, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN DE RUTINA', margin, 32)

  // Stats row
  const sumStatsY = 60
  const sumStats = [
    { label: 'EJERCICIOS', value: `${sorted.length}`, color: ORANGE },
    { label: 'SERIES TOTALES', value: `${sorted.reduce((a, i) => a + (i.series || 3), 0)}`, color: { r: 59, g: 130, b: 246 } },
    { label: 'DURACIÓN EST.', value: `~${Math.round(sorted.reduce((a, i) => a + ((i.series || 3) * 30 + (i.tiempoDescanso || 60)), 0) / 60)} min`, color: { r: 34, g: 197, b: 94 } },
  ]
  const sCardW = (contentW - 8) / 3
  sumStats.forEach((s, i) => {
    const sx = margin + i * (sCardW + 4)
    drawRoundedRect(doc, sx, sumStatsY, sCardW, 28, 4, { r: 255, g: 255, b: 255 })
    doc.setFillColor(s.color.r, s.color.g, s.color.b)
    doc.rect(sx, sumStatsY, sCardW, 2.5, 'F')
    doc.setFontSize(6)
    doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label, sx + 6, sumStatsY + 12)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK.r, DARK.g, DARK.b)
    doc.text(s.value, sx + 6, sumStatsY + 23)
  })

  // Muscle distribution
  const muscleCount = {}
  sorted.forEach(item => {
    const ej = ejercicios.find(e => e.id === item.ejercicioId)
    const cat = ej?.categoria || 'Personalizado'
    muscleCount[cat] = (muscleCount[cat] || 0) + 1
  })

  let barY = sumStatsY + 42
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(DARK.r, DARK.g, DARK.b)
  doc.text('DISTRIBUCIÓN MUSCULAR', margin, barY)
  barY += 8

  const maxCount = Math.max(...Object.values(muscleCount), 1)
  Object.entries(muscleCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    const c = getColor(cat)
    const barW = (count / maxCount) * (contentW - 60)

    drawRoundedRect(doc, margin, barY, contentW - 50, 10, 2, LIGHT_BG)
    drawRoundedRect(doc, margin, barY, Math.max(barW, 4), 10, 2, { r: c.r, g: c.g, b: c.b })

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(DARK.r, DARK.g, DARK.b)
    doc.text(cat, margin + 3, barY + 7)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
    doc.text(`${count}`, pageW - margin - 8, barY + 7, { align: 'right' })

    barY += 13
  })

  // Exercise list
  barY += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(DARK.r, DARK.g, DARK.b)
  doc.text('LISTA DE EJERCICIOS', margin, barY)
  barY += 8

  sorted.forEach((item, idx) => {
    const ej = ejercicios.find(e => e.id === item.ejercicioId)
    const c = getColor(ej?.categoria)

    drawRoundedRect(doc, margin, barY, contentW, 14, 3, { r: 255, g: 255, b: 255 })
    // Color accent
    doc.setFillColor(c.r, c.g, c.b)
    doc.rect(margin, barY, 3, 14, 'F')
    // Number
    doc.setFillColor(c.r, c.g, c.b)
    doc.setGState(new doc.GState({ opacity: 0.1 }))
    doc.circle(margin + 12, barY + 7, 5, 'F')
    doc.setGState(new doc.GState({ opacity: 1 }))
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`${idx + 1}`, margin + 10, barY + 9)
    // Name
    doc.setTextColor(DARK.r, DARK.g, DARK.b)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const name = ej?.nombre || 'Ejercicio'
    doc.text(name.length > 35 ? name.substring(0, 35) + '…' : name, margin + 20, barY + 6)
    // Details
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
    doc.text(`${item.series}×${item.reps} · ${item.peso ? item.peso + 'kg' : '—'} · ${item.tiempoDescanso}s`, margin + 20, barY + 11)
    // Video indicator
    if (ej?.videoUrl) {
      doc.setFillColor(34, 197, 94)
      doc.circle(pageW - margin - 8, barY + 7, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(5)
      doc.text('▶', pageW - margin - 9.5, barY + 8.5)
    }

    barY += 16
  })

  // Signature area
  barY += 10
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, barY, margin + 65, barY)
  doc.line(pageW - margin - 65, barY, pageW - margin, barY)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(GRAY.r, GRAY.g, GRAY.b)
  doc.text('Firma del Entrenador', margin, barY + 5)
  doc.text('Firma del Alumno', pageW - margin - 65, barY + 5)

  // Date
  doc.text(new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }), pageW / 2, barY + 5, { align: 'center' })

  addFooter(doc, pageNum, sorted.length + 2)

  // Save
  const fileName = `Rutina-${alumno?.nombre || 'Alumno'}-${rutina.nombre || 'Rutina'}.pdf`
  doc.save(fileName)
  return fileName
}

export async function sharePDF(rutina, alumno, items, ejercicios) {
  const doc = await generateRoutinePDFBlob(rutina, alumno, items, ejercicios)
  const blob = doc.output('blob')
  const file = new File([blob], `Rutina-${alumno?.nombre || 'Alumno'}.pdf`, { type: 'application/pdf' })

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Rutina: ${rutina.nombre}`,
        text: `Rutina de entrenamiento para ${alumno?.nombre || 'alumno'}`,
        files: [file],
      })
      return true
    } catch (e) {
      if (e.name !== 'AbortError') {
        downloadBlob(blob, `Rutina-${alumno?.nombre || 'Alumno'}.pdf`)
      }
    }
  } else {
    downloadBlob(blob, `Rutina-${alumno?.nombre || 'Alumno'}.pdf`)
  }
  return false
}

async function generateRoutinePDFBlob(rutina, alumno, items, ejercicios) {
  // Reuse the same logic but return the doc instead of saving
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  const pageH = 297
  const margin = 15
  const contentW = pageW - margin * 2
  const sorted = [...items].sort((a, b) => a.orden - b.orden)

  const qrCache = {}
  for (const item of sorted) {
    const ej = ejercicios.find(e => e.id === item.ejercicioId)
    if (ej?.videoUrl) {
      qrCache[item.ejercicioId] = await generateQR(ej.videoUrl)
    }
  }

  // Cover
  for (let i = 0; i < pageH; i++) {
    const t = i / pageH
    doc.setFillColor(Math.round(249 - t * 200), Math.round(115 - t * 80), Math.round(22 + t * 20))
    doc.rect(0, i, pageW, 1, 'F')
  }
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(42)
  doc.setFont('helvetica', 'bold')
  doc.text('GYMRAT', margin, 110)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text('RUTINA DE ENTRENAMIENTO', margin, 122)
  drawRoundedRect(doc, margin, 145, contentW, 65, 5, { r: 255, g: 255, b: 255 })
  doc.setTextColor(DARK.r, DARK.g, DARK.b)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(alumno?.nombre || 'Alumno', margin + 10, 165)

  // Exercises
  for (let idx = 0; idx < sorted.length; idx++) {
    const item = sorted[idx]
    const ej = ejercicios.find(e => e.id === item.ejercicioId)
    const color = getColor(ej?.categoria)
    doc.addPage()
    doc.setFillColor(245, 247, 250)
    doc.rect(0, 0, pageW, pageH, 'F')
    doc.setFillColor(color.r, color.g, color.b)
    doc.rect(0, 0, pageW, 55, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(ej?.nombre || 'Ejercicio', margin, 38)
  }

  return doc
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
