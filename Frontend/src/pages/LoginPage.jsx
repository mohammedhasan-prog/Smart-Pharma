import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractAuthToken, extractUserRole, loginUser } from '../api/authApi'
import AuthInput from '../components/auth/AuthInput'
import AuthLayout from '../components/auth/AuthLayout'

function LoginPage() {
  const navigate = useNavigate()
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
      const response = await loginUser({ email, password })
      const token = extractAuthToken(response)
      const role = extractUserRole(response)

      if (token) {
        localStorage.setItem('pharmacyAuthToken', token)
      }

      if (role) {
        localStorage.setItem('pharmacyUserRole', role)
      }

      const isWholesaler = String(role).toLowerCase() === 'wholesaler'
      navigate(isWholesaler ? '/wholesaler-orders' : '/dashboard')
    } catch (error) {
      setSubmitError(error.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Access Control"
      subtitle="Sign in to continue to your pharmacy workspace."
      switchText="Need an account?"
      switchLinkText="Create one"
      switchTo="/register"
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <AuthInput
          id="loginEmail"
          label="Institutional Email"
          type="email"
          icon="mail"
          placeholder="pharmacist@institution.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthInput
          id="loginPassword"
          label="Secure Passphrase"
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

        <div className="auth-row-inline">
          <label htmlFor="rememberSession" className="remember-row">
            <input id="rememberSession" type="checkbox" />
            <span>Maintain Session</span>
          </label>
          <a href="#">Recover Credentials</a>
        </div>

        {submitError ? <p className="page-feedback error">{submitError}</p> : null}

        <button className="auth-primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Authenticating...' : 'Authenticate'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
