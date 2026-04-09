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
    <div className="p-4 md:p-6 space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o afiliacion..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shrink-0">
              Buscar
            </button>
          </form>
          <select
            value={filters.clasificacion}
            onChange={(e) => handleFilterChange('clasificacion', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">Todas las clasificaciones</option>
            <option value="SOSPECHOSO">Sospechoso</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="DESCARTADO">Descartado</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
          <input
            type="number"
            value={filters.semana}
            onChange={(e) => handleFilterChange('semana', e.target.value)}
            placeholder="Semana"
            min="1"
            max="53"
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Export button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {data ? `${data.total} fichas encontradas` : ''}
        </p>
        <button
          onClick={handleExportExcel}
          disabled={exporting || !data?.total}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Exportando...' : 'Descargar Excel'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {error && <div className="p-4 text-red-600 text-sm">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Afiliacion</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Edad/Sexo</th>
                <th className="px-4 py-3 font-medium">Clasificacion</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Semana</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                  </tr>
                ))
              ) : (data?.data || []).map((f) => (
                <tr
                  key={f.registro_id}
                  className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/fichas/${f.registro_id}`)}
                >
                  <td className="px-4 py-3 text-gray-900 font-medium truncate max-w-[200px]">
                    {f.nombre_apellido || 'Sin nombre'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell font-mono text-xs">
                    {f.afiliacion || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {f.edad_anios ? `${f.edad_anios}a` : '-'} {f.sexo || ''}
                  </td>
                  <td className="px-4 py-3">
                    <ClasifBadge value={f.clasificacion_caso} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-center">
                    {f.semana_epidemiologica || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {f.fecha_notificacion || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">
              Pagina {page} de {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page >= data.pages}
              className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ClasifBadge({ value }) {
  const v = (value || '').toUpperCase()
  let cls = 'bg-gray-100 text-gray-600'
  if (v.includes('SOSPECHOSO')) cls = 'bg-amber-100 text-amber-700'
  else if (v.includes('CONFIRMADO')) cls = 'bg-red-100 text-red-700'
  else if (v.includes('DESCARTADO')) cls = 'bg-green-100 text-green-700'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cls}`}>{value || '-'}</span>
}
