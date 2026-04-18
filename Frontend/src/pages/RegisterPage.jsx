import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authApi'
import AuthInput from '../components/auth/AuthInput'
import AuthLayout from '../components/auth/AuthLayout'

function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('pharmacist')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()

    setSubmitError('')
    setIsSubmitting(true)

    try {
      await registerUser({
        name: fullName,
        email,
        password,
        role: 'seller',
      })

      navigate('/login')
    } catch (error) {
      setSubmitError(error.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Enter your credentials to access the logistics dashboard."
      switchText="Already have an account?"
      switchLinkText="Sign in"
      switchTo="/login"
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="role-group">
          <p className="role-label">Select your role</p>
          <div className="role-grid">
            <button
              type="button"
              className={role === 'pharmacist' ? 'role-option active' : 'role-option'}
              onClick={() => setRole('pharmacist')}
            >
              <span className="material-symbols-outlined fill-icon">local_pharmacy</span>
              Pharmacist
            </button>
            <button
              type="button"
              className={role === 'wholesaler' ? 'role-option active' : 'role-option'}
              onClick={() => setRole('wholesaler')}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              Wholesaler
            </button>
          </div>
        </div>

        <AuthInput
          id="fullName"
          label="Full Name"
          icon="person"
          placeholder="Dr. Jane Doe"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />

        <AuthInput
          id="registerEmail"
          label="Corporate Email"
          type="email"
          icon="mail"
          placeholder="jane.doe@pharmacy.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthInput
          id="registerPassword"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon="lock"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          rightElement={
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((state) => !state)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          }
        />

        <p className="auth-hint">Must include at least 12 characters, one number, and one symbol.</p>
        {role === 'wholesaler' ? (
          <p className="auth-hint">Wholesaler signup is restricted. Use pre-created wholesaler credentials.</p>
        ) : null}

        <label htmlFor="terms" className="terms-row">
          <input id="terms" type="checkbox" required />
          <span>
            I agree to Terms of Service, Privacy Policy, and FDA compliance guidelines.
          </span>
        </label>

        {submitError ? <p className="page-feedback error">{submitError}</p> : null}

        <button className="auth-primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Sign Up Securely'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
