import './LoadingSpinner.css'

export default function LoadingSpinner({ size = 'md', className = '' }) {
    return (
        <div className={`spinner spinner-${size} ${className}`}>
            <div className="spinner-circle"></div>
        </div>
    )
}
