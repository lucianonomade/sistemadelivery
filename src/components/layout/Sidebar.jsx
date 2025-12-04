import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../services/supabase'
import './Sidebar.css'

export default function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await auth.signOut()
        navigate('/admin/login')
    }

    const menuItems = [
        {
            path: '/admin/dashboard',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            ),
            label: 'Dashboard'
        },
        {
            path: '/admin/entregas',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                </svg>
            ),
            label: 'Entregas'
        }
    ]

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/polimix-logo.png" alt="Polimix" className="logo-image" />
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        <span className="sidebar-link-label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="sidebar-logout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    )
}
