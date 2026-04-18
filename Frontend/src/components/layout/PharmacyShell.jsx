import Sidebar from './Sidebar'
import Topbar from './Topbar'

function PharmacyShell({
  title,
  subtitle,
  children,
  headerActions,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}) {
  return (
    <div className="dashboard-app">
      <Sidebar />

      <div className="dashboard-shell">
        <Topbar
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />

        <main className="dashboard-main">
          <section className="dashboard-header">
            <div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            {headerActions ? <div className="header-actions">{headerActions}</div> : null}
          </section>

          {children}
        </main>
      </div>
    </div>
  )
}

export default PharmacyShell
