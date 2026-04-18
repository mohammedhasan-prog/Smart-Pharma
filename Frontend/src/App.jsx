import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardPage from './pages/DashboardPage'
import AddMedicinePage from './pages/AddMedicinePage'
import InventoryPage from './pages/InventoryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SellMedicinePage from './pages/SellMedicinePage'
import WholesalerOrdersPage from './pages/WholesalerOrdersPage'

function getAuthState() {
  const token = localStorage.getItem('pharmacyAuthToken')
  const role = (localStorage.getItem('pharmacyUserRole') || '').toLowerCase()

  return {
    token,
    role,
    isAuthenticated: Boolean(token),
  }
}

function RequireAuth({ allowedRoles, children }) {
  const auth = getAuthState()

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(auth.role)) {
    const fallback = auth.role === 'wholesaler' ? '/wholesaler-orders' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth allowedRoles={['seller']}>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/add-medicine"
        element={
          <RequireAuth allowedRoles={['seller']}>
            <AddMedicinePage />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory"
        element={
          <RequireAuth allowedRoles={['seller']}>
            <InventoryPage />
          </RequireAuth>
        }
      />
      <Route
        path="/sell-medicine"
        element={
          <RequireAuth allowedRoles={['seller']}>
            <SellMedicinePage />
          </RequireAuth>
        }
      />
      <Route
        path="/wholesaler-orders"
        element={
          <RequireAuth allowedRoles={['wholesaler']}>
            <WholesalerOrdersPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
