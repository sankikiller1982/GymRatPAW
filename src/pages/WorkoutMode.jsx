import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Pause, SkipForward, SkipBack, CheckCircle, X, Timer } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import db from '../lib/db'

export default function WorkoutMode() {
  const { rutinaId } = useParams()
  const navigate = useNavigate()
  const { rutinas, ejercicios } = useAppStore()
  const [items, setItems] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [currentSeries, setCurrentSeries] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isResting, setIsResting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [completed, setCompleted] = useState([])
  const timerRef = useRef(null)

  const rutina = rutinas.find(r => r.id === Number(rutinaId))

  useEffect(() => {
    if (rutinaId) {
      db.rutinaEjercicios.where('rutinaId').equals(Number(rutinaId)).toArray().then(data => {
        setItems(data.sort((a, b) => a.orden - b.orden))
      })
    }
  }, [rutinaId])

  const currentItem = items[currentIdx]
  const currentEjercicio = ejercicios.find(e => e.id === currentItem?.ejercicioId)
  const totalSeries = currentItem?.series || 3

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && isRunning) {
      if (isResting) {
        setIsResting(false)
        setIsRunning(false)
      } else {
        const newCompleted = [...completed]
        if (!newCompleted[currentIdx]) newCompleted[currentIdx] = []
        newCompleted[currentIdx].push(currentSeries)
        setCompleted(newCompleted)

        if (currentSeries + 1 < totalSeries) {
          setCurrentSeries(s => s + 1)
          startRest()
        } else {
          setIsRunning(false)
        }
      }
    }
    return () => clearTimeout(timerRef.current)
  }, [timeLeft, isRunning])

  const startTimer = () => {
    setTimeLeft(30)
    setIsRunning(true)
    setIsResting(false)
  }

  const startRest = () => {
    setTimeLeft(currentItem?.tiempoDescanso || 60)
    setIsRunning(true)
    setIsResting(true)
  }

  const togglePause = () => setIsRunning(r => !r)

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

  const finish = async () => {
    if (rutina) {
      await useAppStore.getState().addSesion({
        rutinaId: rutina.id,
        alumnoId: rutina.alumnoId,
        duracion: 0,
        completado: completed.filter(Boolean).length === items.length,
      })
    }
    navigate(-1)
  }

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (!currentItem) return <p className="text-gray-400 text-center py-8">Sin ejercicios</p>

  return (
    <div className="fixed inset-0 bg-gym-dark z-50 flex flex-col safe-top safe-bottom">
      <div className="p-4 flex items-center justify-between">
        <button onClick={finish} className="p-2 rounded-xl bg-gym-dark-card">
          <X size={20} />
        </button>
        <p className="text-sm text-gray-400">
          {currentIdx + 1}/{items.length}
        </p>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-gym-orange/10 flex items-center justify-center mb-4">
          <span className="text-gym-orange text-2xl font-bold">{currentIdx + 1}</span>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-2">{currentEjercicio?.nombre || 'Ejercicio'}</h2>
        <p className="text-gray-400 text-sm mb-6">{currentEjercicio?.categoria}</p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
          <div className="bg-gym-dark-card rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Serie</p>
            <p className="text-2xl font-bold text-gym-orange">{currentSeries + 1}/{totalSeries}</p>
          </div>
          <div className="bg-gym-dark-card rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Reps</p>
            <p className="text-2xl font-bold">{currentItem.reps}</p>
          </div>
          <div className="bg-gym-dark-card rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Peso</p>
            <p className="text-2xl font-bold">{currentItem.peso || '-'}</p>
          </div>
        </div>

        {timeLeft > 0 && (
          <div className="mb-8 text-center">
            <p className="text-sm text-gray-400 mb-2">{isResting ? 'Descanso' : 'Trabajo'}</p>
            <p className={`text-6xl font-extrabold ${isResting ? 'text-yellow-400' : 'text-green-400'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={prevExercise} disabled={currentIdx === 0} className="p-4 rounded-2xl bg-gym-dark-card disabled:opacity-30">
            <SkipBack size={24} />
          </button>
          {!isRunning ? (
            <button onClick={startTimer} className="p-6 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
              <Play size={32} />
            </button>
          ) : (
            <button onClick={togglePause} className="p-6 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
              <Pause size={32} />
            </button>
          )}
          <button onClick={nextExercise} disabled={currentIdx >= items.length - 1} className="p-4 rounded-2xl bg-gym-dark-card disabled:opacity-30">
            <SkipForward size={24} />
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gym-dark-border">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {items.map((item, idx) => {
            const ej = ejercicios.find(e => e.id === item.ejercicioId)
            const isCompleted = completed[idx]?.length >= (item.series || 3)
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentIdx(idx); setCurrentSeries(0); setIsRunning(false); setTimeLeft(0) }}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  idx === currentIdx ? 'bg-gym-orange text-white' :
                  isCompleted ? 'bg-green-500/20 text-green-400' :
                  'bg-gym-dark-card text-gray-400'
                }`}
              >
                {ej?.nombre?.substring(0, 15) || idx + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
