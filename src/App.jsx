import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import FichasPage from './pages/FichasPage'
import FichaDetailPage from './pages/FichaDetailPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header IGSS — mismo estilo que formulario sarampión */}
      <header className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-igss-900 via-igss-800 to-igss-700 text-white">
          <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                  <img
                    src={import.meta.env.BASE_URL + 'igss-logo.png'}
                    alt="Logo IGSS"
                    className="relative w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-2xl"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-xs text-igss-300 font-semibold uppercase tracking-[0.15em]">
                    Instituto Guatemalteco de Seguridad Social
                  </p>
                  <h1 className="text-sm sm:text-lg font-extrabold leading-tight mt-0.5 tracking-tight">
                    Portal de Unidades
                  </h1>
                  <p className="text-[10px] sm:text-sm text-igss-200 font-medium">
                    {user?.unidad?.nombre || 'Vigilancia Epidemiologica'}
                  </p>
                  <p className="text-[8px] sm:text-xs text-igss-300/70 hidden sm:block">
                    Subgerencia de Prestaciones en Salud &middot; Departamento de Medicina Preventiva &middot; Seccion de Epidemiologia
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] text-igss-300 hidden md:inline">{user?.unidad?.departamento}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Gold accent bar — identidad IGSS */}
        <div className="h-1.5 bg-gradient-to-r from-igss-gold-dark via-igss-gold to-igss-gold-light shadow-sm" />
      </header>

      {/* Navigation tabs */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          <TabLink to="/" end>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </TabLink>
          <TabLink to="/fichas">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Fichas</span>
          </TabLink>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Footer IGSS */}
      <footer className="text-center py-4 border-t bg-white">
        <p className="text-xs text-gray-500 font-medium">
          Instituto Guatemalteco de Seguridad Social
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Subgerencia de Prestaciones en Salud &middot; Departamento de Medicina Preventiva &middot; Seccion de Epidemiologia
        </p>
        <p className="text-[10px] text-gray-300 mt-0.5">
          Vigilancia Epidemiologica &middot; Brote Sarampion 2026
        </p>
      </footer>
    </div>
  )
}

function TabLink({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          isActive
            ? 'border-igss-700 text-igss-800'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/fichas" element={<ProtectedRoute><Layout><FichasPage /></Layout></ProtectedRoute>} />
        <Route path="/fichas/:id" element={<ProtectedRoute><Layout><FichaDetailPage /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
