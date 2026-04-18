import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMedicines } from '../api/medicineApi'
import PharmacyShell from '../components/layout/PharmacyShell'

const expiryClassMap = {
  safe: 'status-pill safe',
  warning: 'status-pill warning',
  critical: 'status-pill critical',
}

const statClassMap = {
  primary: 'inventory-stat-card primary',
  error: 'inventory-stat-card error',
  tertiary: 'inventory-stat-card tertiary',
}

function getExpiryStatus(expiryDate) {
  const today = new Date()
  const target = new Date(expiryDate)
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (Number.isNaN(diffDays) || diffDays > 90) {
    return 'safe'
  }

  if (diffDays < 30) {
    return 'critical'
  }

  return 'warning'
}

function formatDisplayDate(dateValue) {
  const parsed = new Date(dateValue)

  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function normalizeSearchValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
}

function InventoryPage() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        setIsLoading(true)
        setError('')
        const result = await getMedicines()
        setMedicines(result)
      } catch (requestError) {
        setError(requestError.message || 'Failed to load inventory data')
      } finally {
        setIsLoading(false)
      }
    }

    loadMedicines()
  }, [])

  const inventoryStats = useMemo(() => {
    const totalStock = medicines.reduce((sum, item) => sum + (Number(item.stock) || 0), 0)
    const lowStockCount = medicines.filter((item) => Number(item.stock) < Number(item.reorderLevel)).length
    const expiringSoonCount = medicines.filter((item) => {
      const status = getExpiryStatus(item.expiryDate)
      return status === 'warning' || status === 'critical'
    }).length

    return [
      {
        title: 'Total Medicines',
        value: medicines.length,
        subtitle: `${totalStock} units available`,
        icon: 'inventory_2',
        accent: 'primary',
      },
      {
        title: 'Low Stock Alerts',
        value: lowStockCount,
        subtitle: 'Below reorder level',
        icon: 'warning',
        accent: 'error',
      },
      {
        title: 'Expiring Soon',
        value: expiringSoonCount,
        subtitle: 'Within next 90 days',
        icon: 'event_busy',
        accent: 'tertiary',
      },
    ]
  }, [medicines])

  const filteredMedicines = useMemo(() => {
    const query = normalizeSearchValue(searchQuery.trim())

    if (!query) {
      return medicines
    }

    return medicines.filter((item) => {
      const name = normalizeSearchValue(item.name)
      const salt = normalizeSearchValue(item.salt || item.saltComposition)
      return name.includes(query) || salt.includes(query)
    })
  }, [medicines, searchQuery])

  return (
    <PharmacyShell
      title="Inventory Management"
      subtitle="Manage and monitor your pharmacy's medical stock levels."
      searchPlaceholder="Search medicine by name or salt composition..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      headerActions={
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate('/add-medicine')}
        >
          <span className="material-symbols-outlined fill-icon">add</span>
          Add New Medicine
        </button>
      }
    >
      <section className="inventory-stats-grid" aria-label="Inventory statistics">
        {inventoryStats.map((stat) => (
          <article key={stat.title} className={statClassMap[stat.accent]}>
            <div className="inventory-stat-head">
              <h3>{stat.title}</h3>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <p className="inventory-stat-value">{stat.value}</p>
            <p className="inventory-stat-subtitle">{stat.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="inventory-table-card">
        <header className="inventory-table-head">
          <h3>Active Directory</h3>
          <div className="inventory-table-actions">
            <button type="button">
              <span className="material-symbols-outlined">filter_list</span>
              Filter
            </button>
            <button type="button">
              <span className="material-symbols-outlined">download</span>
              Export
            </button>
          </div>
        </header>

        <div className="inventory-table-wrap">
          {isLoading ? <p className="page-feedback">Loading medicines...</p> : null}
          {error ? <p className="page-feedback error">{error}</p> : null}

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Salt / Composition</th>
                <th>Stock Qty</th>
                <th>Reorder Lvl</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && !error && filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6}>No medicines match your search.</td>
                </tr>
              ) : null}

              {filteredMedicines.map((item) => {
                const expiryStatus = getExpiryStatus(item.expiryDate)

                return (
                <tr key={item._id || item.id || item.name}>
                  <td>
                    <strong>{item.name}</strong>
                    <small>{item.supplierEmail || 'No supplier email'}</small>
                  </td>
                  <td>{item.salt}</td>
                  <td className={Number(item.stock) < Number(item.reorderLevel) ? 'low-stock' : ''}>{item.stock}</td>
                  <td>{item.reorderLevel}</td>
                  <td>
                    <span className={expiryClassMap[expiryStatus]}>{formatDisplayDate(item.expiryDate)}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" aria-label="Edit row">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button type="button" aria-label="Delete row" className="danger">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <footer className="inventory-table-footer">
          <p>
            Showing {filteredMedicines.length} of {medicines.length} entries
          </p>
          <div className="pager">
            <button type="button" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button type="button" className="active">
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <span>...</span>
            <button type="button">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </footer>
      </section>
    </PharmacyShell>
  )
}

export default InventoryPage
