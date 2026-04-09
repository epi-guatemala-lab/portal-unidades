// En producción: URL relativa (nginx proxea /portal-unidades/api/ → backend)
// En desarrollo: localhost directo
const API_URL = import.meta.env.DEV
  ? 'http://localhost:8510/api/portal'
  : '/portal-unidades/api'

let _token = null

export function setToken(token) {
  _token = token
}

export function clearToken() {
  _token = null
}

export function getToken() {
  return _token
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`
  const headers = { ...options.headers }

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof Blob)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = import.meta.env.BASE_URL + 'login'
    throw new Error('Sesion expirada')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error de conexion' }))
    throw new Error(err.detail || `Error ${res.status}`)
  }

  return res
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error de conexion' }))
    throw new Error(err.detail || 'Credenciales invalidas')
  }
  const data = await res.json()
  _token = data.token
  return data
}

export async function getMe() {
  const res = await request('/me')
  return res.json()
}

export async function getDashboard() {
  const res = await request('/dashboard')
  return res.json()
}

export async function getFichas(page = 1, limit = 20, filters = {}) {
  const params = new URLSearchParams({ page, limit })
  if (filters.clasificacion) params.set('clasificacion', filters.clasificacion)
  if (filters.semana) params.set('semana', filters.semana)
  if (filters.q) params.set('q', filters.q)
  const res = await request(`/fichas?${params}`)
  return res.json()
}

export async function getFichaDetail(id) {
  const res = await request(`/fichas/${encodeURIComponent(id)}`)
  return res.json()
}

export async function downloadPdf(id) {
  const res = await request(`/fichas/${encodeURIComponent(id)}/pdf`)
  return res.blob()
}

export async function downloadExcel() {
  const res = await request('/export/excel')
  return res.blob()
}

export async function downloadPdfs(ids) {
  const res = await request('/export/pdfs', {
    method: 'POST',
    body: { ids },
  })
  return res.blob()
}

export async function changePassword(currentPassword, newPassword) {
  const res = await request('/change-password', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  })
  return res.json()
}
