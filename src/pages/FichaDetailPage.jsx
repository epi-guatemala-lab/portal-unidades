import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFichaDetail, downloadPdf } from '../api/client'

const SECTIONS = [
  { title: 'Datos del Paciente', fields: [
    ['nombre_apellido', 'Nombre Completo'], ['afiliacion', 'Afiliacion'],
    ['sexo', 'Sexo'], ['edad_anios', 'Edad (anos)'], ['edad_meses', 'Edad (meses)'],
    ['fecha_nacimiento', 'Fecha Nacimiento'], ['departamento_residencia', 'Departamento'],
    ['municipio_residencia', 'Municipio'], ['direccion_exacta', 'Direccion'],
    ['pueblo_etnia', 'Pueblo/Etnia'], ['ocupacion', 'Ocupacion'], ['telefono_encargado', 'Telefono'],
  ]},
  { title: 'Datos Generales', fields: [
    ['registro_id', 'ID Registro'], ['unidad_medica', 'Unidad Medica'],
    ['fecha_notificacion', 'Fecha Notificacion'], ['semana_epidemiologica', 'Semana Epidemiologica'],
    ['clasificacion_caso', 'Clasificacion'], ['codigo_cie10', 'CIE-10'],
    ['diagnostico_registrado', 'Diagnostico'], ['servicio_reporta', 'Servicio'],
    ['nom_responsable', 'Responsable'],
  ]},
  { title: 'Informacion Clinica', fields: [
    ['fecha_inicio_sintomas', 'Inicio Sintomas'], ['fecha_inicio_erupcion', 'Inicio Erupcion'],
    ['fecha_inicio_fiebre', 'Inicio Fiebre'], ['temperatura_celsius', 'Temperatura'],
    ['signo_fiebre', 'Fiebre'], ['signo_exantema', 'Exantema'], ['signo_tos', 'Tos'],
    ['signo_conjuntivitis', 'Conjuntivitis'], ['signo_coriza', 'Coriza'],
    ['signo_manchas_koplik', 'Manchas Koplik'], ['signo_adenopatias', 'Adenopatias'],
    ['signo_artralgia', 'Artralgia'],
  ]},
  { title: 'Vacunacion', fields: [
    ['vacunado', 'Vacunado'], ['numero_dosis_spr', 'Dosis SPR'],
    ['fecha_ultima_dosis', 'Fecha Ultima Dosis'], ['tipo_vacuna', 'Tipo Vacuna'],
  ]},
  { title: 'Hospitalizacion', fields: [
    ['hospitalizado', 'Hospitalizado'], ['hosp_nombre', 'Hospital'],
    ['hosp_fecha', 'Fecha'], ['complicaciones', 'Complicaciones'],
    ['condicion_egreso', 'Egreso'], ['fecha_defuncion', 'Fecha Defuncion'],
  ]},
  { title: 'Laboratorio', fields: [
    ['recolecto_muestra', 'Muestra'], ['muestra_suero', 'Suero'], ['muestra_suero_fecha', 'Fecha Suero'],
    ['muestra_hisopado', 'Hisopado'], ['muestra_hisopado_fecha', 'Fecha Hisopado'],
    ['muestra_orina', 'Orina'], ['muestra_orina_fecha', 'Fecha Orina'],
    ['resultado_igm_cualitativo', 'IgM'], ['resultado_igg_cualitativo', 'IgG'],
    ['resultado_pcr_hisopado', 'PCR Hisopado'], ['resultado_pcr_orina', 'PCR Orina'],
  ]},
  { title: 'Factores de Riesgo', fields: [
    ['contacto_sospechoso_7_23', 'Contacto Sospechoso'], ['caso_sospechoso_comunidad_3m', 'Caso en Comunidad'],
    ['viajo_7_23_previo', 'Viaje Previo'], ['destino_viaje', 'Destino'],
  ]},
]

export default function FichaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ficha, setFicha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    getFichaDetail(id)
      .then((res) => setFicha(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const blob = await downloadPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ficha_${(ficha?.nombre_apellido || 'ficha').replace(/\s+/g, '_').slice(0, 30)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error al descargar PDF: ' + e.message)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="animate-pulse"><div className="bg-[#F1F8F1] rounded-2xl h-96 border border-[#E8F5E9]" /></div>
  if (error) return <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 text-sm text-red-800">{error}</div>
  if (!ficha) return null

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#2E7D32] hover:text-[#0A3D0C] font-semibold hover:bg-[#F1F8F1] px-3 py-1.5 rounded-xl transition-all active:scale-95"
        >
          &larr; Volver
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-xl text-sm font-bold hover:from-[#0A3D0C] hover:to-[#1B5E20] disabled:opacity-50 transition-all duration-200 shadow-sm active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {downloading ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      {/* Patient header card */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl shadow-sm p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold">{ficha.nombre_apellido || 'Sin nombre'}</h2>
            <p className="text-[#C8E6C9] text-sm mt-1">
              {ficha.afiliacion || 'Sin afiliacion'} &middot; {ficha.edad_anios ? `${ficha.edad_anios} anos` : ''} {ficha.sexo === 'M' ? 'Masculino' : ficha.sexo === 'F' ? 'Femenino' : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#A5D6A7]">
              <span>SE {ficha.semana_epidemiologica || '?'}</span>
              <span>{ficha.fecha_notificacion || ''}</span>
              <span>{ficha.unidad_medica || ''}</span>
            </div>
          </div>
          <ClasifBadgeLg value={ficha.clasificacion_caso} />
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const hasData = section.fields.some(([key]) => ficha[key])
        if (!hasData) return null
        return (
          <div key={section.title} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-5">
            <SectionHeader title={section.title} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 mt-4">
              {section.fields.map(([key, label]) => {
                const val = ficha[key]
                if (!val && val !== 0) return null
                return (
                  <div key={key}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</p>
                    <p className="text-sm text-[#0A3D0C] font-semibold mt-0.5 truncate">{val}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <p className="text-[10px] text-gray-300 text-center pb-2 font-mono">
        {ficha.registro_id}
      </p>
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

function ClasifBadgeLg({ value }) {
  const v = (value || '').toUpperCase()
  let cls = 'bg-white/20 text-white'
  if (v.includes('SOSPECHOSO')) cls = 'bg-amber-400/20 text-amber-100'
  else if (v.includes('CONFIRMADO')) cls = 'bg-red-400/20 text-red-100'
  else if (v.includes('DESCARTADO')) cls = 'bg-green-400/20 text-green-100'
  return <span className={`text-sm px-3 py-1.5 rounded-xl font-bold ${cls}`}>{value || '-'}</span>
}
