import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFichas, downloadExcel } from '../api/client'

export default function FichasPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ clasificacion: '', semana: '', q: '' })
  const [searchInput, setSearchInput] = useState('')
  const [exporting, setExporting] = useState(false)
  const navigate = useNavigate()
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getFichas(page, limit, filters)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setFilters((f) => ({ ...f, q: searchInput }))
  }

  const handleFilterChange = (key, value) => {
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const blob = await downloadExcel()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fichas_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error al exportar: ' + e.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-igss-700 to-igss-500" />
        <h2 className="text-lg font-extrabold text-igss-900 tracking-tight">Fichas Epidemiologicas</h2>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o afiliacion..."
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-igss-600/20 focus:border-igss-600 outline-none bg-white transition-all duration-200 placeholder:text-gray-400"
            />
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-igss-800 to-igss-700 text-white rounded-xl text-sm font-bold hover:from-igss-900 hover:to-igss-800 transition-all duration-200 shadow-sm active:scale-[0.97]">
              Buscar
            </button>
          </form>
          <select
            value={filters.clasificacion}
            onChange={(e) => handleFilterChange('clasificacion', e.target.value)}
            className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white appearance-none focus:border-igss-600 focus:ring-2 focus:ring-igss-600/20 outline-none transition-all"
          >
            <option value="">Todas</option>
            <option value="SOSPECHOSO">Sospechoso</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="DESCARTADO">Descartado</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
          <input
            type="number"
            value={filters.semana}
            onChange={(e) => handleFilterChange('semana', e.target.value)}
            placeholder="SE"
            min="1"
            max="53"
            className="w-20 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white focus:border-igss-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* Export + count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 font-medium">
          {data ? <><span className="text-igss-800 font-bold">{data.total}</span> fichas encontradas</> : ''}
        </p>
        <button
          onClick={handleExportExcel}
          disabled={exporting || !data?.total}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-igss-700 text-igss-700 rounded-xl text-sm font-bold hover:bg-igss-50 disabled:opacity-40 transition-all duration-200 active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Exportando...' : 'Descargar Excel'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 overflow-hidden">
        {error && (
          <div className="m-4 bg-red-50 border border-red-200/60 rounded-xl p-3 text-sm text-red-800">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-igss-50/50 border-b border-igss-100">
                <th className="px-4 py-3 text-left text-[11px] font-bold text-igss-brown uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-igss-brown uppercase tracking-wider hidden md:table-cell">Afiliacion</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-igss-brown uppercase tracking-wider hidden lg:table-cell">Edad</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-igss-brown uppercase tracking-wider">Clasificacion</th>
                <th className="px-4 py-3 text-center text-[11px] font-bold text-igss-brown uppercase tracking-wider hidden md:table-cell">SE</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-igss-brown uppercase tracking-wider hidden lg:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-igss-50 animate-pulse">
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} className={`px-4 py-3.5 ${j > 2 && j < 6 ? 'hidden md:table-cell' : ''} ${j === 3 || j === 6 ? 'hidden lg:table-cell' : ''}`}>
                        <div className="h-4 bg-igss-50 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (data?.data || []).map((f) => (
                <tr
                  key={f.registro_id}
                  className="border-b border-igss-50 hover:bg-igss-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => navigate(`/fichas/${f.registro_id}`)}
                >
                  <td className="px-4 py-3.5 text-igss-900 font-semibold truncate max-w-[200px]">
                    {f.nombre_apellido || 'Sin nombre'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell font-mono text-xs">
                    {f.afiliacion || '-'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell">
                    {f.edad_anios ? `${f.edad_anios}a` : '-'} {f.sexo || ''}
                  </td>
                  <td className="px-4 py-3.5">
                    <ClasifBadge value={f.clasificacion_caso} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell text-center font-bold">
                    {f.semana_epidemiologica || '-'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell">
                    {f.fecha_notificacion || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-igss-100 bg-igss-50/30">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-igss-700 hover:bg-igss-100 active:scale-95'
              }`}
            >
              &larr; Anterior
            </button>
            <span className="text-sm text-igss-brown font-bold">
              {page} / {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page >= data.pages}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                page >= data.pages ? 'text-gray-300 cursor-not-allowed' : 'text-igss-700 hover:bg-igss-100 active:scale-95'
              }`}
            >
              Siguiente &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ClasifBadge({ value }) {
  const v = (value || '').toUpperCase()
  let cls = 'bg-gray-100 text-gray-600 border-gray-200'
  if (v.includes('SOSPECHOSO')) cls = 'bg-amber-50 text-amber-700 border-amber-200'
  else if (v.includes('CONFIRMADO')) cls = 'bg-red-50 text-red-700 border-red-200'
  else if (v.includes('DESCARTADO')) cls = 'bg-igss-50 text-igss-700 border-igss-200'
  return <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border whitespace-nowrap ${cls}`}>{value || '-'}</span>
}
