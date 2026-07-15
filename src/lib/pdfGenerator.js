import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const MUSCLE_COLORS = {
  pecho: { primary: '#EF4444', light: '#FEF2F2', dark: '#991B1B', name: 'Pecho' },
  espalda: { primary: '#3B82F6', light: '#EFF6FF', dark: '#1E40AF', name: 'Espalda' },
  piernas: { primary: '#22C55E', light: '#F0FDF4', dark: '#166534', name: 'Piernas' },
  hombros: { primary: '#EAB308', light: '#FEFCE8', dark: '#854D0E', name: 'Hombros' },
  biceps: { primary: '#F97316', light: '#FFF7ED', dark: '#9A3412', name: 'Bíceps' },
  triceps: { primary: '#A855F7', light: '#F5F3FF', dark: '#6B21A8', name: 'Tríceps' },
  pantorrillas: { primary: '#9CA3AF', light: '#F9FAFB', dark: '#374151', name: 'Pantorrillas' },
  abdominales: { primary: '#06B6D4', light: '#ECFEFF', dark: '#164E63', name: 'Abdominales' },
  gluteos: { primary: '#EC4899', light: '#FDF2F8', dark: '#9D174D', name: 'Glúteos' },
  default: { primary: '#6366F1', light: '#EEF2FF', dark: '#312E81', name: 'General' },
}

const MUSCLE_ICONS = {
  pecho: '💪',
  espalda: '🏋️',
  piernas: '🦵',
  hombros: '🏋️‍♂️',
  biceps: '💪',
  triceps: '💪',
  pantorrillas: '🦵',
  abdominales: '🧘',
  gluteos: '🍑',
  default: '💪',
}

const COLORS = {
  white: '#FFFFFF',
  black: '#111827',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green500: '#22C55E',
  green600: '#16A34A',
  yellow50: '#FEFCE8',
  yellow100: '#FEF9C3',
  yellow500: '#EAB308',
  yellow600: '#CA8A04',
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange500: '#F97316',
  orange600: '#EA580C',
  purple50: '#F5F3FF',
  purple100: '#EDE9FE',
  purple500: '#A855F7',
  purple600: '#9333EA',
  pink50: '#FDF2F8',
  pink100: '#FCE7F3',
  pink500: '#EC4899',
  pink600: '#DB2777',
  cyan50: '#ECFEFF',
  cyan100: '#CFFAFE',
  cyan500: '#06B6D4',
  cyan600: '#0891B2',
}

