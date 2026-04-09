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
  if (error) return (
    <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 text-sm text-red-800 shadow-sm">
      {error}
    </div>
  )
  if (!data) return null

  const sospechosos = data.por_clasificacion?.SOSPECHOSO || 0
  const confirmados = (data.por_clasificacion?.CONFIRMADO || 0) + (data.por_clasificacion?.['CONFIRMADO SARAMPION'] || 0) + (data.por_clasificacion?.['CONFIRMADO SARAMPIÓN'] || 0)
  const descartados = data.por_clasificacion?.DESCARTADO || 0

  const semanasOrdenadas = [...(data.por_semana || [])].sort((a, b) => {
    const sa = typeof a.semana === 'number' ? a.semana : parseInt(a.semana) || 0
    const sb = typeof b.semana === 'number' ? b.semana : parseInt(b.semana) || 0
    return sa - sb
  })

  const clasificaciones = Object.entries(data.por_clasificacion || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-5">
      {/* Page title — estilo sarampión */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-igss-700 to-igss-500" />
        <h2 className="text-lg font-extrabold text-igss-900 tracking-tight">Dashboard</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Fichas" value={data.total_fichas} color="green" />
        <KpiCard label="Sospechosos" value={sospechosos} color="amber" />
        <KpiCard label="Confirmados" value={confirmados} color="red" />
        <KpiCard label="Pendientes Lab" value={data.pendientes_lab} color="gold" />
      </div>

      {/* Gráfica por semana */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-5 sm:p-6">
        <SectionHeader title="Fichas por Semana Epidemiologica" />
        {semanasOrdenadas.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={semanasOrdenadas} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="semana"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E8F5E9' }}
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
                contentStyle={{ borderRadius: 12, border: '1px solid #C8E6C9', fontSize: 13, boxShadow: '0 4px 20px rgba(27, 94, 32, 0.1)' }}
              />
              <Bar dataKey="total" fill="#2E7D32" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Sin datos por semana</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Clasificación */}
        {clasificaciones.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-5 sm:p-6">
            <SectionHeader title="Distribucion por Clasificacion" />
            <div className="space-y-3 mt-4">
              {clasificaciones.map(([name, count]) => {
                const pct = data.total_fichas > 0 ? (count / data.total_fichas * 100) : 0
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-700 font-medium truncate mr-2">{name}</span>
                      <span className="font-bold text-igss-900 shrink-0">
                        {count} <span className="text-xs text-gray-400 font-normal">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-igss-50 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: getClasifColor(name) }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Últimas fichas */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Ultimas Fichas" />
            <button
              onClick={() => navigate('/fichas')}
              className="text-xs text-igss-700 hover:text-igss-900 font-bold hover:bg-igss-50 px-2 py-1 rounded-lg transition-all"
            >
              Ver todas &rarr;
            </button>
          </div>
          <div className="space-y-1.5">
            {(data.ultimas_fichas || []).map((f, i) => (
              <div
                key={f.registro_id || i}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-igss-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-igss-100"
                onClick={() => navigate(`/fichas/${f.registro_id}`)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-igss-900 truncate">{f.nombre_apellido || 'Sin nombre'}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">SE {f.semana_epidemiologica || '?'} &middot; {f.fecha_notificacion || ''}</p>
                </div>
                <ClasifBadge value={f.clasificacion_caso} />
              </div>
            ))}
            {(!data.ultimas_fichas || data.ultimas_fichas.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">Sin fichas registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-[2px] bg-igss-gold rounded-full" />
      <span className="text-xs font-bold text-igss-brown uppercase tracking-[0.1em]">{title}</span>
      <div className="flex-1 h-[1px] bg-gray-200" />
    </div>
  )
}

function getClasifColor(name) {
  const n = (name || '').toUpperCase()
  if (n.includes('SOSPECHOSO')) return '#f59e0b'
  if (n.includes('CONFIRMADO')) return '#C41E24'
  if (n.includes('DESCARTADO')) return '#2E7D32'
  if (n.includes('SUSPENDIDO')) return '#8b5cf6'
  return '#6b7280'
}

function KpiCard({ label, value, color }) {
  const styles = {
    green: { bg: 'bg-gradient-to-br from-igss-50 to-igss-100', text: 'text-igss-800', border: 'border-igss-200', accent: 'bg-igss-700' },
    amber: { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', text: 'text-amber-800', border: 'border-amber-200', accent: 'bg-amber-500' },
    red: { bg: 'bg-gradient-to-br from-red-50 to-red-100', text: 'text-red-800', border: 'border-red-200', accent: 'bg-red-600' },
    gold: { bg: 'bg-gradient-to-br from-igss-gold-50 to-amber-50', text: 'text-igss-brown', border: 'border-igss-gold/30', accent: 'bg-igss-gold' },
  }
  const s = styles[color]
  return (
    <div className={`rounded-2xl border p-4 ${s.bg} ${s.border} shadow-sm relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${s.accent}`} />
      <p className={`text-[10px] font-bold uppercase tracking-wider ${s.text} opacity-70 mt-1`}>{label}</p>
      <p className={`text-2xl sm:text-3xl font-extrabold ${s.text} mt-1`}>{value ?? '-'}</p>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-igss-100 rounded-xl w-40" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="bg-igss-50 rounded-2xl h-24 border border-igss-100" />)}
      </div>
      <div className="bg-white/90 rounded-2xl h-72 border border-white/60" />
    </div>
  )
}
