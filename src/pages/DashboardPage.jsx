import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDashboard } from '../api/client'
import { useAuth } from '../context/AuthContext'

const CLASIF_COLORS = {
  SOSPECHOSO: '#f59e0b',
  CONFIRMADO: '#ef4444',
  DESCARTADO: '#22c55e',
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return null

  const clasificaciones = Object.entries(data.por_clasificacion || {})
  const sospechosos = data.por_clasificacion?.SOSPECHOSO || 0
  const confirmados = data.por_clasificacion?.CONFIRMADO || data.por_clasificacion?.['CONFIRMADO SARAMPION'] || 0
  const descartados = data.por_clasificacion?.DESCARTADO || 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard label="Total Fichas" value={data.total_fichas} color="blue" />
        <KpiCard label="Sospechosos" value={sospechosos} color="amber" />
        <KpiCard label="Confirmados" value={confirmados} color="red" />
        <KpiCard label="Pendientes Lab" value={data.pendientes_lab} color="purple" />
      </div>

      {/* Gráfica por semana */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Fichas por Semana Epidemiologica</h3>
        {data.por_semana?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.por_semana}>
              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Fichas']} labelFormatter={(l) => `Semana ${l}`} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Sin datos por semana</p>
        )}
      </div>

      {/* Clasificación breakdown */}
      {clasificaciones.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Por Clasificacion</h3>
          <div className="space-y-2">
            {clasificaciones.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">{name}</span>
                <span className="font-semibold text-gray-900 shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimas fichas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Ultimas Fichas</h3>
          <button
            onClick={() => navigate('/fichas')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todas
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs border-b">
                <th className="pb-2 pl-4 md:pl-0 font-medium">Paciente</th>
                <th className="pb-2 font-medium hidden md:table-cell">Fecha</th>
                <th className="pb-2 pr-4 md:pr-0 font-medium">Clasificacion</th>
              </tr>
            </thead>
            <tbody>
              {(data.ultimas_fichas || []).map((f, i) => (
                <tr
                  key={f.registro_id || i}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/fichas/${f.registro_id}`)}
                >
                  <td className="py-2.5 pl-4 md:pl-0 text-gray-900 font-medium truncate max-w-[180px]">
                    {f.nombre_apellido || 'Sin nombre'}
                  </td>
                  <td className="py-2.5 text-gray-500 hidden md:table-cell">{f.fecha_notificacion || '-'}</td>
                  <td className="py-2.5 pr-4 md:pr-0">
                    <ClasifBadge value={f.clasificacion_caso} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-75 mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold">{value ?? '-'}</p>
    </div>
  )
}

function ClasifBadge({ value }) {
  const v = (value || '').toUpperCase()
  let cls = 'bg-gray-100 text-gray-600'
  if (v.includes('SOSPECHOSO')) cls = 'bg-amber-100 text-amber-700'
  else if (v.includes('CONFIRMADO')) cls = 'bg-red-100 text-red-700'
  else if (v.includes('DESCARTADO')) cls = 'bg-green-100 text-green-700'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{value || '-'}</span>
}

function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24" />
        ))}
      </div>
      <div className="bg-gray-100 rounded-xl h-64" />
      <div className="bg-gray-100 rounded-xl h-48" />
    </div>
  )
}
