import { NavLink } from 'react-router-dom'

function AuthLayout({ title, subtitle, children, switchText, switchLinkText, switchTo }) {
  return (
    <div className="auth-app">
      <header className="auth-navbar">
        <div className="auth-navbar-inner">
          <div className="auth-brand">
            <span className="material-symbols-outlined fill-icon">medical_services</span>
            <div>
              <strong>The Clinical Curator</strong>
              <small>Pharmacy Logistics</small>
            </div>
          </div>

          <div className="auth-switcher">
            <NavLink to="/login" className={({ isActive }) => `auth-pill${isActive ? ' active' : ''}`}>
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `auth-pill${isActive ? ' active' : ''}`}
            >
              Register
            </NavLink>
          </div>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-card-wrap">
          <aside className="auth-brand-panel">
            <h1>The Clinical Curator</h1>
            <p>Pharmacy logistics and regulatory operations.</p>

            <ul>
              <li>Real-time expiry tracking and predictive alerts</li>
              <li>Automated stock-level driven replenishment</li>
              <li>Secure pharmacist-wholesaler coordination</li>
            </ul>
          </aside>

          <section className="auth-form-panel">
            <header className="auth-form-head">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </header>

            {children}

            <p className="auth-switch-line">
              {switchText} <NavLink to={switchTo}>{switchLinkText}</NavLink>
            </p>
          </section>
        </section>
      </main>
    </div>
  )
}

export default AuthLayout
