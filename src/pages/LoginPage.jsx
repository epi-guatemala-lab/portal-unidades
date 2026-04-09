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
    <div className="min-h-screen flex flex-col">
      {/* Full green header background — same as sarampion form */}
      <div className="bg-gradient-to-br from-[#0A3D0C] via-[#1B5E20] to-[#2E7D32] flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full bg-white/[0.02]" />
        <div className="absolute top-[20%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/[0.02]" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo + institution above card */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl scale-150" />
              <img
                src={import.meta.env.BASE_URL + 'igss-logo.png'}
                alt="Logo IGSS"
                className="relative w-24 h-24 object-contain drop-shadow-2xl"
              />
            </div>
            <p className="text-[10px] sm:text-xs text-[#A5D6A7] font-bold uppercase tracking-[0.2em]">
              Instituto Guatemalteco de Seguridad Social
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-8 py-5">
              <h1 className="text-xl font-extrabold text-white text-center tracking-tight">
                Portal de Unidades
              </h1>
              <p className="text-[#A5D6A7] text-sm text-center mt-1 font-medium">
                Vigilancia Epidemiologica — Sarampion 2026
              </p>
            </div>
            {/* Gold bar */}
            <div className="h-1 bg-gradient-to-r from-[#8B7424] via-[#BFA033] to-[#D4B94E]" />

            {/* Form */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
                    autoComplete="username"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contrasena</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-[#C41E24] text-sm px-4 py-3 rounded-xl border border-red-200 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white py-3 rounded-xl font-bold hover:from-[#0A3D0C] hover:to-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Ingresando...
                    </span>
                  ) : 'Ingresar'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium">
                  Subgerencia de Prestaciones en Salud
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Departamento de Medicina Preventiva &middot; Seccion de Epidemiologia
                </p>
                <p className="text-[10px] text-gray-300 mt-3">
                  Solicite sus credenciales a Epidemiologia Central
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
