import { useState } from 'react'
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { exportToCSV, exportToSingleCSV, syncToGoogleSheets } from '../lib/googleSheets'

export default function Exportar() {
  const navigate = useNavigate()
  const { alumnos, ejercicios, rutinas, sesiones } = useAppStore()
  const [tab, setTab] = useState('csv')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [accessToken, setAccessToken] = useState('')

  const handleExportCSV = async () => {
    await exportToCSV(alumnos, ejercicios, rutinas)
  }

  const handleExportSingle = async () => {
    await exportToSingleCSV(alumnos, ejercicios, rutinas)
  }

  const handleSync = async () => {
    if (!spreadsheetId.trim()) {
      alert('Ingresá el ID de la hoja de cálculo')
      return
    }
    setSyncing(true)
    setSyncResult(null)
    try {
      const rutinaEjercicios = (await import('../lib/db')).default.rutinaEjercicios.toArray()
      await syncToGoogleSheets(spreadsheetId, apiKey, accessToken, {
        alumnos,
        ejercicios,
        rutinas,
        rutinaEjercicios: await rutinaEjercicios,
        sesiones,
      })
      setSyncResult({ success: true, message: '¡Sincronización exitosa! Datos subidos a Google Sheets.' })
    } catch (e) {
      setSyncResult({ success: false, message: `Error: ${e.message}` })
    }
    setSyncing(false)
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gym-dark-card hover:bg-gym-dark-border">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold">Exportar Datos</h2>
      </div>

      <div className="flex gap-2 bg-gym-dark-card rounded-xl p-1">
        <button
          onClick={() => setTab('csv')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'csv' ? 'bg-gym-orange text-white' : 'text-gray-400'
          }`}
        >
          CSV / Excel
        </button>
        <button
          onClick={() => setTab('sheets')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'sheets' ? 'bg-gym-orange text-white' : 'text-gray-400'
          }`}
        >
          Google Sheets
        </button>
      </div>

      {tab === 'csv' && (
        <div className="space-y-4">
          <div className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <FileSpreadsheet size={22} className="text-green-400" />
              </div>
              <div>
                <p className="font-bold text-sm">Exportar Archivos Separados</p>
                <p className="text-xs text-gray-400">Un CSV por tabla: Alumnos, Ejercicios, Rutinas, etc.</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-gray-400 mb-4">
              <p>• Alumnos ({alumnos.length} registros)</p>
              <p>• Ejercicios ({ejercicios.length} registros)</p>
              <p>• Rutinas ({rutinas.length} registros)</p>
              <p>• Sesiones ({sesiones.length} registros)</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            >
              <Download size={16} /> Descargar Archivos CSV
            </button>
          </div>

          <div className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileSpreadsheet size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-sm">Exportar Todo Junto</p>
                <p className="text-xs text-gray-400">Un solo archivo con todas las secciones</p>
              </div>
            </div>
            <button
              onClick={handleExportSingle}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <Download size={16} /> Descargar CSV Completo
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Los archivos CSV se pueden abrir en Excel, Google Sheets, o cualquier hoja de cálculo.
          </p>
        </div>
      )}

      {tab === 'sheets' && (
        <div className="space-y-4">
          <div className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3">Sincronizar con Google Sheets</h3>
            <p className="text-xs text-gray-400 mb-4">
              Subí todos tus datos directamente a una hoja de cálculo de Google.
              Se crearán/actualizarán las pestañas: Alumnos, Ejercicios, Rutinas, etc.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Spreadsheet ID</label>
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={e => setSpreadsheetId(e.target.value)}
                  className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gym-orange"
                  placeholder="11jwrSlD10vt1DHSysu5..."
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  El ID está en la URL: docs.google.com/spreadsheets/d/<b>ESTE_ID</b>/edit
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">API Key (opcional para CSV)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gym-orange"
                  placeholder="AIza..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Access Token (para escritura)</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  className="w-full bg-gym-dark border border-gym-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gym-orange"
                  placeholder="ya29.a0..."
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Necesitás un token OAuth2 con permisos de Google Sheets API.
                </p>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing || !spreadsheetId.trim()}
              className="w-full bg-gym-orange text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gym-orange-dark transition-colors mt-4 disabled:opacity-50"
            >
              {syncing ? (
                <><Loader2 size={16} className="animate-spin" /> Sincronizando...</>
              ) : (
                <><Upload size={16} /> Sincronizar con Google Sheets</>
              )}
            </button>

            {syncResult && (
              <div className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
                syncResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {syncResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {syncResult.message}
              </div>
            )}
          </div>

          <div className="bg-gym-dark-card border border-gym-dark-border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-2">¿Cómo obtener las credenciales?</h3>
            <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
              <li>Andá a <a href="https://console.cloud.google.com" target="_blank" rel="noopener" className="text-gym-orange hover:underline">console.cloud.google.com</a></li>
              <li>Creá un proyecto (o usá uno existente)</li>
              <li>Habilitá la "Google Sheets API"</li>
              <li>Creá credenciales (API Key + OAuth 2.0)</li>
              <li>Compartí tu hoja con el email del servicio account</li>
              <li>Copiá el Spreadsheet ID de la URL de tu hoja</li>
            </ol>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Sin credenciales podés usar la exportación CSV y subirla manualmente a Google Sheets.
          </p>
        </div>
      )}
    </div>
  )
}
