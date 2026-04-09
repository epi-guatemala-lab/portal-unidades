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
      {/* Top bar */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.unidad?.nombre || 'Portal'}</p>
              <p className="text-xs text-blue-200 truncate">{user?.unidad?.departamento || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-blue-200 hover:text-white shrink-0 ml-2"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          <TabLink to="/" end>Dashboard</TabLink>
          <TabLink to="/fichas">Fichas</TabLink>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4 border-t bg-white">
        IGSS - Seccion de Epidemiologia
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
        `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          isActive
            ? 'border-blue-600 text-blue-600'
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fichas"
          element={
            <ProtectedRoute>
              <Layout><FichasPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fichas/:id"
          element={
            <ProtectedRoute>
              <Layout><FichaDetailPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
