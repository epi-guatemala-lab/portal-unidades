import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim().toLowerCase(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-igss-900 to-igss-800 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header con identidad IGSS — mismo estilo que formulario sarampión */}
        <div className="bg-gradient-to-br from-igss-900 via-igss-800 to-igss-700 px-8 pt-8 pb-6 text-center relative">
          <div className="absolute inset-0 bg-white/5 rounded-b-3xl" />
          <div className="relative">
            <div className="mx-auto w-20 h-20 relative mb-4">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
              <img
                src={import.meta.env.BASE_URL + 'igss-logo.png'}
                alt="Logo IGSS"
                className="relative w-20 h-20 object-contain drop-shadow-2xl mx-auto"
              />
            </div>
            <p className="text-[9px] text-igss-300 font-semibold uppercase tracking-[0.2em] mb-1">
              Instituto Guatemalteco de Seguridad Social
            </p>
            <h1 className="text-lg font-extrabold text-white tracking-tight">
              Portal de Unidades
            </h1>
            <p className="text-igss-200 text-xs mt-1 font-medium">
              Vigilancia Epidemiologica — Sarampion 2026
            </p>
          </div>
        </div>
        {/* Gold bar */}
        <div className="h-1 bg-gradient-to-r from-igss-gold-dark via-igss-gold to-igss-gold-light" />

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-igss-600 focus:border-igss-600 outline-none text-sm"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-igss-600 focus:border-igss-600 outline-none text-sm"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-igss-red text-sm px-4 py-2.5 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-igss-800 text-white py-2.5 rounded-lg font-semibold hover:bg-igss-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-1">
            <p className="text-[10px] text-gray-400">
              Departamento de Medicina Preventiva
            </p>
            <p className="text-[10px] text-gray-400">
              Seccion de Epidemiologia
            </p>
            <p className="text-[10px] text-gray-300 mt-2">
              Solicite sus credenciales a Epidemiologia Central
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
