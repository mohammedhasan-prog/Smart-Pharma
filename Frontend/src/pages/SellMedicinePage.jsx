import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { getMedicines } from '../api/medicineApi'
import { sellMedicine } from '../api/salesApi'
import PharmacyShell from '../components/layout/PharmacyShell'

function SellMedicinePage() {
  const [medicines, setMedicines] = useState([])
  const [selectedMedicineId, setSelectedMedicineId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastReceipt, setLastReceipt] = useState(null)

  const downloadReceiptPdf = ({
    medicineName,
    medicineSalt,
    quantitySold,
    unitPrice,
    totalAmount,
    soldAt,
    saleRef,
  }) => {
    const doc = new jsPDF()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Smart Pharmacy - Sale Receipt', 14, 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Sale Reference: ${saleRef}`, 14, 30)
    doc.text(`Date: ${new Date(soldAt).toLocaleString()}`, 14, 38)
    doc.text('Seller: Clinical Curator', 14, 46)

    doc.setFont('helvetica', 'bold')
    doc.text('Medicine Details', 14, 58)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${medicineName}`, 14, 66)
    doc.text(`Salt/Composition: ${medicineSalt}`, 14, 74)
    doc.text(`Quantity Sold: ${quantitySold}`, 14, 82)
    doc.text(`Unit Price: $${unitPrice.toFixed(2)}`, 14, 90)

    doc.setFont('helvetica', 'bold')
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, 102)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('This receipt is system-generated after a successful sale.', 14, 116)

    const safeFileRef = String(saleRef).replace(/[^a-zA-Z0-9-_]/g, '')
    doc.save(`sale-receipt-${safeFileRef}.pdf`)
  }

  const loadMedicines = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getMedicines()
      setMedicines(response)

      if (!selectedMedicineId && response.length > 0) {
        setSelectedMedicineId(response[0]._id || response[0].id)
      }
    } catch (requestError) {
      setError(requestError.message || 'Failed to load medicines')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedicines()
  }, [])

  const selectedMedicine = useMemo(
    () => medicines.find((medicine) => (medicine._id || medicine.id) === selectedMedicineId),
    [medicines, selectedMedicineId]
  )

  const handleSell = async () => {
    if (!selectedMedicineId) {
      setError('Please select a medicine first')
      return
    }

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')
      const response = await sellMedicine({
        medicineId: selectedMedicineId,
        quantity: qty,
      })

      setMessage(response.message || 'Medicine sold successfully')

      const currentMedicineName = selectedMedicine?.name || 'Medicine'
      const currentMedicineSalt = selectedMedicine?.salt || 'N/A'
      const unitPrice = 0.5
      const totalAmount = Number(qty) * unitPrice
      const receipt = {
        medicineName: currentMedicineName,
        medicineSalt: currentMedicineSalt,
        quantitySold: Number(qty),
        unitPrice,
        totalAmount,
        soldAt: new Date().toISOString(),
        saleRef: response?.order?._id || response?.medicine?._id || `${Date.now()}`,
      }

      setLastReceipt(receipt)
      downloadReceiptPdf(receipt)

      await loadMedicines()
    } catch (requestError) {
      setError(requestError.message || 'Failed to process sale')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuantityInput = (event) => {
    const nextValue = event.target.value

    if (nextValue === '') {
      setQuantity('')
      return
    }

    if (/^\d+$/.test(nextValue)) {
      setQuantity(Number(nextValue))
    }
  }

  const subtotal = ((Number(quantity) || 0) * 0.5).toFixed(2)

  return (
    <PharmacyShell
      title="Point of Sale"
      subtitle="Dispense medicines and trigger smart reorder when stock falls below threshold."
      searchPlaceholder="Search medicine by name or salt..."
    >
      <div className="pos-page">
      <main className="pos-main">
        <section className="pos-left-col">
          <div className="pos-search-row">
            <label className="pos-search" htmlFor="posSearch">
              <span className="material-symbols-outlined">search</span>
              <input
                id="posSearch"
                type="text"
                placeholder="Search medicine by name, NDC, or scan barcode..."
              />
            </label>
            <button type="button" className="pos-icon-btn" aria-label="Open scanner">
              <span className="material-symbols-outlined">barcode_scanner</span>
            </button>
          </div>

          <div className="pos-chip-grid">
            {medicines.map((medicine) => {
              const id = medicine._id || medicine.id
              const isActive = selectedMedicineId === id

              return (
              <article
                key={id}
                className="pos-chip-card"
                style={isActive ? { borderColor: 'var(--primary)', boxShadow: 'inset 0 0 0 1px var(--primary)' } : {}}
                onClick={() => setSelectedMedicineId(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedMedicineId(id)
                  }
                }}
              >
                <strong>{medicine.name}</strong>
                <small>Salt: {medicine.salt}</small>
                <span>Stock: {medicine.stock}</span>
              </article>
              )
            })}

            {!isLoading && medicines.length === 0 ? (
              <article className="pos-chip-card">
                <strong>No active medicines</strong>
                <small>Add or approve medicines first</small>
              </article>
            ) : null}
          </div>

          <section className="pos-cart-card">
            <header>
              <h2>Current Prescription</h2>
              <button type="button">Clear All</button>
            </header>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedMedicine ? (
                  <tr key={selectedMedicine._id || selectedMedicine.id}>
                    <td>
                      <strong>{selectedMedicine.name}</strong>
                      <small>{selectedMedicine.salt}</small>
                      <span>{selectedMedicine.approvalStatus === 'active' ? `Stock: ${selectedMedicine.stock}` : 'Pending wholesaler approval'}</span>
                    </td>
                    <td>
                      <div className="qty-controls">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity((previous) => Math.max(1, Number(previous) - 1))}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantity}
                          onChange={handleQuantityInput}
                          onBlur={() => {
                            if (!quantity || Number(quantity) <= 0) {
                              setQuantity(1)
                            }
                          }}
                          aria-label="Sell quantity"
                        />
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity((previous) => Number(previous) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>$0.50</td>
                    <td>${subtotal}</td>
                    <td>
                      <button type="button" className="delete-row" aria-label="Delete row">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td>No item selected</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </section>

        <aside className="pos-right-col">
          <section className="pos-side-card">
            <header>
              <h3>Patient Details</h3>
              <button type="button">Assign</button>
            </header>
            <label className="pos-search small" htmlFor="patientSearch">
              <span className="material-symbols-outlined">person_search</span>
              <input id="patientSearch" type="text" placeholder="Search patient ID or name" />
            </label>
            <article className="patient-card">
              <span>JD</span>
              <div>
                <strong>John Doe</strong>
                <small>DOB: 11/04/1982</small>
                <small>Ins: BlueCross PPO</small>
              </div>
            </article>
          </section>

          <section className="pos-side-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>${subtotal}</strong>
            </div>
            <div className="summary-row">
              <span>Insurance Coverage</span>
              <strong className="coverage">-$0.00</strong>
            </div>
            <div className="summary-row">
              <span>Tax (0%)</span>
              <strong>$0.00</strong>
            </div>

            <div className="total-due">
              <span>Total Due</span>
              <strong>${subtotal}</strong>
            </div>

            {error ? <p className="page-feedback error">{error}</p> : null}
            {message ? <p className="page-feedback">{message}</p> : null}
            {isLoading ? <p className="page-feedback">Loading medicines...</p> : null}

            <button type="button" className="pos-primary-btn" onClick={handleSell} disabled={isSubmitting || isLoading}>
              <span className="material-symbols-outlined fill-icon">point_of_sale</span>
              {isSubmitting ? 'Processing...' : 'Process Sale'}
            </button>

            <div className="pos-secondary-actions">
              <button type="button">Save as Draft</button>
              <button
                type="button"
                onClick={() => {
                  if (lastReceipt) {
                    downloadReceiptPdf(lastReceipt)
                  }
                }}
                disabled={!lastReceipt}
              >
                Download Receipt
              </button>
            </div>
          </section>
        </aside>
      </main>
      </div>
    </PharmacyShell>
  )
}

export default SellMedicinePage
