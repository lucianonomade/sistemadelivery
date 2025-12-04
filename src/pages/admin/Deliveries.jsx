import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { db } from '../../services/supabase'
import { getStatusLabel, getStatusColor, copyTrackingLink } from '../../services/deliveryService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './Deliveries.css'

export default function Deliveries() {
    const [deliveries, setDeliveries] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadDeliveries()
    }, [])

    const loadDeliveries = async () => {
        setLoading(true)
        const { data, error } = await db.getDeliveries()

        if (!error && data) {
            setDeliveries(data)
        }

        setLoading(false)
    }

    const handleCopyLink = async (trackingCode) => {
        const result = await copyTrackingLink(trackingCode)
        if (result.success) {
            alert('Link copiado para a área de transferência!')
        }
    }

    const filteredDeliveries = deliveries.filter(delivery => {
        const matchesFilter = filter === 'all' || delivery.status === filter
        const matchesSearch =
            delivery.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.destination_address.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesFilter && matchesSearch
    })

    if (loading) {
        return (
            <AdminLayout>
                <div className="deliveries-loading">
                    <LoadingSpinner size="lg" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="deliveries-page">
                <div className="deliveries-header">
                    <h1>Entregas</h1>
                    <Link to="/admin/entregas/nova">
                        <Button variant="primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Nova Entrega
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="deliveries-filters">
                            <div className="search-box">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar por código, cliente ou endereço..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    Todas
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                    onClick={() => setFilter('pending')}
                                >
                                    Pendentes
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'in_transit' ? 'active' : ''}`}
                                    onClick={() => setFilter('in_transit')}
                                >
                                    Em Trânsito
                                </button>
                                <button
                                    className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                                    onClick={() => setFilter('delivered')}
                                >
                                    Entregues
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody>
                        {filteredDeliveries.length === 0 ? (
                            <p className="empty-state">
                                {searchTerm || filter !== 'all'
                                    ? 'Nenhuma entrega encontrada com os filtros aplicados.'
                                    : 'Nenhuma entrega cadastrada ainda.'}
                            </p>
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
                                        {filteredDeliveries.map((delivery) => (
                                            <tr key={delivery.id}>
                                                <td className="code-cell">{delivery.tracking_code}</td>
                                                <td>{delivery.customer?.name || '-'}</td>
                                                <td className="address-cell">{delivery.destination_address}</td>
                                                <td>
                                                    <Badge variant={getStatusColor(delivery.status)}>
                                                        {getStatusLabel(delivery.status)}
                                                    </Badge>
                                                </td>
                                                <td>{format(new Date(delivery.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <Link to={`/admin/entregas/${delivery.id}`}>
                                                            <Button variant="ghost" size="sm">Ver</Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopyLink(delivery.tracking_code)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                            </svg>
                                                        </Button>
                                                    </div>
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
