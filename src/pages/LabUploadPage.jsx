import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  uploadLabsExcel, getLabsPreview, applyLabsBatch, cancelLabsBatch, getLabsBatches,
} from '../api/client'

const PCR_TIPOS = [
  { value: 'hisopado', label: 'Hisopado nasofaríngeo' },
  { value: 'orina', label: 'Orina' },
  { value: 'mixto', label: 'Mixto (asume hisopado por defecto)' },
]

const NIVEL_LABEL = {
  L1: { label: 'Afiliación exacta', color: 'bg-green-100 text-green-800' },
  L2: { label: 'Afil. + nombre', color: 'bg-green-100 text-green-800' },
  L3: { label: 'Nombre exacto + sexo', color: 'bg-emerald-100 text-emerald-800' },
  L4: { label: 'Nombre similar (alto)', color: 'bg-blue-100 text-blue-800' },
  L5: { label: 'Nombre similar (revisar)', color: 'bg-yellow-100 text-yellow-800' },
  L6: { label: 'Sin ficha', color: 'bg-red-100 text-red-800' },
  AMBIGUO: { label: 'Ambiguo', color: 'bg-orange-100 text-orange-800' },
  IDEMPOTENTE: { label: 'Ya cargado', color: 'bg-gray-100 text-gray-700' },
}

const ACCION_LABEL = {
  apply: { label: 'Se aplicará', color: 'text-green-700' },
  queue_review: { label: 'Cola revisión', color: 'text-yellow-700' },
  queue_no_match: { label: 'Sin ficha → cola', color: 'text-red-700' },
  idempotent: { label: 'Ya cargado', color: 'text-gray-500' },
  skip: { label: 'Sin cambios', color: 'text-gray-500' },
}

function StatPill({ label, value, color = 'bg-[#E8F5E9] text-[#1B5E20]' }) {
  if (!value && value !== 0) return null
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      <span>{label}:</span>
      <span className="font-bold">{value}</span>
    </span>
  )
}

