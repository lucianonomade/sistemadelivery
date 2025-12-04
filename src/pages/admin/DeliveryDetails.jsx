import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { db } from '../../services/supabase'
import {
    getStatusLabel,
    getStatusColor,
    updateDeliveryStatus,
    addTrackingUpdate,
    copyTrackingLink,
    getTrackingLink
} from '../../services/deliveryService'
import { geocodeAddress, reverseGeocode } from '../../services/mapbox'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './DeliveryDetails.css'

export default function DeliveryDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [delivery, setDelivery] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [updateAddresses, setUpdateAddresses] = useState({})

    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        notes: ''
    })

    const [locationUpdate, setLocationUpdate] = useState({
        address: '',
        notes: ''
    })

    useEffect(() => {
        loadDelivery()
    }, [id])

    const loadDelivery = async () => {
        setLoading(true)
        const { data, error } = await db.getDeliveryById(id)

        if (error || !data) {
            alert('Erro ao carregar entrega')
            navigate('/admin/entregas')
            return
        }

        setDelivery(data)

        // Reverse geocode tracking updates with coordinates
        if (data.tracking_updates && data.tracking_updates.length > 0) {
            const addresses = {}
            for (const update of data.tracking_updates) {
                if (update.latitude && update.longitude) {
                    const result = await reverseGeocode(update.latitude, update.longitude)
                    if (result.success) {
                        addresses[update.id] = result.address
                    }
                }
            }
            setUpdateAddresses(addresses)
        }

        setLoading(false)
    }

    const handleStatusUpdate = async () => {
        if (!statusUpdate.status) {
            alert('Selecione um status')
            return
        }

        setUpdating(true)
        const result = await updateDeliveryStatus(id, statusUpdate.status, statusUpdate.notes)

        if (result.success) {
            alert('Status atualizado com sucesso!')
            setShowStatusModal(false)
            setStatusUpdate({ status: '', notes: '' })
            loadDelivery()
        } else {
            alert('Erro ao atualizar status: ' + result.error)
        }

        setUpdating(false)
    }

    const handleLocationUpdate = async () => {
        if (!locationUpdate.address) {
            alert('Digite o endereço')
            return
        }

        setUpdating(true)

        // Geocode the address first
        const geocodeResult = await geocodeAddress(locationUpdate.address)

        if (!geocodeResult.success) {
            alert('Erro ao geocodificar endereço: ' + geocodeResult.error)
            setUpdating(false)
            return
        }

        // Now add tracking update with geocoded coordinates
        const result = await addTrackingUpdate(id, {
            latitude: geocodeResult.lat,
            longitude: geocodeResult.lng,
            status: delivery.status,
            notes: locationUpdate.notes
        })

        if (result.success) {
            alert('Localização atualizada com sucesso!')
            setShowLocationModal(false)
            setLocationUpdate({ address: '', notes: '' })
            loadDelivery()
        } else {
            alert('Erro ao atualizar localização: ' + result.error)
        }

        setUpdating(false)
    }

    const handleCopyLink = async () => {
        const result = await copyTrackingLink(delivery.tracking_code)
        if (result.success) {
            alert('Link copiado para a área de transferência!')
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="details-loading">
                    <LoadingSpinner size="lg" />
                </div>
            </AdminLayout>
        )
    }

    if (!delivery) {
        return (
            <AdminLayout>
                <div className="details-error">
                    <p>Entrega não encontrada</p>
                    <Button onClick={() => navigate('/admin/entregas')}>Voltar</Button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="delivery-details-page">
                <div className="details-header">
                    <div>
                        <Link to="/admin/entregas" className="back-link">
                            ← Voltar para Entregas
                        </Link>
                        <h1>Detalhes da Entrega</h1>
                    </div>
                    <div className="header-actions">
                        <Button variant="outline" onClick={handleCopyLink}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            Copiar Link
                        </Button>
                        <a
                            href={getTrackingLink(delivery.tracking_code)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="secondary">
                                Ver Rastreamento Público
                            </Button>
                        </a>
                    </div>
                </div>

                <div className="details-grid">
                    <div className="details-main">
                        <Card>
                            <CardHeader>
                                <div className="card-header-content">
                                    <div>
                                        <p className="tracking-label">Código de Rastreamento</p>
                                        <p className="tracking-code">{delivery.tracking_code}</p>
                                    </div>
                                    <Badge variant={getStatusColor(delivery.status)} className="status-badge-large">
                                        {getStatusLabel(delivery.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Cliente</span>
                                        <span className="info-value">{delivery.customer?.name || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tipo de Cimento</span>
                                        <span className="info-value">{delivery.cement_type || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Quantidade</span>
                                        <span className="info-value">{delivery.quantity || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Data de Criação</span>
                                        <span className="info-value">
                                            {format(new Date(delivery.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2>Endereços</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="address-section">
                                    <div className="address-item">
                                        <span className="address-label">Origem</span>
                                        <p className="address-text">{delivery.origin_address || 'Não informado'}</p>
                                    </div>
                                    <div className="address-item">
                                        <span className="address-label">Destino</span>
                                        <p className="address-text">{delivery.destination_address}</p>
                                        {delivery.destination_lat && delivery.destination_lng && (
                                            <p className="coordinates-text">
                                                📍 {delivery.destination_lat.toFixed(6)}, {delivery.destination_lng.toFixed(6)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {delivery.driver_name && (
                            <Card>
                                <CardHeader>
                                    <h2>Informações do Motorista</h2>
                                </CardHeader>
                                <CardBody>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Nome</span>
                                            <span className="info-value">{delivery.driver_name}</span>
                                        </div>
                                        {delivery.driver_phone && (
                                            <div className="info-item">
                                                <span className="info-label">Telefone</span>
                                                <span className="info-value">{delivery.driver_phone}</span>
                                            </div>
                                        )}
                                        {delivery.vehicle_plate && (
                                            <div className="info-item">
                                                <span className="info-label">Placa</span>
                                                <span className="info-value">{delivery.vehicle_plate}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {delivery.notes && (
                            <Card>
                                <CardHeader>
                                    <h2>Observações</h2>
                                </CardHeader>
                                <CardBody>
                                    <p className="notes-text">{delivery.notes}</p>
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    <div className="details-sidebar">
                        <Card>
                            <CardHeader>
                                <h2>Ações Rápidas</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="quick-actions">
                                    <Button
                                        variant="primary"
                                        className="action-button"
                                        onClick={() => setShowStatusModal(true)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <path d="M22 4L12 14.01l-3-3" />
                                        </svg>
                                        Atualizar Status
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="action-button"
                                        onClick={() => setShowLocationModal(true)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Atualizar Localização
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2>Histórico de Atualizações</h2>
                            </CardHeader>
                            <CardBody>
                                {!delivery.tracking_updates || delivery.tracking_updates.length === 0 ? (
                                    <p className="empty-text">Nenhuma atualização registrada</p>
                                ) : (
                                    <div className="timeline">
                                        {delivery.tracking_updates.map((update) => (
                                            <div key={update.id} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <Badge variant={getStatusColor(update.status)}>
                                                        {getStatusLabel(update.status)}
                                                    </Badge>
                                                    {update.notes && <p className="timeline-notes">{update.notes}</p>}
                                                    {update.latitude && update.longitude && (
                                                        <p className="timeline-location">
                                                            📍 {updateAddresses[update.id] || `${update.latitude.toFixed(6)}, ${update.longitude.toFixed(6)}`}
                                                        </p>
                                                    )}
                                                    <p className="timeline-date">
                                                        {format(new Date(update.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Status Update Modal */}
                <Modal
                    isOpen={showStatusModal}
                    onClose={() => setShowStatusModal(false)}
                    title="Atualizar Status"
                >
                    <div className="modal-form">
                        <div className="form-group">
                            <label className="form-label">Novo Status *</label>
                            <select
                                value={statusUpdate.status}
                                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                className="form-select"
                            >
                                <option value="">Selecione...</option>
                                <option value="pending">Pendente</option>
                                <option value="in_transit">Em Trânsito</option>
                                <option value="delivered">Entregue</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Observações</label>
                            <textarea
                                value={statusUpdate.notes}
                                onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                                placeholder="Adicione observações sobre esta atualização..."
                                className="form-textarea"
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleStatusUpdate} disabled={updating}>
                                {updating ? <LoadingSpinner size="sm" /> : 'Atualizar'}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Location Update Modal */}
                <Modal
                    isOpen={showLocationModal}
                    onClose={() => setShowLocationModal(false)}
                    title="Atualizar Localização"
                >
                    <div className="modal-form">
                        <div className="form-group full-width">
                            <label className="form-label">Endereço Atual *</label>
                            <input
                                type="text"
                                value={locationUpdate.address}
                                onChange={(e) => setLocationUpdate({ ...locationUpdate, address: e.target.value })}
                                placeholder="Digite o endereço atual do caminhão"
                                className="form-input"
                            />
                            <p className="help-text">O endereço será geocodificado automaticamente</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Observações</label>
                            <textarea
                                value={locationUpdate.notes}
                                onChange={(e) => setLocationUpdate({ ...locationUpdate, notes: e.target.value })}
                                placeholder="Adicione observações sobre esta localização..."
                                className="form-textarea"
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <Button variant="ghost" onClick={() => setShowLocationModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleLocationUpdate} disabled={updating}>
                                {updating ? <LoadingSpinner size="sm" /> : 'Atualizar'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    )
}