class PDFGenerator {
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = 210
    this.pageHeight = 297
    this.margin = 20
    this.contentWidth = this.pageWidth - this.margin * 2
    this.currentY = 0
    this.currentExerciseIndex = 0
    this.totalExercises = 0
    this.currentColor = COLORS.black
    this.currentMuscle = 'default'
  }

  getColor(muscle) {
    const m = muscle?.toLowerCase() || 'default'
    return MUSCLE_COLORS[m] || MUSCLE_COLORS.default
  }

  getIcon(muscle) {
    const m = muscle?.toLowerCase() || 'default'
    return MUSCLE_ICONS[m] || MUSCLE_ICONS.default
  }

  setColor(muscle) {
    this.currentMuscle = muscle?.toLowerCase() || 'default'
    this.currentColor = this.getColor(this.currentMuscle).primary
  }

  async addImageFromUrl(url, format = 'JPEG') {
    if (!url) return null
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  async generateQRCode(text) {
    try {
      return await QRCode.toDataURL(text, {
        width: 120,
        margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      })
    } catch {
      return null
    }
  }

  addBackground(color = COLORS.gray50) {
    this.doc.setFillColor(color)
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
  }

  addRoundedRect(x, y, w, h, r, fillColor, strokeColor = null, strokeWidth = 0) {
    this.doc.setFillColor(fillColor)
    if (strokeColor) {
      this.doc.setDrawColor(strokeColor)
      this.doc.setLineWidth(strokeWidth)
    }
    this.doc.roundedRect(x, y, w, h, r, r, strokeColor ? 'FD' : 'F')
  }

  addShadow(x, y, w, h, r, opacity = 0.1) {
    this.doc.setFillColor('rgba(0,0,0,' + opacity + ')')
    this.doc.roundedRect(x + 2, y + 4, w, h, r, r, 'F')
  }

  addText(text, x, y, options = {}) {
    const {
      size = 10,
      color = COLORS.black,
      font = 'helvetica',
      style = 'normal',
      align = 'left',
      maxWidth = null,
      lineHeight = 1.4,
    } = options

    this.doc.setFontSize(size)
    this.doc.setFont(font, style)
    this.doc.setTextColor(color)

    if (maxWidth) {
      const lines = this.doc.splitTextToSize(text, maxWidth)
      lines.forEach((line, i) => {
        this.doc.text(line, x, y + i * size * lineHeight, { align })
      })
      return lines.length * size * lineHeight
    } else {
      this.doc.text(text, x, y, { align })
      return size
    }
  }

  addIcon(icon, x, y, size = 12, color = COLORS.black) {
    this.doc.setFontSize(size)
    this.doc.setTextColor(color)
    this.doc.text(icon, x, y)
  }

  addDivider(x, y, w, color = COLORS.gray200, thickness = 1) {
    this.doc.setDrawColor(color)
    this.doc.setLineWidth(thickness)
    this.doc.line(x, y, x + w, y)
  }

  addDottedDivider(x, y, w, color = COLORS.gray300, dashLength = 2, gapLength = 2) {
    this.doc.setDrawColor(color)
    this.doc.setLineWidth(1)
    this.doc.setLineDashPattern([dashLength, gapLength])
    this.doc.line(x, y, x + w, y)
    this.doc.setLineDashPattern([])
  }

  checkNewPage(minSpace = 50) {
    if (this.currentY + minSpace > this.pageHeight - this.margin) {
      this.addPage()
      return true
    }
    return false
  }

  addPage() {
    this.doc.addPage()
    this.currentY = this.margin
  }

  addFooter(pageNum, totalPages) {
    const y = this.pageHeight - 15
    this.doc.setDrawColor(this.currentColor)
    this.doc.setLineWidth(1)
    this.doc.line(this.margin, y - 5, this.pageWidth - this.margin, y - 5)

    this.addText(`${this.totalExercises > 0 ? `Ejercicio ${this.currentExerciseIndex} de ${this.totalExercises}` : ''}  |  Página ${pageNum} de ${totalPages}`,
      this.pageWidth / 2, y + 3, { size: 8, color: COLORS.gray500, align: 'center' })

    this.addProgressBar(this.margin, y - 12, this.contentWidth, 4,
      this.totalExercises > 0 ? this.currentExerciseIndex / this.totalExercises : 0)
  }

  addProgressBar(x, y, w, h, progress) {
    this.addRoundedRect(x, y, w, h, h / 2, COLORS.gray200)
    if (progress > 0) {
      this.addRoundedRect(x, y, Math.max(w * progress, 4), h, h / 2, this.currentColor)
    }
  }

  async generateCoverPage(data) {
    const { alumno, rutina, ejercicios, stats } = data
    this.currentY = this.margin

    this.setColor(rutina?.muscleGroup || ejercicios?.[0]?.muscleGroup)

    this.addBackground(this.getColor(this.currentMuscle).light)

    const color = this.getColor(this.currentMuscle)

    this.addRoundedRect(this.margin, this.currentY, this.contentWidth, 180, 24, color.primary)
    this.doc.setFillColor(color.dark)
    this.doc.rect(this.margin, this.currentY, this.contentWidth, 180, 'F')
    this.doc.clip()

    this.doc.setFillColor(color.primary)
    for (let i = 0; i < 8; i++) {
      const x = this.margin + (i * 28)
      this.doc.circle(x, this.currentY + 90, 40 + i * 10, 'F')
    }

    this.doc.setGState(new this.doc.GState({ opacity: 0.15 }))
    this.doc.setFillColor(COLORS.white)
    for (let i = 0; i < 12; i++) {
      const x = this.margin + (i * 18)
      this.doc.rect(x, this.currentY + 20, 8, 160, 'F')
    }
    this.doc.setGState(new this.doc.GState({ opacity: 1 }))
    this.doc.clip()

    this.currentY += 30
    this.addIcon('🏋️', this.pageWidth / 2, this.currentY, 48, COLORS.white)
    this.currentY += 55

    this.addText('WORKOUT PLANNER PRO', this.pageWidth / 2, this.currentY,
      { size: 28, color: COLORS.white, style: 'bold', align: 'center' })
    this.currentY += 16

    this.addText('Plan de Entrenamiento Personalizado', this.pageWidth / 2, this.currentY,
      { size: 14, color: 'rgba(255,255,255,0.85)', align: 'center' })
    this.currentY += 40

    const statsRowY = this.currentY
    const statW = this.contentWidth / 3

    this.addStatCard(this.margin + 10, statsRowY, statW - 20, 50,
      alumno?.nombre || 'Alumno', 'ALUMNO', COLORS.white, 0.9)
    this.addStatCard(this.margin + 10 + statW, statsRowY, statW - 20, 50,
      this.formatDate(rutina?.fechaCreacion), 'FECHA', COLORS.white, 0.9)
    this.addStatCard(this.margin + 10 + statW * 2, statsRowY, statW - 20, 50,
      rutina?.objetivo || 'General', 'OBJETIVO', COLORS.white, 0.9)

    this.currentY = statsRowY + 70
    this.addText('DETALLES DEL ALUMNO', this.margin + 10, this.currentY,
      { size: 11, color: COLORS.white, style: 'bold' })
    this.currentY += 12

    const details = []
    if (alumno?.peso) details.push({ label: 'Peso', value: `${alumno.peso} kg`, icon: '⚖️' })
    if (alumno?.altura) details.push({ label: 'Altura', value: `${alumno.altura} cm`, icon: '📏' })
    if (alumno?.edad) details.push({ label: 'Edad', value: `${alumno.edad} años`, icon: '🎂' })
    if (alumno?.nivel) details.push({ label: 'Nivel', value: alumno.nivel, icon: '📊' })

    const detailW = this.contentWidth / details.length
    details.forEach((d, i) => {
      const x = this.margin + 10 + i * detailW
      this.addIcon(d.icon, x + 5, this.currentY, 14, COLORS.white)
      this.addText(d.label, x + 5, this.currentY + 16, { size: 9, color: 'rgba(255,255,255,0.7)', style: 'normal' })
      this.addText(d.value, x + 5, this.currentY + 24, { size: 13, color: COLORS.white, style: 'bold' })
    })

    this.currentY += 50
    this.addDivider(this.margin + 10, this.currentY, this.contentWidth - 20, 'rgba(255,255,255,0.3)')
    this.currentY += 12

    const summaryItems = [
      { label: 'Ejercicios', value: `${ejercicios?.length || 0}`, icon: '🏋️' },
      { label: 'Tiempo Est.', value: `${stats?.tiempoEstimado || 0} min`, icon: '⏱️' },
      { label: 'Grupos Musc.', value: stats?.gruposMusculares || 0, icon: '💪' },
      { label: 'Volumen', value: `${stats?.volumenTotal || 0} kg`, icon: '📊' },
      { label: 'Videos', value: ejercicios?.filter(e => e.videoUrl).length || 0, icon: '🎥' },
      { label: 'Dificultad', value: stats?.dificultadPromedio || 'Media', icon: '📈' },
    ]

    const itemW = this.contentWidth / 3
    summaryItems.forEach((item, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = this.margin + 10 + col * (itemW - 4)
      const y = this.currentY + row * 35
      this.addStatCard(x, y, itemW - 8, 30, item.value, item.label, COLORS.white, 0.9, item.icon)
    })

    this.currentY += Math.ceil(summaryItems.length / 3) * 35 + 20
    this.addText('Generado por Workout Planner Pro', this.pageWidth / 2, this.pageHeight - 25,
      { size: 9, color: 'rgba(255,255,255,0.5)', align: 'center' })
    this.addText(this.formatDate(new Date()), this.pageWidth / 2, this.pageHeight - 18,
      { size: 9, color: 'rgba(255,255,255,0.5)', align: 'center' })
  }

  addStatCard(x, y, w, h, value, label, color, opacity = 1, icon = '') {
    this.addRoundedRect(x, y, w, h, 12, 'rgba(255,255,255,' + 0.15 + ')', 'rgba(255,255,255,' + (0.2 * opacity) + ')', 1)
    if (icon) {
      this.addIcon(icon, x + w / 2, y + 16, 16, COLORS.white)
    }
    this.addText(value, x + w / 2, y + (icon ? 30 : 18), { size: 18, color: COLORS.white, style: 'bold', align: 'center' })
    this.addText(label, x + w / 2, y + h - 8, { size: 8, color: 'rgba(255,255,255,0.7)', align: 'center' })
  }

  async generateSummaryPage(data) {
    const { rutina, ejercicios, stats } = data
    this.addPage()
    this.currentY = this.margin
    this.setColor(rutina?.muscleGroup)

    this.addBackground(COLORS.gray50)
    this.addText('RESUMEN DEL ENTRENAMIENTO', this.margin, this.currentY,
      { size: 22, color: COLORS.black, style: 'bold' })
    this.currentY += 14

    this.addDivider(this.margin, this.currentY, this.contentWidth, this.currentColor, 3)
    this.currentY += 16

    const summaryItems = [
      { label: 'Ejercicios Totales', value: `${data.ejercicios?.length || 0}`, icon: '🏋️', color: this.currentColor },
      { label: 'Tiempo Estimado', value: `${data.stats?.tiempoEstimado || 0} min`, icon: '⏱️', color: '#3B82F6' },
      { label: 'Grupos Musculares', value: `${data.stats?.gruposMusculares || 0}`, icon: '💪', color: '#22C55E' },
      { label: 'Volumen Total', value: `${data.stats?.volumenTotal || 0} kg`, icon: '📊', color: '#F97316' },
      { label: 'Series Totales', value: `${data.stats?.seriesTotales || 0}`, icon: '🔁', color: '#A855F7' },
      { label: 'Repeticiones Totales', value: `${data.stats?.repeticionesTotales || 0}`, icon: '🎯', color: '#EC4899' },
      { label: 'Videos Disponibles', value: `${data.ejercicios?.filter(e => e.videoUrl).length || 0}`, icon: '🎥', color: '#06B6D4' },
      { label: 'Dificultad Promedio', value: `${data.stats?.dificultadPromedio || 'Media'}`, icon: '📈', color: '#F97316' },
    ]

    const cols = 2
    const cardW = (this.contentWidth - 12) / cols
    const cardH = 56

    summaryItems.forEach((item, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = this.margin + col * (cardW + 12)
      const y = this.currentY + row * (cardH + 12)

      this.addRoundedRect(x, y, cardW, 56, 16, COLORS.white, COLORS.gray200, 1)
      this.addRoundedRect(x, y, cardW, 4, 2, item.color)

      this.addIcon(item.icon, x + 16, y + 20, 20, item.color)
      this.addText(item.value, x + 44, y + 18, { size: 18, color: COLORS.gray800, style: 'bold' })
      this.addText(item.label, x + 44, y + 36, { size: 9, color: COLORS.gray500 })
    })

    this.currentY += Math.ceil(summaryItems.length / 2) * 68 + 20

    if (data.rutina?.notas) {
      this.addSectionTitle('NOTAS DEL ENTRENADOR', '📝')
      this.addNoteCard(data.rutina.notas, '#FEF3C7', '#92400E', '📝')
      this.currentY += 16
    }

    if (data.ejercicios?.some(e => e.videoUrl)) {
      this.addSectionTitle('VIDEOS DISPONIBLES', '🎥')
      this.currentY += 4

      data.ejercicios.filter(e => e.videoUrl).forEach((e, i) => {
        if (i > 5) return
        this.addText(`${i + 1}. ${e.nombre}`, this.margin + 10, this.currentY,
          { size: 10, color: COLORS.gray700 })
        this.addText(e.videoUrl, this.margin + 10, this.currentY + 12,
          { size: 8, color: COLORS.blue600, maxWidth: this.contentWidth - 20 })
        this.currentY += 20
      })
    }
  }

  async generateExercisePages(data) {
    const { ejercicios, rutina } = data
    this.totalExercises = ejercicios?.length || 0

    for (let i = 0; i < this.totalExercises; i++) {
      this.currentExerciseIndex = i + 1
      const ejercicio = ejercicios[i]
      this.setColor(ejercicio.muscleGroup)

      await this.generateExercisePage(ejercicio, i)
    }
  }

  async generateExercisePage(ejercicio, index) {
    this.addPage()
    this.currentY = this.margin

    const color = this.getColor(this.currentMuscle)
    const icon = this.getIcon(this.currentMuscle)

    this.addBackground(COLORS.gray50)

    this.addRoundedRect(this.margin, this.currentY, this.contentWidth, 38, 16, this.currentColor)
    this.addIcon(icon, this.margin + 16, this.currentY + 14, 16, COLORS.white)
    this.addText(`EJERCICIO ${this.currentExerciseIndex} DE ${this.totalExercises}`, this.margin + 40, this.currentY + 12,
      { size: 11, color: 'rgba(255,255,255,0.9)', style: 'normal' })
    this.addText(ejercicio.nombre, this.margin + 40, this.currentY + 26,
      { size: 18, color: COLORS.white, style: 'bold', maxWidth: this.contentWidth - 56 })

    this.currentY += 54

    const stats = [
      { label: 'Series', value: `${ejercicio.series || 3}`, icon: '🔁', color: '#3B82F6' },
      { label: 'Repeticiones', value: `${ejercicio.reps || '10'}`, icon: '🎯', color: '#22C55E' },
      { label: 'Peso', value: `${ejercicio.peso || 0} kg`, icon: '⚖️', color: '#F97316' },
      { label: 'Descanso', value: `${ejercicio.descanso || 120}s`, icon: '😴', color: '#A855F7' },
      { label: 'Trabajo', value: `${ejercicio.tiempoTrabajo || 45}s`, icon: '⏱️', color: '#EC4899' },
      { label: 'Intensidad', value: ejercicio.rpe || 'RPE 8', icon: '🔥', color: '#EF4444' },
    ]

    const statW = (this.contentWidth - 20) / 3
    stats.forEach((stat, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = this.margin + 10 + col * (statW + 6)
      const y = this.currentY + row * 56

      this.addRoundedRect(x, y, statW, 48, 12, COLORS.white, COLORS.gray200, 1)
      this.addRoundedRect(x + 4, y + 4, statW - 8, 4, 2, stat.color)
      this.addIcon(stat.icon, x + 12, y + 16, 16, stat.color)
      this.addText(stat.label, x + 16, y + 16, { size: 9, color: COLORS.gray500 })
      this.addText(stat.value, x + 16, y + 32, { size: 14, color: COLORS.gray800, style: 'bold' })
    })

    this.currentY += Math.ceil(stats.length / 3) * 56 + 16

    if (ejercicio.descripcion) {
      this.addSectionTitle('CÓMO REALIZAR EL EJERCICIO', '📖')
      this.addText(ejercicio.descripcion, this.margin + 10, this.currentY,
        { size: 11, color: COLORS.gray700, maxWidth: this.contentWidth - 20, lineHeight: 1.5 })
      this.currentY += this.getTextHeight(ejercicio.descripcion, 11, this.contentWidth - 20, 1.5) + 16
    }

    if (ejercicio.consejos) {
      this.addTipCard(ejercicio.consejos)
      this.currentY += 16
    }

    if (ejercicio.advertencias) {
      this.addWarningCard(ejercicio.advertencias)
      this.currentY += 16
    }

    if (ejercicio.notas) {
      this.addNoteCard(ejercicio.notas, COLORS.yellow50, COLORS.yellow600, '📝')
      this.currentY += 16
    }

    this.addSectionTitle('SERIES REALIZADAS', '✅')
    this.currentY += 4

    for (let s = 1; s <= (ejercicio.series || 3); s++) {
      this.addRoundedRect(this.margin + 10, this.currentY, this.contentWidth - 20, 28, 10, COLORS.white, COLORS.gray200, 1)
      this.addRoundedRect(this.margin + 14, this.currentY + 4, 20, 20, 6, COLORS.gray100, COLORS.gray300, 1)
      this.addIcon('☐', this.margin + 19, this.currentY + 15, 12, COLORS.gray400)
      this.addText(`Serie ${s}`, this.margin + 42, this.currentY + 10, { size: 11, color: COLORS.gray700 })
      this.addText(`${ejercicio.reps || 10} reps  ·  ${ejercicio.peso || 0} kg  ·  ${ejercicio.descanso || 120}s`,
        this.margin + 42, this.currentY + 19, { size: 9, color: COLORS.gray500 })
      this.currentY += 34
    }

    if (ejercicio.muscleImageUrl) {
      this.currentY += 8
      this.addSectionTitle('MÚSCULO TRABAJADO', '💪')
      this.currentY += 4
      const imgData = await this.addImageFromUrl(ejercicio.muscleImageUrl)
      if (imgData) {
        const imgW = this.contentWidth - 20
        const imgH = imgW * 0.75
        this.addRoundedRect(this.margin + 10, this.currentY, imgW, imgH, 12, COLORS.white, COLORS.gray200, 1)
        try {
          this.doc.addImage(imgData, 'PNG', this.margin + 14, this.currentY + 4, imgW - 8, imgH - 8)
        } catch {}
        this.currentY += imgH + 12
      }
    }

    if (ejercicio.videoUrl) {
      this.currentY += 8
      this.addSectionTitle('VIDEO EXPLICATIVO', '🎥')
      this.currentY += 4

      const qrData = await this.generateQRCode(ejercicio.videoUrl)
      this.addRoundedRect(this.margin + 10, this.currentY, this.contentWidth - 20, 120, 16, COLORS.white, COLORS.gray200, 1)

      if (qrData) {
        this.doc.addImage(qrData, 'PNG', this.margin + 24, this.currentY + 16, 88, 88)
      }

      this.addIcon('🎥', this.margin + 130, this.currentY + 28, 32, this.currentColor)
      this.addText('Video Explicativo', this.margin + 170, this.currentY + 24, { size: 14, color: this.currentColor, style: 'bold' })
      this.addText('Escanea el código QR', this.margin + 170, this.currentY + 36, { size: 10, color: COLORS.gray500 })
      this.addText('para ver el video', this.margin + 170, this.currentY + 46, { size: 10, color: COLORS.gray500 })
      this.addText(ejercicio.videoUrl, this.margin + 170, this.currentY + 60, { size: 8, color: COLORS.blue600, maxWidth: 120 })

      this.addRoundedRect(this.margin + 170, this.currentY + 74, 100, 28, 8, this.currentColor)
      this.addText('ESCANEAR', this.margin + 220, this.currentY + 86, { size: 11, color: COLORS.white, style: 'bold', align: 'center' })
      this.currentY += 136
    }

    if (ejercicio.muscleGroup) {
      this.currentY += 8
      this.addText(`MÚSCULO PRINCIPAL: ${this.getIcon(ejercicio.muscleGroup)} ${ejercicio.muscleGroup.toUpperCase()}`,
        this.margin + 10, this.currentY, { size: 11, color: this.currentColor, style: 'bold' })
      if (ejercicio.musculosSecundarios) {
        this.currentY += 16
        this.addText(`Secundarios: ${ejercicio.musculosSecundarios}`, this.margin + 10, this.currentY,
          { size: 9, color: COLORS.gray500 })
      }
    }
  }

  async generateFinalPage(data) {
    this.addPage()
    this.currentY = this.margin

    this.addBackground(COLORS.gray50)
    this.addText('ENTRENAMIENTO COMPLETADO', this.margin, this.currentY,
      { size: 22, color: COLORS.black, style: 'bold' })
    this.currentY += 14
    this.addDivider(this.margin, this.currentY, this.contentWidth, this.currentColor, 3)
    this.currentY += 16

    this.addText('¡Excelente trabajo! Has completado tu entrenamiento.', this.margin, this.currentY,
      { size: 12, color: COLORS.gray600, maxWidth: this.contentWidth })
    this.currentY += 24

    const finalStats = [
      { label: 'Ejercicios Completados', value: `${data.ejercicios?.length || 0}`, icon: '✅' },
      { label: 'Series Totales', value: `${data.stats?.seriesTotales || 0}`, icon: '🔁' },
      { label: 'Repeticiones Totales', value: `${data.stats?.repeticionesTotales || 0}`, icon: '🎯' },
      { label: 'Volumen Total', value: `${data.stats?.volumenTotal || 0} kg`, icon: '📊' },
      { label: 'Tiempo Total', value: `${data.stats?.tiempoTotal || 0} min`, icon: '⏱️' },
      { label: 'Calorías Estimadas', value: `${data.stats?.calorias || 0} kcal`, icon: '🔥' },
    ]

    const cols = 3
    const cardW = (this.contentWidth - 16) / cols
    const cardH = 50

    data.ejercicios.forEach((e, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = this.margin + 10 + col * (cardW + 6)
      const y = this.currentY + row * 56

      this.addRoundedRect(x, y, cardW, 48, 10, COLORS.white, COLORS.gray200, 1)
      const color = this.getColor(e.muscleGroup).primary
      this.addRoundedRect(x, y, cardW, 3, 2, color)
      this.addText(e.nombre, x + 8, y + 16, { size: 9, color: COLORS.gray700, maxWidth: cardW - 16 })
      this.addText(`${e.series}×${e.reps}  ·  ${e.peso}kg`, x + 8, y + 28, { size: 8, color: COLORS.gray500 })
    })

    this.currentY += Math.ceil(data.ejercicios.length / 3) * 56 + 20

    if (data.rutina?.notas) {
      this.addSectionTitle('NOTAS GENERALES', '📝')
      this.addNoteCard(data.rutina.notas, COLORS.blue50, COLORS.blue600, '📝')
      this.currentY += 16
    }

    this.addSectionTitle('OBSERVACIONES DEL ENTRENADOR', '📋')
    this.currentY += 4

    for (let i = 0; i < 5; i++) {
      this.addRoundedRect(this.margin + 10, this.currentY, this.contentWidth - 20, 22, 8, COLORS.white, COLORS.gray200, 1)
      this.addDottedDivider(this.margin + 18, this.currentY + 11, this.contentWidth - 36, COLORS.gray300)
      this.currentY += 28
    }

    this.currentY += 16
    this.addText('Firma del Entrenador: _________________________    Firma del Alumno: _________________________',
      this.margin, this.currentY, { size: 9, color: COLORS.gray500 })
    this.currentY += 12
    this.addText(`Fecha: ${this.formatDate(new Date())}`, this.margin, this.currentY,
      { size: 9, color: COLORS.gray500 })
  }

  addSectionTitle(title, icon = '') {
    this.addIcon(icon, this.margin + 10, this.currentY, 14, this.currentColor)
    this.addText(title, this.margin + 28, this.currentY, { size: 14, color: this.currentColor, style: 'bold' })
    this.currentY += 4
    this.addDivider(this.margin + 10, this.currentY, this.contentWidth - 20, this.currentColor, 2)
    this.currentY += 12
  }

  addNoteCard(text, bgColor, textColor, icon) {
    this.addRoundedRect(this.margin + 10, this.currentY, this.contentWidth - 20, 44, 12, bgColor)
    this.addRoundedRect(this.margin + 10, this.currentY, 4, 44, 2, textColor)
    this.addIcon(icon, this.margin + 18, this.currentY + 14, 14, textColor)
    this.addText(text, this.margin + 38, this.currentY + 14,
      { size: 10, color: textColor, maxWidth: this.contentWidth - 50, lineHeight: 1.5 })
  }

  addTipCard(text) {
    this.addRoundedRect(this.margin + 10, this.currentY, this.contentWidth - 20, 40, 12, COLORS.blue50)
    this.addRoundedRect(this.margin + 10, this.currentY, 4, 40, 2, COLORS.blue600)
    this.addIcon('💡', this.margin + 18, this.currentY + 14, 14, COLORS.blue600)
    this.addText('CONSEJO', this.margin + 38, this.currentY + 10, { size: 8, color: COLORS.blue600, style: 'bold' })
    this.addText(text, this.margin + 38, this.currentY + 22, { size: 10, color: COLORS.blue600, maxWidth: this.contentWidth - 50 })
  }

  addWarningCard(text) {
    this.addRoundedRect(this.margin + 10, this.currentY, this.contentWidth - 20, 40, 12, COLORS.red50)
    this.addRoundedRect(this.margin + 10, this.currentY, 4, 40, 2, COLORS.red600)
    this.addIcon('⚠', this.margin + 18, this.currentY + 14, 14, COLORS.red600)
    this.addText('ATENCIÓN', this.margin + 38, this.currentY + 10, { size: 8, color: COLORS.red600, style: 'bold' })
    this.addText(text, this.margin + 38, this.currentY + 22, { size: 10, color: COLORS.red600, maxWidth: this.contentWidth - 50 })
  }

  getTextHeight(text, fontSize, maxWidth, lineHeight = 1.4) {
    const lines = this.doc.splitTextToSize(text, maxWidth)
    return lines.length * fontSize * lineHeight
  }

  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  async generate(data) {
    const { alumno, rutina, ejercicios } = data

    const stats = {
      tiempoEstimado: Math.round(ejercicios.reduce((acc, e) =>
        acc + (e.series || 3) * (e.tiempoTrabajo || 45) / 60 + (e.descanso || 120) / 60, 0)),
      gruposMusculares: [...new Set(ejercicios.map(e => e.muscleGroup).filter(Boolean))].length,
      volumenTotal: ejercicios.reduce((acc, e) => acc + (e.series || 3) * (e.reps || 10) * (e.peso || 0), 0),
      seriesTotales: ejercicios.reduce((acc, e) => acc + (e.series || 3), 0),
      repeticionesTotales: ejercicios.reduce((acc, e) => acc + (e.series || 3) * (e.reps || 10), 0),
      dificultadPromedio: 'Media',
      volumenTotal: ejercicios.reduce((acc, e) => acc + (e.series || 3) * (e.reps || 10) * (e.peso || 0), 0),
      tiempoTotal: Math.round(ejercicios.reduce((acc, e) =>
        acc + (e.series || 3) * (e.tiempoTrabajo || 45) / 60 + (e.descanso || 120) / 60, 0)),
      calorias: Math.round(ejercicios.reduce((acc, e) => acc + (e.series || 3) * (e.reps || 10) * (e.peso || 0) * 0.05, 0)),
    }

    await this.generateCoverPage({ alumno, rutina, ejercicios, stats })
    await this.generateSummaryPage({ rutina, ejercicios, stats })
    await this.generateExercisePages({ rutina, ejercicios })
    await this.generateFinalPage({ rutina, ejercicios, stats })

    const totalPages = this.doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.addFooter(i, totalPages)
    }

    return this.doc.output('blob')
  }
}

