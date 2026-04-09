import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFichaDetail, downloadPdf } from '../api/client'

const SECTIONS = [
  {
    title: 'Datos del Paciente',
    fields: [
      ['nombre_apellido', 'Nombre Completo'],
      ['afiliacion', 'Afiliacion'],
      ['sexo', 'Sexo'],
      ['edad_anios', 'Edad (años)'],
      ['edad_meses', 'Edad (meses)'],
      ['fecha_nacimiento', 'Fecha Nacimiento'],
      ['departamento_residencia', 'Departamento'],
      ['municipio_residencia', 'Municipio'],
      ['direccion_exacta', 'Direccion'],
      ['pueblo_etnia', 'Pueblo/Etnia'],
      ['ocupacion', 'Ocupacion'],
      ['telefono_encargado', 'Telefono'],
    ],
  },
  {
    title: 'Datos Generales',
    fields: [
      ['registro_id', 'ID Registro'],
      ['unidad_medica', 'Unidad Medica'],
      ['fecha_notificacion', 'Fecha Notificacion'],
      ['semana_epidemiologica', 'Semana Epidemiologica'],
      ['clasificacion_caso', 'Clasificacion'],
      ['codigo_cie10', 'CIE-10'],
      ['diagnostico_registrado', 'Diagnostico'],
      ['servicio_reporta', 'Servicio Reporta'],
      ['nom_responsable', 'Responsable'],
    ],
  },
  {
    title: 'Informacion Clinica',
    fields: [
      ['fecha_inicio_sintomas', 'Inicio Sintomas'],
      ['fecha_inicio_erupcion', 'Inicio Erupcion'],
      ['fecha_inicio_fiebre', 'Inicio Fiebre'],
      ['temperatura_celsius', 'Temperatura'],
      ['signo_fiebre', 'Fiebre'],
      ['signo_exantema', 'Exantema'],
      ['signo_tos', 'Tos'],
      ['signo_conjuntivitis', 'Conjuntivitis'],
      ['signo_coriza', 'Coriza'],
      ['signo_manchas_koplik', 'Manchas Koplik'],
      ['signo_adenopatias', 'Adenopatias'],
      ['signo_artralgia', 'Artralgia'],
    ],
  },
  {
    title: 'Vacunacion',
    fields: [
      ['vacunado', 'Vacunado'],
      ['numero_dosis_spr', 'Dosis SPR'],
      ['fecha_ultima_dosis', 'Fecha Ultima Dosis'],
      ['tipo_vacuna', 'Tipo Vacuna'],
      ['fuente_info_vacuna', 'Fuente Info'],
    ],
  },
  {
    title: 'Hospitalizacion',
    fields: [
      ['hospitalizado', 'Hospitalizado'],
      ['hosp_nombre', 'Hospital'],
      ['hosp_fecha', 'Fecha Hospitalizacion'],
      ['complicaciones', 'Complicaciones'],
      ['condicion_egreso', 'Condicion Egreso'],
      ['fecha_egreso', 'Fecha Egreso'],
      ['fecha_defuncion', 'Fecha Defuncion'],
    ],
  },
  {
    title: 'Laboratorio',
    fields: [
      ['recolecto_muestra', 'Muestra Recolectada'],
      ['muestra_suero', 'Suero'],
      ['muestra_suero_fecha', 'Fecha Suero'],
      ['muestra_hisopado', 'Hisopado'],
      ['muestra_hisopado_fecha', 'Fecha Hisopado'],
      ['muestra_orina', 'Orina'],
      ['muestra_orina_fecha', 'Fecha Orina'],
      ['resultado_igm_cualitativo', 'IgM'],
      ['resultado_igg_cualitativo', 'IgG'],
      ['resultado_pcr_hisopado', 'PCR Hisopado'],
      ['resultado_pcr_orina', 'PCR Orina'],
    ],
  },
  {
    title: 'Embarazo',
    fields: [
      ['esta_embarazada', 'Embarazada'],
      ['semanas_embarazo', 'Semanas'],
      ['fecha_probable_parto', 'Fecha Probable Parto'],
      ['vacuna_embarazada', 'Vacuna Embarazada'],
    ],
  },
  {
    title: 'Factores de Riesgo',
    fields: [
      ['contacto_sospechoso_7_23', 'Contacto Sospechoso'],
      ['caso_sospechoso_comunidad_3m', 'Caso en Comunidad'],
      ['viajo_7_23_previo', 'Viaje Previo'],
      ['destino_viaje', 'Destino'],
      ['contacto_enfermo_catarro', 'Contacto Enfermo'],
      ['contacto_embarazada', 'Contacto Embarazada'],
    ],
  },
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
      const nombre = (ficha?.nombre_apellido || 'ficha').replace(/\s+/g, '_').slice(0, 30)
      a.download = `ficha_${nombre}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error al descargar PDF: ' + e.message)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="bg-gray-100 rounded-xl h-96" /></div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!ficha) return null

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {downloading ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      {/* Patient header card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{ficha.nombre_apellido || 'Sin nombre'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {ficha.afiliacion || 'Sin afiliacion'} &middot; {ficha.edad_anios ? `${ficha.edad_anios} años` : ''} {ficha.sexo === 'M' ? 'Masculino' : ficha.sexo === 'F' ? 'Femenino' : ''}
            </p>
          </div>
          <ClasifBadgeLg value={ficha.clasificacion_caso} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>Semana {ficha.semana_epidemiologica || '?'}</span>
          <span>{ficha.fecha_notificacion || ''}</span>
          <span>{ficha.unidad_medica || ''}</span>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const hasData = section.fields.some(([key]) => ficha[key])
        if (!hasData) return null
        return (
          <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              {section.fields.map(([key, label]) => {
                const val = ficha[key]
                if (!val && val !== 0) return null
                return (
                  <div key={key} className="flex justify-between py-1 text-sm">
                    <span className="text-gray-500 mr-2">{label}</span>
                    <span className="text-gray-900 font-medium text-right truncate max-w-[200px]">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <p className="text-xs text-gray-400 text-center pb-4">
        ID: {ficha.registro_id}
      </p>
    </div>
  )
}

function ClasifBadgeLg({ value }) {
  const v = (value || '').toUpperCase()
  let cls = 'bg-gray-100 text-gray-600'
  if (v.includes('SOSPECHOSO')) cls = 'bg-amber-100 text-amber-700'
  else if (v.includes('CONFIRMADO')) cls = 'bg-red-100 text-red-700'
  else if (v.includes('DESCARTADO')) cls = 'bg-green-100 text-green-700'
  return <span className={`text-sm px-3 py-1 rounded-full font-medium ${cls}`}>{value || '-'}</span>
}
