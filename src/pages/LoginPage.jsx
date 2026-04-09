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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003876] to-[#00264d] px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header con logo IGSS */}
        <div className="bg-gradient-to-r from-[#003876] to-[#005baa] px-8 pt-8 pb-6 text-center">
          <img
            src={import.meta.env.BASE_URL + 'igss-logo.png'}
            alt="IGSS"
            className="h-16 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-lg font-bold text-white">Portal de Unidades</h1>
          <p className="text-blue-200 text-xs mt-1">
            Departamento de Medicina Preventiva
          </p>
          <p className="text-blue-300 text-xs">
            Seccion de Epidemiologia
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003876] focus:border-[#003876] outline-none text-sm"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003876] focus:border-[#003876] outline-none text-sm"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003876] text-white py-2.5 rounded-lg font-medium hover:bg-[#002b5c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Vigilancia Epidemiologica - Brote Sarampion 2026
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Solicite sus credenciales a Epidemiologia Central
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
