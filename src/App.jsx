import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Alumnos from './pages/Alumnos'
import AlumnoDetail from './pages/AlumnoDetail'
import Ejercicios from './pages/Ejercicios'
import Rutinas from './pages/Rutinas'
import RutinaCreate from './pages/RutinaCreate'
import RutinaDetail from './pages/RutinaDetail'
import WorkoutMode from './pages/WorkoutMode'
import Historial from './pages/Historial'
import Planificador from './pages/Planificador'
import Exportar from './pages/Exportar'
import { useAppStore } from './stores/useAppStore'
import { importExercisesFromDataset } from './lib/importDataset'

export default function App() {
  const initialize = useAppStore(s => s.initialize)
  const loadEj = useAppStore(s => s.loadEjercicios)

  useEffect(() => {
    const init = async () => {
      await importExercisesFromDataset()
      await initialize()
      await loadEj() // reload exercises after import
    }
    init()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/alumnos/:id" element={<AlumnoDetail />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/rutinas/nueva" element={<RutinaCreate />} />
          <Route path="/rutinas/nueva/:alumnoId" element={<RutinaCreate />} />
          <Route path="/rutinas/:id" element={<RutinaDetail />} />
          <Route path="/workout/:rutinaId" element={<WorkoutMode />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/planificador" element={<Planificador />} />
          <Route path="/exportar" element={<Exportar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}