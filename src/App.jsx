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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — idéntico al formulario sarampión */}
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
                    className="relative w-12 h-12 sm:w-[64px] sm:h-[64px] object-contain drop-shadow-2xl"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] text-igss-300 font-semibold uppercase tracking-[0.15em]">
                    Instituto Guatemalteco de Seguridad Social
                  </p>
                  <h1 className="text-sm sm:text-lg font-extrabold leading-tight mt-0.5 tracking-tight">
                    Portal de Unidades
                  </h1>
                  <p className="text-[10px] sm:text-sm text-igss-200 font-medium truncate">
                    {user?.unidad?.nombre || 'Vigilancia Epidemiologica'}
                  </p>
                  <p className="text-[8px] sm:text-xs text-igss-300/70 hidden sm:block">
                    Subgerencia de Prestaciones en Salud
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] text-igss-300 hidden md:inline">{user?.unidad?.departamento}</span>
                <button
                  onClick={() => { logout(); navigate('/login', { replace: true }) }}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Gold accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-igss-gold-dark via-igss-gold to-igss-gold-light shadow-sm" />
      </header>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-igss-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          <TabLink to="/" end>Dashboard</TabLink>
          <TabLink to="/fichas">Fichas</TabLink>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-5 sm:py-6">
        <div className="fade-in">
          {children}
        </div>
      </main>

      {/* Footer — idéntico al formulario sarampión */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-igss-gold to-transparent" />
      <footer className="bg-igss-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px]">
            <span className="text-igss-300">
              Departamento de Medicina Preventiva &middot; Seccion de Epidemiologia
            </span>
            <span className="text-igss-300/40">
              IGSS &middot; Vigilancia Epidemiologica 2026
            </span>
          </div>
        </div>
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
        `px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
          isActive
            ? 'border-igss-700 text-igss-800'
            : 'border-transparent text-gray-400 hover:text-igss-700 hover:border-igss-300'
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
