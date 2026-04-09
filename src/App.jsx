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
      {/* Header IGSS */}
      <header className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-[#0A3D0C] via-[#1B5E20] to-[#2E7D32] text-white">
          <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                  <img src={import.meta.env.BASE_URL + 'igss-logo.png'} alt="IGSS" className="relative w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] text-[#A5D6A7] font-semibold uppercase tracking-[0.15em]">
                    Instituto Guatemalteco de Seguridad Social
                  </p>
                  <h1 className="text-sm sm:text-lg font-extrabold leading-tight mt-0.5 tracking-tight text-white">
                    Portal de Unidades
                  </h1>
                  <p className="text-[10px] sm:text-sm text-[#C8E6C9] font-medium truncate">
                    {user?.unidad?.nombre || 'Vigilancia Epidemiologica'}
                  </p>
                  <p className="text-[8px] sm:text-xs text-[#A5D6A7]/70 hidden sm:block">
                    Subgerencia de Prestaciones en Salud
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] text-[#A5D6A7] hidden md:inline">{user?.unidad?.departamento}</span>
                <button onClick={() => { logout(); navigate('/login', { replace: true }) }}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white">
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-gradient-to-r from-[#8B7424] via-[#BFA033] to-[#D4B94E] shadow-sm" />
      </header>

      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#E8F5E9] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          <TabLink to="/" end>Dashboard</TabLink>
          <TabLink to="/fichas">Fichas</TabLink>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-5 sm:py-6">
        <div className="fade-in">{children}</div>
      </main>

      {/* Footer */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#BFA033] to-transparent" />
      <footer className="bg-[#0A3D0C] text-white">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px]">
            <span className="text-[#A5D6A7]">Departamento de Medicina Preventiva &middot; Seccion de Epidemiologia</span>
            <span className="text-[#A5D6A7]/40">IGSS &middot; Vigilancia Epidemiologica 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TabLink({ to, children, end }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        `px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
          isActive ? 'border-[#2E7D32] text-[#1B5E20]' : 'border-transparent text-gray-400 hover:text-[#2E7D32] hover:border-[#A5D6A7]'
        }`
      }>
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
