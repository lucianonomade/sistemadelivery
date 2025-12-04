import Sidebar from './Sidebar'
import './AdminLayout.css'

export default function AdminLayout({ children }) {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-content">
                {children}
            </main>
        </div>
    )
}
