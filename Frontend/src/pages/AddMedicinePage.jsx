import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createMedicine } from '../api/medicineApi'
import PharmacyShell from '../components/layout/PharmacyShell'

const medicineSchema = z.object({
  medicineName: z.string().trim().min(2, 'Medicine name is required'),
  saltComposition: z.string().trim().min(2, 'Salt / composition is required'),
  currentStock: z.coerce
    .number({ message: 'Current stock is required' })
    .int('Current stock must be a whole number')
    .min(0, 'Current stock cannot be negative'),
  reorderLevel: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return 20
      }

      return value
    },
    z.coerce
      .number({ message: 'Reorder level must be a valid number' })
      .int('Reorder level must be a whole number')
      .min(0, 'Reorder level cannot be negative')
  ),
  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Please enter a valid expiry date'),
  supplierEmail: z.string().trim().email('Enter a valid supplier email address'),
})

function AddMedicinePage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    medicineName: '',
    saltComposition: '',
    currentStock: '',
    reorderLevel: '20',
    expiryDate: '',
    supplierEmail: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setErrors((previous) => {
      if (!previous[name]) {
        return previous
      }

      return {
        ...previous,
        [name]: '',
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const parseResult = medicineSchema.safeParse(formData)

    if (!parseResult.success) {
      const fieldErrors = {}

      parseResult.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      })

      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const payload = {
        name: parseResult.data.medicineName,
        salt: parseResult.data.saltComposition,
        stock: parseResult.data.currentStock,
        reorderLevel: parseResult.data.reorderLevel,
        expiryDate: parseResult.data.expiryDate,
        supplierEmail: parseResult.data.supplierEmail,
      }

      await createMedicine(payload)
      navigate('/inventory')
    } catch (error) {
      setSubmitError(error.message || 'Failed to save medicine')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PharmacyShell
      title="Order New Medicine"
      subtitle="Enter the details to register a new pharmaceutical product into the inventory system."
      searchPlaceholder="Search inventory..."
      headerActions={
        <button type="button" className="secondary-button" onClick={() => navigate('/inventory')}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Inventory
        </button>
      }
    >
      <section className="add-medicine-card">
        <div className="add-medicine-accent" aria-hidden="true" />

        <form className="add-medicine-form" onSubmit={handleSubmit}>
          <div className="add-medicine-grid two-col">
            <label className="field-group" htmlFor="medicineName">
              <span>Medicine Name</span>
              <input
                id="medicineName"
                name="medicineName"
                type="text"
                placeholder="e.g. Amoxicillin 500mg"
                value={formData.medicineName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.medicineName)}
                className={errors.medicineName ? 'input-error' : ''}
              />
              {errors.medicineName ? <small className="field-error">{errors.medicineName}</small> : null}
            </label>

            <label className="field-group" htmlFor="saltComposition">
              <span>Salt / Composition</span>
              <input
                id="saltComposition"
                name="saltComposition"
                type="text"
                placeholder="e.g. Amoxicillin Trihydrate"
                value={formData.saltComposition}
                onChange={handleChange}
                aria-invalid={Boolean(errors.saltComposition)}
                className={errors.saltComposition ? 'input-error' : ''}
              />
              {errors.saltComposition ? <small className="field-error">{errors.saltComposition}</small> : null}
            </label>
          </div>

          <hr />

          <div className="add-medicine-grid three-col">
            <label className="field-group" htmlFor="currentStock">
              <span>Current Stock</span>
              <input
                id="currentStock"
                name="currentStock"
                type="number"
                min="0"
                placeholder="0"
                value={formData.currentStock}
                onChange={handleChange}
                aria-invalid={Boolean(errors.currentStock)}
                className={errors.currentStock ? 'input-error' : ''}
              />
              {errors.currentStock ? <small className="field-error">{errors.currentStock}</small> : null}
            </label>

            <label className="field-group" htmlFor="reorderLevel">
              <span>Reorder Level</span>
              <input
                id="reorderLevel"
                name="reorderLevel"
                type="number"
                min="0"
                placeholder="Threshold for alerts"
                value={formData.reorderLevel}
                onChange={handleChange}
                aria-invalid={Boolean(errors.reorderLevel)}
                className={errors.reorderLevel ? 'input-error' : ''}
              />
              {errors.reorderLevel ? <small className="field-error">{errors.reorderLevel}</small> : null}
            </label>

            <label className="field-group" htmlFor="expiryDate">
              <span>Expiry Date</span>
              <div className={`date-field-shell${errors.expiryDate ? ' field-shell-error' : ''}`}>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.expiryDate)}
                />
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              {errors.expiryDate ? <small className="field-error">{errors.expiryDate}</small> : null}
            </label>
          </div>

          <hr />

          <div className="add-medicine-grid two-col">
            <label className="field-group" htmlFor="supplierEmail">
              <span>Supplier Email</span>
              <div className={`input-icon-shell${errors.supplierEmail ? ' field-shell-error' : ''}`}>
                <span className="material-symbols-outlined">mail</span>
                <input
                  id="supplierEmail"
                  name="supplierEmail"
                  type="email"
                  placeholder="contact@supplier.com"
                  value={formData.supplierEmail}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.supplierEmail)}
                />
              </div>
              {errors.supplierEmail ? <small className="field-error">{errors.supplierEmail}</small> : null}
            </label>
          </div>

          {submitError ? <p className="page-feedback error">{submitError}</p> : null}

          <div className="add-medicine-actions">
            <button type="button" className="secondary-button" onClick={() => navigate('/inventory')}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              <span className="material-symbols-outlined fill-icon">save</span>
              {isSubmitting ? 'Saving...' : 'Save Medicine'}
            </button>
          </div>
        </form>
      </section>
    </PharmacyShell>
  )
}

export default AddMedicinePage
