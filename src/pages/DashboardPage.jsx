import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboard } from '../api/client'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  const sospechosos = data.por_clasificacion?.SOSPECHOSO || 0
  const confirmados = (data.por_clasificacion?.CONFIRMADO || 0) + (data.por_clasificacion?.['CONFIRMADO SARAMPION'] || 0) + (data.por_clasificacion?.['CONFIRMADO SARAMPIÓN'] || 0)
  const descartados = data.por_clasificacion?.DESCARTADO || 0

  // Ordenar semanas numéricamente (el backend ya debería enviarlas ordenadas,
  // pero nos aseguramos aquí también)
  const semanasOrdenadas = [...(data.por_semana || [])].sort((a, b) => {
    const sa = typeof a.semana === 'number' ? a.semana : parseInt(a.semana) || 0
    const sb = typeof b.semana === 'number' ? b.semana : parseInt(b.semana) || 0
    return sa - sb
  })

  const clasificaciones = Object.entries(data.por_clasificacion || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard label="Total Fichas" value={data.total_fichas} icon="clipboard" color="blue" />
        <KpiCard label="Sospechosos" value={sospechosos} icon="alert" color="amber" />
        <KpiCard label="Confirmados" value={confirmados} icon="check" color="red" />
        <KpiCard label="Pendientes Lab" value={data.pendientes_lab} icon="flask" color="purple" />
      </div>

      {/* Gráfica por semana */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Fichas por Semana Epidemiologica</h3>
        {semanasOrdenadas.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={semanasOrdenadas} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="semana"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(v) => [v, 'Fichas']}
                labelFormatter={(l) => `Semana ${l}`}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
              />
              <Bar dataKey="total" fill="#003876" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Sin datos por semana</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Clasificación breakdown */}
        {clasificaciones.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribucion por Clasificacion</h3>
            <div className="space-y-2.5">
              {clasificaciones.map(([name, count]) => {
                const pct = data.total_fichas > 0 ? (count / data.total_fichas * 100) : 0
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 truncate mr-2">{name}</span>
                      <span className="font-semibold text-gray-900 shrink-0">{count} <span className="text-xs text-gray-400 font-normal">({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: getClasifColor(name),
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Últimas fichas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Ultimas Fichas Registradas</h3>
            <button
              onClick={() => navigate('/fichas')}
              className="text-xs text-[#003876] hover:text-[#005baa] font-medium"
            >
              Ver todas &rarr;
            </button>
          </div>
          <div className="space-y-2">
            {(data.ultimas_fichas || []).map((f, i) => (
              <div
                key={f.registro_id || i}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                onClick={() => navigate(`/fichas/${f.registro_id}`)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{f.nombre_apellido || 'Sin nombre'}</p>
                  <p className="text-xs text-gray-400">{f.fecha_notificacion || ''}</p>
                </div>
                <ClasifBadge value={f.clasificacion_caso} />
              </div>
            ))}
            {(!data.ultimas_fichas || data.ultimas_fichas.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Sin fichas registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getClasifColor(name) {
  const n = (name || '').toUpperCase()
  if (n.includes('SOSPECHOSO')) return '#f59e0b'
  if (n.includes('CONFIRMADO')) return '#ef4444'
  if (n.includes('DESCARTADO')) return '#22c55e'
  if (n.includes('SUSPENDIDO')) return '#8b5cf6'
  return '#6b7280'
}

function KpiCard({ label, value, icon, color }) {
  const styles = {
    blue: { bg: 'bg-[#003876]/5', text: 'text-[#003876]', border: 'border-[#003876]/10', iconBg: 'bg-[#003876]/10' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', iconBg: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', iconBg: 'bg-purple-100' },
  }
  const s = styles[color]
  const icons = {
    clipboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    flask: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
  }
  return (
    <div className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`text-xs font-medium ${s.text} opacity-75`}>{label}</p>
        <div className={`w-7 h-7 rounded-lg ${s.iconBg} flex items-center justify-center`}>
          <svg className={`w-4 h-4 ${s.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icons[icon]}
          </svg>
        </div>
      </div>
      <p className={`text-2xl md:text-3xl font-bold ${s.text}`}>{value ?? '-'}</p>
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

function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-5 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 rounded-xl h-24" />)}
      </div>
      <div className="bg-gray-100 rounded-xl h-72" />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-100 rounded-xl h-48" />
        <div className="bg-gray-100 rounded-xl h-48" />
      </div>
    </div>
  )
}
