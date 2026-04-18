import { useEffect, useMemo, useState } from 'react'
import { acceptOrder, deliverOrder, getOrders } from '../api/ordersApi'
import { getAllUsers, getCompletedOrdersBySeller } from '../api/wholesalerApi'
import PharmacyShell from '../components/layout/PharmacyShell'

const metricClassMap = {
  primary: 'orders-metric-card primary',
  secondary: 'orders-metric-card secondary',
  hero: 'orders-metric-card hero',
}

const tabToStatus = {
  pending: 'pending',
  accepted: 'accepted',
  delivered: 'delivered',
}

function normalizeOrderStatus(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'accepted' || normalized === 'delivered') {
    return normalized
  }

  return 'pending'
}

function toDisplayDate(dateValue) {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMedicineName(order) {
  return (
    order?.medicine?.name ||
    order?.medicineId?.name ||
    order?.medicineName ||
    order?.medicineId ||
    'Unknown medicine'
  )
}

function getSellerLabel(order) {
  return (
    order?.seller?.name ||
    order?.sellerId?.name ||
    order?.sellerName ||
    order?.sellerId ||
    'Seller account'
  )
}

function WholesalerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyOrderId, setBusyOrderId] = useState('')
  const [users, setUsers] = useState([])
  const [completedData, setCompletedData] = useState({
    totalDeliveredOrders: 0,
    totalSellers: 0,
    sellerWiseSales: [],
  })

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true)
        setError('')
        const [ordersResponse, usersResponse, completedResponse] = await Promise.all([
          getOrders(),
          getAllUsers(),
          getCompletedOrdersBySeller(),
        ])

        setOrders(ordersResponse)
        setUsers(usersResponse)
        setCompletedData(completedResponse)
      } catch (requestError) {
        setError(requestError.message || 'Failed to load wholesaler dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    const expectedStatus = tabToStatus[activeTab]
    return orders.filter((order) => normalizeOrderStatus(order.status) === expectedStatus)
  }, [orders, activeTab])

  const metrics = useMemo(() => {
    const pendingCount = orders.filter((order) => normalizeOrderStatus(order.status) === 'pending').length
    const acceptedCount = orders.filter((order) => normalizeOrderStatus(order.status) === 'accepted').length
    const deliveredCount = orders.filter((order) => normalizeOrderStatus(order.status) === 'delivered').length

    return [
      {
        title: 'Pending Clearance',
        value: String(pendingCount),
        subtitle: 'Orders requiring authorization',
        icon: 'pending_actions',
        accent: 'primary',
      },
      {
        title: 'Accepted Today',
        value: String(acceptedCount),
        subtitle: 'Currently in fulfillment',
        icon: 'task_alt',
        accent: 'secondary',
      },
      {
        title: 'Delivered Orders',
        value: String(deliveredCount),
        subtitle: 'Completed restock cycles',
        icon: 'local_shipping',
        accent: 'hero',
      },
    ]
  }, [orders])

  const onAcceptOrder = async (orderId) => {
    try {
      setActionError('')
      setBusyOrderId(orderId)
      await acceptOrder(orderId)

      setOrders((previous) =>
        previous.map((order) => {
          if ((order._id || order.id) !== orderId) {
            return order
          }

          return {
            ...order,
            status: 'accepted',
          }
        })
      )
    } catch (requestError) {
      setActionError(requestError.message || 'Failed to accept order')
    } finally {
      setBusyOrderId('')
    }
  }

  const onDeliverOrder = async (orderId) => {
    try {
      setActionError('')
      setBusyOrderId(orderId)
      await deliverOrder(orderId)

      setOrders((previous) =>
        previous.map((order) => {
          if ((order._id || order.id) !== orderId) {
            return order
          }

          return {
            ...order,
            status: 'delivered',
          }
        })
      )
    } catch (requestError) {
      setActionError(requestError.message || 'Failed to deliver order')
    } finally {
      setBusyOrderId('')
    }
  }

  return (
    <PharmacyShell
      title="Wholesaler Order Hub"
      subtitle="Manage incoming procurement requests from regional pharmacies."
      searchPlaceholder="Search orders, lots..."
      headerActions={
        <button type="button" className="secondary-button">
          <span className="material-symbols-outlined">download</span>
          Export Manifest
        </button>
      }
    >
      <section className="orders-metrics-grid" aria-label="Order metrics">
        {metrics.map((metric) => (
          <article key={metric.title} className={metricClassMap[metric.accent]}>
            <header>
              <h3>{metric.title}</h3>
              <span className="material-symbols-outlined">{metric.icon}</span>
            </header>
            <p className="orders-metric-value">{metric.value}</p>
            <p className="orders-metric-subtitle">{metric.subtitle}</p>
          </article>
        ))}
      </section>

      <nav className="orders-tabs" aria-label="Order tabs">
        <button
          type="button"
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders
        </button>
        <button
          type="button"
          className={activeTab === 'accepted' ? 'active' : ''}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted Processing
        </button>
        <button
          type="button"
          className={activeTab === 'delivered' ? 'active' : ''}
          onClick={() => setActiveTab('delivered')}
        >
          Delivered History
        </button>
      </nav>

      {isLoading ? <p className="page-feedback">Loading orders...</p> : null}
      {error ? <p className="page-feedback error">{error}</p> : null}
      {actionError ? <p className="page-feedback error">{actionError}</p> : null}

      <section className="orders-table-card">
        <div className="orders-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID / Date</th>
                <th>Pharmacist & Location</th>
                <th>Medicine Details</th>
                <th>Status / Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && !error && filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5}>No orders found for this status.</td>
                </tr>
              ) : null}

              {filteredOrders.map((order) => {
                const orderId = order._id || order.id
                const status = normalizeOrderStatus(order.status)
                const isCritical = Number(order.quantity) >= 100

                return (
                <tr key={orderId}>
                  <td>
                    <strong>{orderId}</strong>
                    <small>{toDisplayDate(order.createdAt)}</small>
                  </td>
                  <td>
                    <div className="orders-user-cell">
                      <span className="orders-avatar">{String(getSellerLabel(order)).slice(0, 2).toUpperCase()}</span>
                      <div>
                        <strong>{getSellerLabel(order)}</strong>
                        <small>
                          <span className="material-symbols-outlined">location_on</span>
                          Seller Location
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{getMedicineName(order)}</strong>
                    <small>
                      Qty: {order.quantity} &nbsp; Lot: {order.lot || 'N/A'}
                    </small>
                  </td>
                  <td>
                    <span className={isCritical ? 'priority-pill critical' : 'priority-pill standard'}>
                      {isCritical ? 'Critical' : 'Standard'}
                    </span>
                    <small>{status}</small>
                  </td>
                  <td>
                    <div className="row-actions visible">
                      <button type="button" aria-label="View order">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      {status === 'pending' ? (
                        <button
                          type="button"
                          className="orders-accept-btn"
                          onClick={() => onAcceptOrder(orderId)}
                          disabled={busyOrderId === orderId}
                        >
                          {busyOrderId === orderId ? 'Accepting...' : 'Accept'}
                        </button>
                      ) : null}
                      {status === 'accepted' ? (
                        <button
                          type="button"
                          className="orders-accept-btn"
                          onClick={() => onDeliverOrder(orderId)}
                          disabled={busyOrderId === orderId}
                        >
                          {busyOrderId === orderId ? 'Delivering...' : 'Deliver'}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="orders-table-card" style={{ marginTop: '16px' }}>
        <div className="inventory-table-head">
          <h3>All Users</h3>
        </div>
        <div className="orders-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={4}>No users found.</td>
                </tr>
              ) : null}

              {users.map((user) => (
                <tr key={user._id || user.id || user.email}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{toDisplayDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="orders-table-card" style={{ marginTop: '16px' }}>
        <div className="inventory-table-head">
          <h3>Completed Orders (Delivered)</h3>
        </div>
        <div className="orders-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Total Delivered Orders</th>
                <th>Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && completedData.sellerWiseSales.length === 0 ? (
                <tr>
                  <td colSpan={3}>No completed orders found.</td>
                </tr>
              ) : null}

              {completedData.sellerWiseSales.map((item) => (
                <tr key={item.seller.id || item.seller.email}>
                  <td>
                    <strong>{item.seller.name}</strong>
                    <small>{item.seller.email}</small>
                  </td>
                  <td>{item.totalDeliveredOrders}</td>
                  <td>{item.totalDeliveredQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inventory-table-footer">
          <p>
            Total completed orders: {completedData.totalDeliveredOrders} | Sellers covered: {completedData.totalSellers}
          </p>
        </div>
      </section>

      <div className="orders-load-more">
        <button type="button" disabled>
          Synced with Backend
          <span className="material-symbols-outlined">check_circle</span>
        </button>
      </div>
    </PharmacyShell>
  )
}

export default WholesalerOrdersPage
