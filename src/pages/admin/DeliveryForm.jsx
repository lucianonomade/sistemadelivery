import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { db } from '../../services/supabase'
import { createDelivery } from '../../services/deliveryService'
import { geocodeAddress } from '../../services/mapbox'
import './DeliveryForm.css'

export default function DeliveryForm() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState([])
    const [showNewCustomer, setShowNewCustomer] = useState(false)

    const [formData, setFormData] = useState({
        customer_id: '',
        cement_type: '',
        quantity: '',
        origin_address: '',
        destination_address: '',
        destination_lat: null,
        destination_lng: null,
        driver_name: '',
        driver_phone: '',
        vehicle_plate: '',
        notes: ''
    })

    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    })

    const [errors, setErrors] = useState({})
    const [geocoding, setGeocoding] = useState(false)

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        const { data } = await db.getCustomers()
        if (data) {
            setCustomers(data)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleNewCustomerChange = (e) => {
        const { name, value } = e.target
        setNewCustomer(prev => ({ ...prev, [name]: value }))
    }

    const handleCreateCustomer = async () => {
        if (!newCustomer.name) {
            alert('Nome do cliente é obrigatório')
            return
        }

        const { data, error } = await db.createCustomer(newCustomer)

        if (error) {
            alert('Erro ao criar cliente: ' + error.message)
            return
        }

        if (data) {
            setCustomers(prev => [...prev, data])
            setFormData(prev => ({ ...prev, customer_id: data.id }))
            setNewCustomer({ name: '', phone: '', email: '', address: '' })
            setShowNewCustomer(false)
            alert('Cliente criado com sucesso!')
        }
    }

    const handleGeocodeAddress = async () => {
        if (!formData.destination_address) {
            alert('Digite o endereço de destino primeiro')
            return
        }

        setGeocoding(true)
        const result = await geocodeAddress(formData.destination_address)
        setGeocoding(false)

        if (result.success) {
            setFormData(prev => ({
                ...prev,
                destination_lat: result.lat,
                destination_lng: result.lng,
                destination_address: result.fullAddress
            }))
            alert('Endereço geocodificado com sucesso!')
        } else {
            alert('Erro ao geocodificar endereço: ' + result.error)
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.customer_id) newErrors.customer_id = 'Selecione um cliente'
        if (!formData.cement_type) newErrors.cement_type = 'Tipo de cimento é obrigatório'
        if (!formData.quantity) newErrors.quantity = 'Quantidade é obrigatória'
        if (!formData.destination_address) newErrors.destination_address = 'Endereço de destino é obrigatório'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios')
            return
        }

        setLoading(true)

        const result = await createDelivery(formData)

        if (result.success) {
            alert('Entrega criada com sucesso!')
            navigate('/admin/entregas')
        } else {
            alert('Erro ao criar entrega: ' + result.error)
            setLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="delivery-form-page">
                <div className="form-header">
                    <h1>Nova Entrega</h1>
                    <Button variant="ghost" onClick={() => navigate('/admin/entregas')}>
                        Cancelar
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <h2>Informações do Cliente</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Cliente *</label>
                                    <div className="customer-select-group">
                                        <select
                                            name="customer_id"
                                            value={formData.customer_id}
                                            onChange={handleInputChange}
                                            className={`form-select ${errors.customer_id ? 'error' : ''}`}
                                            disabled={showNewCustomer}
                                        >
                                            <option value="">Selecione um cliente</option>
                                            {customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            variant={showNewCustomer ? 'danger' : 'outline'}
                                            onClick={() => setShowNewCustomer(!showNewCustomer)}
                                        >
                                            {showNewCustomer ? 'Cancelar' : '+ Novo Cliente'}
                                        </Button>
                                    </div>
                                    {errors.customer_id && <span className="error-text">{errors.customer_id}</span>}
                                </div>

                                {showNewCustomer && (
                                    <div className="new-customer-form">
                                        <h3>Novo Cliente</h3>
                                        <div className="form-grid">
                                            <Input
                                                label="Nome *"
                                                name="name"
                                                value={newCustomer.name}
                                                onChange={handleNewCustomerChange}
                                                placeholder="Nome do cliente"
                                            />
                                            <Input
                                                label="Telefone"
                                                name="phone"
                                                value={newCustomer.phone}
                                                onChange={handleNewCustomerChange}
                                                placeholder="(00) 00000-0000"
                                            />
                                            <Input
                                                label="Email"
                                                type="email"
                                                name="email"
                                                value={newCustomer.email}
                                                onChange={handleNewCustomerChange}
                                                placeholder="email@exemplo.com"
                                            />
                                            <Input
                                                label="Endereço"
                                                name="address"
                                                value={newCustomer.address}
                                                onChange={handleNewCustomerChange}
                                                placeholder="Endereço completo"
                                            />
                                        </div>
                                        <Button type="button" variant="success" onClick={handleCreateCustomer}>
                                            Criar Cliente
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2>Informações da Carga</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="form-grid">
                                <Input
                                    label="Tipo de Cimento *"
                                    name="cement_type"
                                    value={formData.cement_type}
                                    onChange={handleInputChange}
                                    placeholder="Ex: CP-II, CP-III, CP-IV"
                                    error={errors.cement_type}
                                />
                                <Input
                                    label="Quantidade *"
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    placeholder="Ex: 10 toneladas ou 200 sacos"
                                    error={errors.quantity}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2>Endereços</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="form-grid">
                                <Input
                                    label="Endereço de Origem"
                                    name="origin_address"
                                    value={formData.origin_address}
                                    onChange={handleInputChange}
                                    placeholder="Endereço de coleta"
                                    className="full-width"
                                />

                                <div className="full-width">
                                    <label className="form-label">Endereço de Destino *</label>
                                    <div className="address-input-group">
                                        <input
                                            type="text"
                                            name="destination_address"
                                            value={formData.destination_address}
                                            onChange={handleInputChange}
                                            placeholder="Endereço de entrega"
                                            className={`form-input ${errors.destination_address ? 'error' : ''}`}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleGeocodeAddress}
                                            disabled={geocoding || !formData.destination_address}
                                        >
                                            {geocoding ? <LoadingSpinner size="sm" /> : '📍 Geocodificar'}
                                        </Button>
                                    </div>
                                    {errors.destination_address && <span className="error-text">{errors.destination_address}</span>}
                                    {formData.destination_lat && formData.destination_lng && (
                                        <p className="success-text">
                                            ✓ Coordenadas: {formData.destination_lat.toFixed(6)}, {formData.destination_lng.toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2>Informações do Motorista</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="form-grid">
                                <Input
                                    label="Nome do Motorista"
                                    name="driver_name"
                                    value={formData.driver_name}
                                    onChange={handleInputChange}
                                    placeholder="Nome completo"
                                />
                                <Input
                                    label="Telefone do Motorista"
                                    name="driver_phone"
                                    value={formData.driver_phone}
                                    onChange={handleInputChange}
                                    placeholder="(00) 00000-0000"
                                />
                                <Input
                                    label="Placa do Veículo"
                                    name="vehicle_plate"
                                    value={formData.vehicle_plate}
                                    onChange={handleInputChange}
                                    placeholder="ABC-1234"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2>Observações</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="form-group full-width">
                                <label className="form-label">Notas Adicionais</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Informações adicionais sobre a entrega..."
                                    className="form-textarea"
                                    rows="4"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => navigate('/admin/entregas')}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? <LoadingSpinner size="sm" /> : 'Criar Entrega'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