export default function LabUploadPage() {
  const { user } = useAuth()
  const [stage, setStage] = useState('idle') // idle / uploading / preview / applying / done / error
  const [file, setFile] = useState(null)
  const [pcrTipo, setPcrTipo] = useState('hisopado')
  const [uploadResult, setUploadResult] = useState(null)
  const [preview, setPreview] = useState(null)
  const [applyResult, setApplyResult] = useState(null)
  const [error, setError] = useState(null)
  const [skipFilas, setSkipFilas] = useState(new Set())
  const [batches, setBatches] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => { loadBatches() }, [])

  async function loadBatches() {
    try {
      const data = await getLabsBatches(10)
      setBatches(data.data || [])
    } catch (e) {
      // silencioso — historial es opcional
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) setFile(f)
  }

  function handleFileSelect(e) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setStage('uploading')
    setError(null)
    try {
      const res = await uploadLabsExcel(file, pcrTipo)
      setUploadResult(res)
      const prev = await getLabsPreview(res.batch_id)
      setPreview(prev)
      setStage('preview')
    } catch (e) {
      setError(e.message)
      setStage('error')
    }
  }

  function toggleSkip(filaId) {
    setSkipFilas(prev => {
      const n = new Set(prev)
      if (n.has(filaId)) n.delete(filaId)
      else n.add(filaId)
      return n
    })
  }

  async function handleApply() {
    if (!preview) return
    setStage('applying')
    setError(null)
    try {
      // filas a aplicar = todas con accion='apply' que NO estén en skipFilas
      const filaIds = preview.filas
        .filter(f => f.accion === 'apply' && !skipFilas.has(f.id))
        .map(f => f.id)
      // Pero el endpoint apply opera sobre TODAS las filas de batch, no solo apply.
      // Si pasamos lista, solo se procesan ESAS. Si no pasamos, se procesan todas.
      // Para mantener no_match/discrepancias persistidas, mejor pasar TODAS las filas
      // del batch SIN las que el usuario marcó skip.
      const allIds = preview.filas
        .filter(f => !skipFilas.has(f.id))
        .map(f => f.id)
      const res = await applyLabsBatch(uploadResult.batch_id, allIds)
      setApplyResult(res)
      setStage('done')
      loadBatches()
    } catch (e) {
      setError(e.message)
      setStage('error')
    }
  }

  async function handleCancel() {
    if (!uploadResult) {
      reset()
      return
    }
    try {
      await cancelLabsBatch(uploadResult.batch_id)
    } catch (e) {
      // ignorar
    }
    reset()
  }

  function reset() {
    setStage('idle')
    setFile(null)
    setUploadResult(null)
    setPreview(null)
    setApplyResult(null)
    setError(null)
    setSkipFilas(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Render ──────────────────────────────────────────

  if (!user?.unidad?.puede_cargar_labs) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-bold text-red-800">Sin permisos</h2>
        <p className="text-sm text-red-700 mt-1">
          Su unidad no tiene habilitada la carga de laboratorios. Contacte al administrador del portal.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A3D0C] via-[#1B5E20] to-[#2E7D32] text-white rounded-xl p-5 shadow">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span>🧪</span>
          <span>Carga de resultados de laboratorio</span>
        </h2>
        <p className="text-sm text-[#C8E6C9] mt-1">
          Sube el Excel con resultados de PCR e IgM de sarampión. El sistema cruzará automáticamente
          con las fichas existentes y notificará los pacientes que no fueron encontrados.
        </p>
      </div>

      {/* IDLE */}
      {stage === 'idle' && (
        <div className="bg-white rounded-xl border border-[#E8F5E9] p-5 shadow-sm">
          <h3 className="font-bold text-[#1B5E20] mb-3">1. Selecciona el archivo Excel</h3>

          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#A5D6A7] rounded-lg p-8 text-center cursor-pointer hover:bg-[#F1F8E9] transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div>
                <p className="text-sm font-semibold text-[#1B5E20]">📄 {file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-[#1B5E20]">
                  Arrastra el Excel aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formato esperado: 7 columnas (Numero de Orden, Nombre, Afiliacion, Sexo, Servicio, PCR, IgM)
                </p>
              </div>
            )}
          </div>

          {file && (
            <>
              <h3 className="font-bold text-[#1B5E20] mt-5 mb-2">2. Tipo de muestra para PCR</h3>
              <p className="text-xs text-gray-600 mb-2">
                El Excel del HGE no distingue entre hisopado y orina. Indica el tipo del lote.
              </p>
              <div className="space-y-2">
                {PCR_TIPOS.map(t => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pcr_tipo"
                      value={t.value}
                      checked={pcrTipo === t.value}
                      onChange={e => setPcrTipo(e.target.value)}
                      className="accent-[#2E7D32]"
                    />
                    <span className="text-sm">{t.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleUpload}
                className="mt-5 w-full sm:w-auto px-5 py-2 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white text-sm font-semibold rounded-lg shadow hover:shadow-md transition"
              >
                Procesar archivo →
              </button>
            </>
          )}
        </div>
      )}

      {/* UPLOADING */}
      {stage === 'uploading' && (
        <div className="bg-white rounded-xl border border-[#E8F5E9] p-8 text-center shadow-sm">
          <div className="inline-block w-8 h-8 border-4 border-[#A5D6A7] border-t-[#1B5E20] rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-[#1B5E20] font-semibold">Procesando Excel y cruzando con la base de datos…</p>
        </div>
      )}

      {/* PREVIEW */}
      {stage === 'preview' && preview && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8F5E9] p-5 shadow-sm">
            <h3 className="font-bold text-[#1B5E20] mb-3">Resumen de cruce</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              <StatPill label="Filas en Excel" value={uploadResult?.total_filas} />
              <StatPill label="Pacientes únicos" value={uploadResult?.pacientes_consolidados} />
              <StatPill label="Match exacto"
                value={(preview.batch.filas_match_l1 || 0) + (preview.batch.filas_match_l3 || 0)} />
              <StatPill label="Match aproximado" value={preview.batch.filas_match_l4 || 0}
                color="bg-blue-100 text-blue-800" />
              <StatPill label="Requieren revisión"
                value={(preview.batch.filas_match_l5 || 0) + (preview.batch.filas_ambiguas || 0)}
                color="bg-yellow-100 text-yellow-800" />
              <StatPill label="Sin ficha encontrada" value={preview.batch.filas_no_match || 0}
                color="bg-red-100 text-red-800" />
              <StatPill label="Ya cargados" value={preview.batch.filas_idempotentes || 0}
                color="bg-gray-100 text-gray-700" />
            </div>

            {uploadResult?.warning && (
              <div className="bg-yellow-50 border border-yellow-300 rounded p-2 text-xs text-yellow-900 mb-3">
                ⚠️ {uploadResult.warning}
              </div>
            )}

            <p className="text-xs text-gray-600 mb-3">
              Marca las casillas para EXCLUIR filas específicas (por defecto se incluyen todas).
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-200">
                <thead className="bg-[#E8F5E9] text-[#1B5E20]">
                  <tr>
                    <th className="px-2 py-2 text-left">Excluir</th>
                    <th className="px-2 py-2 text-left">Fila</th>
                    <th className="px-2 py-2 text-left">Orden HGE</th>
                    <th className="px-2 py-2 text-left">Paciente Excel</th>
                    <th className="px-2 py-2 text-left">Afiliación</th>
                    <th className="px-2 py-2 text-left">PCR</th>
                    <th className="px-2 py-2 text-left">IgM</th>
                    <th className="px-2 py-2 text-left">Match</th>
                    <th className="px-2 py-2 text-left">Acción</th>
                    <th className="px-2 py-2 text-left">Reclasif.</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.filas.map((f) => {
                    const nl = NIVEL_LABEL[f.match_nivel] || { label: f.match_nivel, color: 'bg-gray-100' }
                    const al = ACCION_LABEL[f.accion] || { label: f.accion, color: 'text-gray-500' }
                    return (
                      <tr key={f.id} className={`border-b border-gray-100 ${skipFilas.has(f.id) ? 'opacity-40' : ''}`}>
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={skipFilas.has(f.id)}
                            onChange={() => toggleSkip(f.id)}
                            className="accent-red-500"
                          />
                        </td>
                        <td className="px-2 py-2 text-gray-500">{f.excel_row_num}</td>
                        <td className="px-2 py-2 font-mono">{f.numero_orden_hge}</td>
                        <td className="px-2 py-2">{f.nombre_excel}</td>
                        <td className="px-2 py-2 font-mono">{f.afiliacion_excel}</td>
                        <td className="px-2 py-2">{f.pcr_resultado_excel || '—'}</td>
                        <td className="px-2 py-2">
                          {f.igm_titulacion_numerica ?? '—'}
                          {f.igm_cualitativo_calculado && (
                            <span className="ml-1 text-[10px] text-gray-500">({f.igm_cualitativo_calculado})</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${nl.color}`}>
                            {nl.label}
                          </span>
                          {f.match_score > 0 && (
                            <span className="ml-1 text-[10px] text-gray-500">{f.match_score.toFixed(2)}</span>
                          )}
                        </td>
                        <td className={`px-2 py-2 font-semibold ${al.color}`}>{al.label}</td>
                        <td className="px-2 py-2 text-[10px]">
                          {f.reclasificacion_planeada || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white text-sm font-semibold rounded-lg shadow hover:shadow-md"
            >
              Aplicar carga
            </button>
          </div>
        </div>
      )}

      {/* APPLYING */}
      {stage === 'applying' && (
        <div className="bg-white rounded-xl border border-[#E8F5E9] p-8 text-center shadow-sm">
          <div className="inline-block w-8 h-8 border-4 border-[#A5D6A7] border-t-[#1B5E20] rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-[#1B5E20] font-semibold">Aplicando cambios a las fichas…</p>
        </div>
      )}

      {/* DONE */}
      {stage === 'done' && applyResult && (
        <div className="bg-white rounded-xl border border-green-300 p-5 shadow-sm">
          <h3 className="font-bold text-green-800 text-lg flex items-center gap-2">
            <span>✅</span>
            <span>Carga completada</span>
          </h3>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-green-50 rounded p-3">
              <div className="text-2xl font-bold text-green-800">{applyResult.fichas_enriquecidas}</div>
              <div className="text-xs text-green-700">Fichas enriquecidas</div>
            </div>
            <div className="bg-emerald-50 rounded p-3">
              <div className="text-2xl font-bold text-emerald-800">{applyResult.fichas_reclasificadas}</div>
              <div className="text-xs text-emerald-700">Reclasificadas</div>
            </div>
            <div className="bg-yellow-50 rounded p-3">
              <div className="text-2xl font-bold text-yellow-800">{applyResult.review_persistidos}</div>
              <div className="text-xs text-yellow-700">En cola revisión</div>
            </div>
            <div className="bg-red-50 rounded p-3">
              <div className="text-2xl font-bold text-red-800">{applyResult.no_match_persistidos}</div>
              <div className="text-xs text-red-700">Sin ficha encontrada</div>
            </div>
            {applyResult.discrepancias_persistidas > 0 && (
              <div className="bg-orange-50 rounded p-3">
                <div className="text-2xl font-bold text-orange-800">{applyResult.discrepancias_persistidas}</div>
                <div className="text-xs text-orange-700">Discrepancias</div>
              </div>
            )}
            {applyResult.errores > 0 && (
              <div className="bg-red-50 rounded p-3">
                <div className="text-2xl font-bold text-red-800">{applyResult.errores}</div>
                <div className="text-xs text-red-700">Errores</div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Los administradores fueron notificados por Telegram. Los pacientes sin ficha y los
            que requieren revisión quedaron en cola para que el equipo de epidemiología los procese.
          </p>
          <button
            onClick={reset}
            className="mt-4 px-5 py-2 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white text-sm font-semibold rounded-lg"
          >
            Cargar otro archivo
          </button>
        </div>
      )}

      {/* ERROR */}
      {stage === 'error' && error && (
        <div className="bg-red-50 rounded-xl border border-red-300 p-5">
          <h3 className="font-bold text-red-800">No se pudo procesar</h3>
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <button
            onClick={reset}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* HISTORIAL */}
      {batches.length > 0 && stage === 'idle' && (
        <div className="bg-white rounded-xl border border-[#E8F5E9] p-5 shadow-sm">
          <h3 className="font-bold text-[#1B5E20] mb-3">Cargas recientes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-[#E8F5E9] text-[#1B5E20]">
                <tr>
                  <th className="px-2 py-2 text-left">Fecha</th>
                  <th className="px-2 py-2 text-left">Archivo</th>
                  <th className="px-2 py-2 text-left">Filas</th>
                  <th className="px-2 py-2 text-left">Enriquecidas</th>
                  <th className="px-2 py-2 text-left">Reclasif.</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="px-2 py-2">{new Date(b.created_at).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-2 py-2">{b.archivo_nombre}</td>
                    <td className="px-2 py-2">{b.total_filas}</td>
                    <td className="px-2 py-2">{b.fichas_enriquecidas ?? '—'}</td>
                    <td className="px-2 py-2">{b.fichas_reclasificadas ?? '—'}</td>
                    <td className="px-2 py-2">
                      <span className={
                        b.status === 'applied' ? 'text-green-700 font-semibold' :
                        b.status === 'preview' ? 'text-yellow-700' :
                        'text-gray-500'
                      }>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
