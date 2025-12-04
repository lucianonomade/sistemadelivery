import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../services/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardBody } from '../../components/ui/Card'
import './Login.css'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { data, error: signInError } = await auth.signIn(email, password)

        if (signInError) {
            setError('Email ou senha inválidos')
            setLoading(false)
            return
        }

        if (data.user) {
            navigate('/admin/dashboard')
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <img src="/polimix-logo.png" alt="Polimix" className="logo-image" />
                    </div>
                    <p className="login-subtitle">Painel Administrativo</p>
                </div>

                <Card>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="login-form">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                            />

                            <Input
                                label="Senha"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />

                            {error && (
                                <div className="login-error">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={loading}
                                className="login-button"
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
