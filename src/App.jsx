import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from './services/supabase'

// Admin Pages
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Deliveries from './pages/admin/Deliveries'
import DeliveryForm from './pages/admin/DeliveryForm'
import DeliveryDetails from './pages/admin/DeliveryDetails'

// Public Pages
import TrackDelivery from './pages/public/TrackDelivery'

// Protected Route Component
function ProtectedRoute({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkUser()

        const { data: authListener } = auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null)
            setLoading(false)
        })

        return () => {
            authListener?.subscription?.unsubscribe()
        }
    }, [])

    const checkUser = async () => {
        const { user } = await auth.getUser()
        setUser(user)
        setLoading(false)
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                Carregando...
            </div>
        )
    }

    return user ? children : <Navigate to="/admin/login" replace />
}

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/rastrear/:trackingCode" element={<TrackDelivery />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/entregas"
                element={
                    <ProtectedRoute>
                        <Deliveries />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/entregas/nova"
                element={
                    <ProtectedRoute>
                        <DeliveryForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/entregas/:id"
                element={
                    <ProtectedRoute>
                        <DeliveryDetails />
                    </ProtectedRoute>
                }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
    )
}

export default App
