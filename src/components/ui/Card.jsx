import './Card.css'

export default function Card({ children, className = '', ...props }) {
    return (
        <div className={`card ${className}`} {...props}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`card-header ${className}`}>
            {children}
        </div>
    )
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`card-body ${className}`}>
            {children}
        </div>
    )
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`card-footer ${className}`}>
            {children}
        </div>
    )
}
