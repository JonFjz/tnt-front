import { Link } from 'react-router-dom'

export default function GlassButton({ to, icon: Icon, title, subtitle }) {
  return (
    <Link to={to} className="glass btn-card">
      <div className="icon"><Icon size={22} /></div>
      <div className="label">
        <div className="btn-title">{title}</div>
        <div className="btn-sub">{subtitle}</div>
      </div>
    </Link>
  )
}