export async function generateWorkoutPDF(data) {
  const generator = new PDFGenerator()
  return await generator.generate(data)
}

export async function sharePDF(data) {
  const blob = await generateWorkoutPDF(data)
  const file = new File([blob], `Entrenamiento-${data.alumno?.nombre || 'Alumno'}-${new Date().toISOString().split('T')[0]}.pdf`, { type: 'application/pdf' })

  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Plan de Entrenamiento', text: 'Tu plan de entrenamiento personalizado' })
      return true
    } catch (e) {
      if (e.name !== 'AbortError') downloadBlob(blob)
    }
  } else {
    downloadBlob(blob)
  }
  return false
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `Entrenamiento-${new Date().toISOString().split('T')[0]}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

// Backward compatibility exports
export async function generateRoutinePDF(rutina, alumno, items, ejercicios) {
  const data = {
    alumno,
    rutina: { ...rutina, muscleGroup: rutina.muscleGroup || items?.[0]?.muscleGroup },
    ejercicios: items.map(item => {
      const ej = ejercicios.find(e => e.id === item.ejercicioId)
      return { ...ej, ...item }
    })
  }
  return await generateWorkoutPDF(data)
}

export async function shareRoutinePDF(rutina, alumno, items, ejercicios) {
  const data = {
    alumno,
    rutina: { ...rutina, muscleGroup: rutina.muscleGroup || items?.[0]?.muscleGroup },
    ejercicios: items.map(item => {
      const ej = ejercicios.find(e => e.id === item.ejercicioId)
      return { ...ej, ...item }
    })
  }
  return await sharePDF(data)
}

export default PDFGenerator