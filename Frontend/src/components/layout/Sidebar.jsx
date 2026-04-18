import { NavLink, useNavigate } from 'react-router-dom'

const navClass = ({ isActive }) => `menu-item${isActive ? ' active' : ''}`

function Sidebar() {
  const navigate = useNavigate()
  const role = (localStorage.getItem('pharmacyUserRole') || '').toLowerCase()
  const isWholesaler = role === 'wholesaler'

  const navItems = isWholesaler
    ? [
        { label: 'Wholesaler Orders', icon: 'receipt_long', to: '/wholesaler-orders' },
      ]
    : [
        { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
        { label: 'Inventory', icon: 'inventory_2', to: '/inventory' },
        { label: 'Sell Medicine', icon: 'sell', to: '/sell-medicine' },
      ]

  const handleLogout = () => {
    localStorage.removeItem('pharmacyAuthToken')
    localStorage.removeItem('pharmacyUserRole')
    navigate('/login', { replace: true })
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-profile">
        <img
          src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80"
          alt="Lead pharmacist"
        />
        <div>
          <h1>Clinical Curator</h1>
          <p>{isWholesaler ? 'Wholesaler' : 'Lead Pharmacist'}</p>
        </div>
      </div>

      {isWholesaler ? null : (
        <NavLink to="/add-medicine" className="sidebar-primary-button">
          <span className="material-symbols-outlined fill-icon">add</span>
          Order Medicine
        </NavLink>
      )}

      <nav className="sidebar-menu" aria-label="Main">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} className={navClass}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom-links">
        <button type="button" className="menu-item auxiliary">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </button>
        <button type="button" className="menu-item auxiliary" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
