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
    getDashboard().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-[#E8F5E9] rounded-xl w-40" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="bg-[#F1F8F1] rounded-2xl h-28 border border-[#E8F5E9]" />)}
      </div>
      <div className="bg-white rounded-2xl h-72 border border-[#E8F5E9]" />
    </div>
  )
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">{error}</div>
  if (!data) return null

  const sospechosos = data.por_clasificacion?.SOSPECHOSO || 0
  const confirmados = (data.por_clasificacion?.CONFIRMADO || 0) + (data.por_clasificacion?.['CONFIRMADO SARAMPION'] || 0) + (data.por_clasificacion?.['CONFIRMADO SARAMPIÓN'] || 0)

  const semanasOrdenadas = [...(data.por_semana || [])].sort((a, b) => {
    return (typeof a.semana === 'number' ? a.semana : parseInt(a.semana) || 0) - (typeof b.semana === 'number' ? b.semana : parseInt(b.semana) || 0)
  })

  const clasificaciones = Object.entries(data.por_clasificacion || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#2E7D32] to-[#43A047]" />
        <h2 className="text-lg font-extrabold text-[#0A3D0C] tracking-tight">Dashboard</h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Fichas" value={data.total_fichas} barColor="#1B5E20" bgFrom="#E8F5E9" bgTo="#F1F8F1" textColor="#0A3D0C" />
        <KpiCard label="Sospechosos" value={sospechosos} barColor="#f59e0b" bgFrom="#FEF3C7" bgTo="#FFFBEB" textColor="#92400E" />
        <KpiCard label="Confirmados" value={confirmados} barColor="#C41E24" bgFrom="#FEE2E2" bgTo="#FEF2F2" textColor="#991B1B" />
        <KpiCard label="Pendientes Lab" value={data.pendientes_lab} barColor="#BFA033" bgFrom="#FDF8E8" bgTo="#FFFDF5" textColor="#5D4037" />
      </div>

      {/* Chart */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E8F5E9] p-5 sm:p-6">
        <SectionHeader title="Fichas por Semana Epidemiologica" />
        {semanasOrdenadas.length > 0 ? (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={semanasOrdenadas} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="semana" tick={{ fontSize: 12, fill: '#5D4037' }} tickLine={false} axisLine={{ stroke: '#E8F5E9' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Fichas']} labelFormatter={(l) => `Semana ${l}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #C8E6C9', fontSize: 13, boxShadow: '0 4px 20px rgba(27, 94, 32, 0.1)' }} />
                <Bar dataKey="total" fill="url(#greenGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E7D32" />
                    <stop offset="100%" stopColor="#43A047" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Clasificación */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E8F5E9] p-5 sm:p-6">
          <SectionHeader title="Distribucion por Clasificacion" />
          <div className="space-y-3 mt-4">
            {clasificaciones.map(([name, count]) => {
              const pct = data.total_fichas > 0 ? (count / data.total_fichas * 100) : 0
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium truncate mr-2">{name}</span>
                    <span className="font-bold text-[#0A3D0C] shrink-0">{count} <span className="text-xs text-gray-400 font-normal">({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div className="w-full bg-[#F1F8F1] rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: getClasifColor(name) }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Últimas fichas */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-[#E8F5E9] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Ultimas Fichas" />
            <button onClick={() => navigate('/fichas')}
              className="text-xs text-[#2E7D32] hover:text-[#0A3D0C] font-bold hover:bg-[#E8F5E9] px-2 py-1 rounded-lg transition-all">
              Ver todas &rarr;
            </button>
          </div>
          <div className="space-y-1.5">
            {(data.ultimas_fichas || []).map((f, i) => (
              <div key={f.registro_id || i}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F1F8F1] cursor-pointer transition-all duration-200 border border-transparent hover:border-[#E8F5E9]"
                onClick={() => navigate(`/fichas/${f.registro_id}`)}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0A3D0C] truncate">{f.nombre_apellido || 'Sin nombre'}</p>
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
      <div className="w-6 h-[2px] bg-[#BFA033] rounded-full" />
      <span className="text-xs font-bold text-[#5D4037] uppercase tracking-[0.1em]">{title}</span>
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

function KpiCard({ label, value, barColor, bgFrom, bgTo, textColor }) {
  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: barColor }} />
      <div className="p-4 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70" style={{ color: textColor }}>{label}</p>
        <p className="text-3xl sm:text-4xl font-extrabold mt-1" style={{ color: textColor }}>{value ?? '-'}</p>
      </div>
    </div>
  )
}

function ClasifBadge({ value }) {
  const v = (value || '').toUpperCase()
  let bg = '#f3f4f6', color = '#4b5563', border = '#e5e7eb'
  if (v.includes('SOSPECHOSO')) { bg = '#FEF3C7'; color = '#92400E'; border = '#FDE68A' }
  else if (v.includes('CONFIRMADO')) { bg = '#FEE2E2'; color = '#991B1B'; border = '#FECACA' }
  else if (v.includes('DESCARTADO')) { bg = '#E8F5E9'; color = '#1B5E20'; border = '#C8E6C9' }
  return <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold whitespace-nowrap"
    style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}>{value || '-'}</span>
}
