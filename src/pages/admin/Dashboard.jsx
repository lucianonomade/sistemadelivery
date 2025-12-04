import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { db } from '../../services/supabase'
import { getStatusLabel, getStatusColor } from '../../services/deliveryService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './Dashboard.css'

export default function Dashboard() {
    const [deliveries, setDeliveries] = useState([])
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inTransit: 0,
        delivered: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        setLoading(true)
        const { data, error } = await db.getDeliveries()

        if (!error && data) {
            setDeliveries(data.slice(0, 5)) // Last 5 deliveries

            // Calculate stats
            const stats = {
                total: data.length,
                pending: data.filter(d => d.status === 'pending').length,
                inTransit: data.filter(d => d.status === 'in_transit').length,
                delivered: data.filter(d => d.status === 'delivered').length
            }
            setStats(stats)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="dashboard-loading">
                    <LoadingSpinner size="lg" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <Link to="/admin/entregas/nova">
                        <Button variant="primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Nova Entrega
                        </Button>
                    </Link>
                </div>

                <div className="stats-grid">
                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-icon stat-icon-primary">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Total de Entregas</p>
                                <p className="stat-value">{stats.total}</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-icon stat-icon-warning">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Pendentes</p>
                                <p className="stat-value">{stats.pending}</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-icon stat-icon-info">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Em Trânsito</p>
                                <p className="stat-value">{stats.inTransit}</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="stat-card">
                        <CardBody>
                            <div className="stat-icon stat-icon-success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <path d="M22 4L12 14.01l-3-3" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Entregues</p>
                                <p className="stat-value">{stats.delivered}</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="card-title">Entregas Recentes</h2>
                    </CardHeader>
                    <CardBody>
                        {deliveries.length === 0 ? (
                            <p className="empty-state">Nenhuma entrega cadastrada ainda.</p>
                        ) : (
                            <div className="deliveries-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Cliente</th>
                                            <th>Destino</th>
                                            <th>Status</th>
                                            <th>Data</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveries.map((delivery) => (
                                            <tr key={delivery.id}>
                                                <td className="code-cell">{delivery.tracking_code}</td>
                                                <td>{delivery.customer?.name || '-'}</td>
                                                <td className="address-cell">{delivery.destination_address}</td>
                                                <td>
                                                    <Badge variant={getStatusColor(delivery.status)}>
                                                        {getStatusLabel(delivery.status)}
                                                    </Badge>
                                                </td>
                                                <td>{format(new Date(delivery.created_at), 'dd/MM/yyyy', { locale: ptBR })}</td>
                                                <td>
                                                    <Link to={`/admin/entregas/${delivery.id}`}>
                                                        <Button variant="ghost" size="sm">Ver</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    )
}
