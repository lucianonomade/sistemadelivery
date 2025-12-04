import './Input.css'

export default function Input({
    label,
    error,
    type = 'text',
    id,
    className = '',
    ...props
}) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={`input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    )
}
