import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Play, Pause, SkipForward, SkipBack, CheckCircle, X, Timer, 
  RotateCcw, ChevronLeft, ChevronRight, Volume2, VolumeX,
  AlertCircle, Check, Save
} from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import db from '../lib/db'

const STORAGE_KEY = 'workout-session-'

export default function WorkoutMode() {
  const { rutinaId } = useParams()
  const navigate = useNavigate()
  const { rutinas, ejercicios, addSesion } = useAppStore()
  const [items, setItems] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [currentSeries, setCurrentSeries] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isResting, setIsResting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [completed, setCompleted] = useState({})
  const [timerDuration, setTimerDuration] = useState(30)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  const rutina = rutinas.find(r => r.id === Number(rutinaId))

  useEffect(() => {
    if (rutinaId) {
      db.rutinaEjercicios.where('rutinaId').equals(Number(rutinaId)).toArray().then(data => {
        const sorted = data.sort((a, b) => a.orden - b.orden)
        setItems(sorted)
        loadSessionState(sorted)
      })
    }
  }, [rutinaId])

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    audioRef.current.volume = 0.5
  }, [])

  const currentItem = items[currentIdx]
  const currentEjercicio = ejercicios.find(e => e.id === currentItem?.ejercicioId)
  const totalSeries = currentItem?.series || 3

  // Load persisted session state
  const loadSessionState = useCallback((sortedItems) => {
    const stored = localStorage.getItem(STORAGE_KEY + rutinaId)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.items && parsed.items.length === sortedItems.length) {
          setCompleted(parsed.completed || {})
          setCurrentIdx(parsed.currentIdx || 0)
          setCurrentSeries(parsed.currentSeries || 0)
          setSessionStartTime(parsed.sessionStartTime || Date.now())
        }
      } catch {}
    }
  }, [rutinaId])

  // Save session state
  const saveSessionState = useCallback(() => {
    if (!rutinaId) return
    const state = {
      items,
      completed,
      currentIdx,
      currentSeries,
      sessionStartTime: sessionStartTime || Date.now(),
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY + rutinaId, JSON.stringify(state))
  }, [rutinaId, items, completed, currentIdx, currentSeries, sessionStartTime])

  useEffect(() => {
    saveSessionState()
  }, [saveSessionState])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    }
    return () => clearTimeout(timerRef.current)
  }, [timeLeft, isRunning])

  const handleTimerComplete = () => {
    if (isResting) {
      setIsResting(false)
      setIsRunning(false)
      playSound('work')
    } else {
      const newCompleted = { ...completed }
      if (!newCompleted[currentIdx]) newCompleted[currentIdx] = []
      newCompleted[currentIdx].push(currentSeries)
      setCompleted(newCompleted)

      if (currentSeries + 1 < totalSeries) {
        setCurrentSeries(s => s + 1)
        startRest()
      } else {
        setIsRunning(false)
        playSound('complete')
      }
    }
  }

  const startTimer = () => {
    if (!sessionStartTime) setSessionStartTime(Date.now())
    setTimeLeft(30)
    setIsRunning(true)
    setIsResting(false)
  }

  const startRest = () => {
    setTimeLeft(currentItem?.tiempoDescanso || 60)
    setIsRunning(true)
    setIsResting(true)
    playSound('rest')
  }

  const togglePause = () => setIsRunning(r => !r)

  const playSound = (type) => {
    if (!soundEnabled || !audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  const nextExercise = () => {
    if (currentIdx < items.length - 1) {
      setCurrentIdx(i => i + 1)
      setCurrentSeries(0)
      setIsRunning(false)
      setIsResting(false)
      setTimeLeft(0)
    }
  }

  const prevExercise = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1)
      setCurrentSeries(0)
      setIsRunning(false)
      setIsResting(false)
      setTimeLeft(0)
    }
  }

  const skipSeries = () => {
    if (currentSeries + 1 < totalSeries) {
      setCurrentSeries(s => s + 1)
    } else if (currentIdx < items.length - 1) {
      nextExercise()
    }
  }

  const finish = async () => {
    if (rutina) {
      const duration = Math.round((Date.now() - (sessionStartTime || Date.now())) / 60000)
      const completedCount = Object.values(completed).filter(arr => arr.length >= (items[Object.keys(completed).find(k => k == Object.keys(completed)[0])]?.series || 3)).length
      await addSesion({
        rutinaId: rutina.id,
        alumnoId: rutina.alumnoId,
        duracion: duration || 1,
        completado: completedCount === items.length,
        ejercicios: items.map(item => ({
          ejercicioId: item.ejercicioId,
          series: item.series,
          reps: item.reps,
          peso: item.peso,
          completadas: (completed[item.id] || []).length
        }))
      })
    }
    localStorage.removeItem(STORAGE_KEY + rutinaId)
    navigate(-1)
  }

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const getProgress = () => {
    let total = 0, done = 0
    items.forEach((item, i) => {
      total += item.series
      done += (completed[i] || []).length
    })
    return total > 0 ? (done / total) * 100 : 0
  }

  if (!currentItem) return <div className="flex items-center justify-center h-screen text-gray-400">Sin ejercicios</div>

  const progress = getProgress()

  return (
    <div className="fixed inset-0 bg-gym-dark z-50 flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-gym-dark-border bg-gym-dark/95 backdrop-blur">
        <button onClick={() => setShowExitConfirm(true)} className="p-2 rounded-xl bg-gym-dark-card">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gym-orange/10 flex items-center justify-center text-gym-orange font-bold text-sm">
            {currentIdx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate">{currentEjercicio?.nombre || 'Ejercicio'}</h2>
            <p className="text-xs text-gray-400">{currentEjercicio?.categoria}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{currentIdx + 1}/{items.length}</span>
            <div className="w-20 h-2 bg-gym-dark-card rounded-full overflow-hidden">
              <div className="h-full bg-gym-orange rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-xl bg-gym-dark-card">
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        <div className="w-16 h-16 rounded-2xl bg-gym-orange/10 flex items-center justify-center mb-4">
          <span className="text-gym-orange text-2xl font-bold">{currentIdx + 1}</span>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-2">{currentEjercicio?.nombre || 'Ejercicio'}</h2>
        <p className="text-gray-400 text-sm mb-6">{currentEjercicio?.categoria}</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
          <StatCard label="Serie" value={`${currentSeries + 1}/${totalSeries}`} color="gym-orange" />
          <StatCard label="Reps" value={currentItem.reps} color="blue" />
          <StatCard label="Peso" value={currentItem.peso ? `${currentItem.peso}kg` : '—'} color="green" />
        </div>

        {/* Timer */}
        {timeLeft > 0 && (
          <div className="mb-8 text-center">
            <p className="text-sm text-gray-400 mb-2">{isResting ? 'Descanso' : 'Trabajo'}</p>
            <p className={`text-6xl font-extrabold ${isResting ? 'text-yellow-400' : 'text-green-400'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={prevExercise} 
            disabled={currentIdx === 0}
            className="flex-1 p-4 rounded-2xl bg-gym-dark-card disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={24} />
            <span className="text-xs">Ant</span>
          </button>
          
          {!isRunning ? (
            <button onClick={startTimer} className="flex-1 p-6 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              <Play size={32} />
            </button>
          ) : (
            <button onClick={togglePause} className="flex-1 p-6 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2">
              <Pause size={32} />
            </button>
          )}
          
          <button 
            onClick={nextExercise} 
            disabled={currentIdx >= items.length - 1}
            className="flex-1 p-4 rounded-2xl bg-gym-dark-card disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <span className="text-xs">Sig</span>
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Exercise list with progress */}
        <div className="w-full max-w-md">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {items.map((item, idx) => {
              const ej = ejercicios.find(e => e.id === item.ejercicioId)
              const isDone = (completed[idx] || []).length >= (item.series || 3)
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentIdx(idx); setCurrentSeries(0); setIsRunning(false); setTimeLeft(0) }}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    idx === currentIdx ? 'bg-gym-orange text-white' :
                    isDone ? 'bg-green-500/20 text-green-400' :
                    'bg-gym-dark-card text-gray-400'
                  }`}
                >
                  {ej?.nombre?.substring(0, 15) || idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Series checklist */}
        <div className="w-full max-w-md mt-4">
          <p className="text-sm font-bold mb-2">Series</p>
          <div className="space-y-1.5">
            {Array.from({ length: totalSeries }, (_, s) => {
              const isCompleted = (completed[currentIdx] || []).includes(s)
              const isCurrent = s === currentSeries && !isCompleted
              return (
                <button
                  key={s}
                  onClick={() => setCurrentSeries(s)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isCompleted ? 'bg-green-500/20 text-green-400' :
                    isCurrent ? 'bg-gym-orange/20 text-gym-orange' :
                    'bg-gym-dark-card text-gray-400'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isCompleted ? 'border-green-500 bg-green-500' : isCurrent ? 'border-gym-orange' : 'border-gray-600'}`}>
                    {isCompleted && <Check size={12} className="text-white" />}
                  </div>
                  <span>Serie {s + 1}</span>
                  <span className="text-xs text-gray-500 ml-auto">{currentItem.reps} reps</span>
                  {currentItem.peso && <span className="text-xs text-gray-500">{currentItem.peso}kg</span>}
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* Exit Confirm */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gym-dark-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold mb-2">¿Salir del entrenamiento?</h3>
            <p className="text-gray-400 text-sm mb-4">El progreso se guardará automáticamente.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-2 rounded-xl bg-gym-dark border border-gym-dark-border">
                Continuar
              </button>
              <button onClick={finish} className="flex-1 py-2 rounded-xl bg-gym-orange text-white">
                Salir y guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    'gym-orange': 'bg-gym-orange/10 text-gym-orange',
    'blue': 'bg-blue-500/10 text-blue-400',
    'green': 'bg-green-500/10 text-green-400',
  }
  return (
    <div className={`rounded-xl p-3 text-center ${colors[color] || colors['gym-orange']}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}