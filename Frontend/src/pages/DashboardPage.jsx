import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMedicines } from '../api/medicineApi'
import PharmacyShell from '../components/layout/PharmacyShell'

function normalizeSearchValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
}

function getDaysToExpiry(dateValue) {
  const today = new Date()
  const expiry = new Date(dateValue)
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Number.isNaN(diff) ? Number.POSITIVE_INFINITY : diff
}

function formatShortDate(dateValue) {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  })
}

function DashboardPage() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        const result = await getMedicines()
        setMedicines(result)
      } catch (requestError) {
        setError(requestError.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredMedicines = useMemo(() => {
    const query = normalizeSearchValue(searchQuery.trim())

    if (!query) {
      return medicines
    }

    return medicines.filter((medicine) => {
      const name = normalizeSearchValue(medicine.name)
      const salt = normalizeSearchValue(medicine.salt || medicine.saltComposition)
      return name.includes(query) || salt.includes(query)
    })
  }, [medicines, searchQuery])

  const totalStock = useMemo(
    () => filteredMedicines.reduce((sum, medicine) => sum + (Number(medicine.stock) || 0), 0),
    [filteredMedicines]
  )

  const criticalAlerts = useMemo(
    () =>
      filteredMedicines
        .filter((medicine) => {
          const days = getDaysToExpiry(medicine.expiryDate)
          return days <= 30 || Number(medicine.stock) < Number(medicine.reorderLevel)
        })
        .slice(0, 3),
    [filteredMedicines]
  )

  const expiryWatch = useMemo(
    () =>
      filteredMedicines
        .filter((medicine) => getDaysToExpiry(medicine.expiryDate) <= 90)
        .sort((a, b) => getDaysToExpiry(a.expiryDate) - getDaysToExpiry(b.expiryDate))
        .slice(0, 4),
    [filteredMedicines]
  )

  const recentDispenses = useMemo(
    () =>
      filteredMedicines.slice(0, 4).map((medicine, index) => ({
        medicine: medicine.name,
        quantity: `${Math.max(5, Math.floor((Number(medicine.reorderLevel) || 10) / 2))} units`,
        time: `${index + 1}h ago`,
      })),
    [filteredMedicines]
  )

  return (
    <PharmacyShell
      title="Overview"
      subtitle="Real-time clinical inventory metrics."
      searchPlaceholder="Search medicine by name or salt composition..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      headerActions={
        <>
          <button type="button" className="secondary-button">
            Export Report
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/sell-medicine')}
          >
            <span className="material-symbols-outlined fill-icon">point_of_sale</span>
            Sell Medicine
          </button>
        </>
      }
    >
      {isLoading ? <p className="page-feedback">Loading dashboard data...</p> : null}
      {error ? <p className="page-feedback error">{error}</p> : null}

      <section className="overview-grid" aria-label="Summary cards">
        <article className="hero-stock-card">
          <div className="hero-icon" aria-hidden="true">
            <span className="material-symbols-outlined fill-icon">medication</span>
          </div>
          <p className="hero-label">
            <span className="material-symbols-outlined fill-icon">inventory</span>
            Total Active Stock
          </p>
          <p className="hero-total">
            {totalStock.toLocaleString()} <span>units</span>
          </p>
          <div className="hero-meta">
            <div>
              <p>Valuation</p>
              <strong>N/A</strong>
            </div>
            <div>
              <p>Categories</p>
              <strong>{filteredMedicines.length}</strong>
            </div>
          </div>
        </article>

        <article className="critical-card">
          <header>
            <h3>Critical Alerts</h3>
            <span className="material-symbols-outlined fill-icon">warning</span>
          </header>

          <div className="critical-list">
            {criticalAlerts.map((item) => (
              <div key={item._id || item.id || item.name} className="critical-item">
                <div>
                  <p>{item.name}</p>
                  <small>
                    Exp: <strong>{formatShortDate(item.expiryDate)}</strong>
                  </small>
                </div>
                <span>{item.stock} left</span>
              </div>
            ))}

            {!isLoading && criticalAlerts.length === 0 ? (
              <div className="critical-item">
                <div>
                  <p>No critical alerts</p>
                  <small>All stock and expiry metrics are healthy</small>
                </div>
                <span>OK</span>
              </div>
            ) : null}
          </div>

          <button type="button" className="link-button">
            View All Alerts ({criticalAlerts.length})
          </button>
        </article>
      </section>

      <section className="data-grid" aria-label="Operational lists">
        <article className="panel-card expiry-panel">
          <header className="panel-header">
            <h3>
              <span className="material-symbols-outlined fill-icon">event_busy</span>
              90-Day Expiry Watch
            </h3>
            <button type="button" className="icon-button subtle" aria-label="More options">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </header>

          <div className="expiry-list">
            {expiryWatch.map((item) => {
              const days = getDaysToExpiry(item.expiryDate)

              return (
              <div key={item._id || item.id || item.name} className="expiry-item">
                <div className="expiry-main">
                  <div className="expiry-avatar">{item.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <p>{item.name}</p>
                    <small>{item.salt}</small>
                  </div>
                </div>
                <div className="expiry-meta">
                  <span>{days <= 0 ? 'Expired' : `${days} days`}</span>
                  <small>{item.stock} units</small>
                </div>
              </div>
              )
            })}

            {!isLoading && expiryWatch.length === 0 ? <p>No 90-day expiry risks found.</p> : null}
          </div>
        </article>

        <article className="panel-card sales-panel">
          <header className="panel-header">
            <h3>
              <span className="material-symbols-outlined fill-icon">receipt_long</span>
              Recent Dispenses
            </h3>
            <button type="button" className="icon-button subtle" aria-label="Filter rows">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </header>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Qty</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentDispenses.map((item) => (
                  <tr key={`${item.medicine}-${item.time}`}>
                    <td>{item.medicine}</td>
                    <td>{item.quantity}</td>
                    <td>{item.time}</td>
                  </tr>
                ))}

                {!isLoading && recentDispenses.length === 0 ? (
                  <tr>
                    <td>No records</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </PharmacyShell>
  )
}

export default DashboardPage
