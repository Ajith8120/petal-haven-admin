import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from '../../api'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginError('')
    setIsLoading(true)

    try {
      const response = await axios.post(apiUrl('/api/admin/login'), {
        mobile_number: mobileNumber,
        password,
      })
      const responseData = response.data || {}
      const token = responseData.token
        || responseData.accessToken
        || responseData.data?.token
        || responseData.data?.accessToken
      const authenticated = responseData.success === true
        || responseData.status === true
        || Boolean(token)

      if (!authenticated) {
        setLoginError(responseData.message || 'Invalid mobile number or password.')
        return
      }

      if (token) localStorage.setItem('adminToken', token)
      navigate('/forms')
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error
      if (!error.response) {
        setLoginError('Cannot connect to the login server. Check that the backend is running and reachable from this device.')
      } else {
        setLoginError(serverMessage || `Login failed (HTTP ${error.response.status}). Check your details and try again.`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page container-fluid d-flex align-items-center justify-content-center">
      <div className="login-overlay" aria-hidden="true" />
      <section className="login-card row g-0" aria-labelledby="login-title">
        <div className="login-art col-lg-5 d-none d-lg-flex flex-column justify-content-between">
          <span className="login-brand"><span className="brand-mark">✿</span> Petal Haven</span>
          <div>
            <p className="art-eyebrow">A little room to grow</p>
            <h2>Make space for<br />something beautiful.</h2>
          </div>
          <p className="art-footnote">Thoughtfully grown, delivered with love.</p>
        </div>

        <div className="login-content col-12 col-lg-7">
          <div className="mobile-brand d-lg-none"><span className="brand-mark">✿</span> Petal Haven</div>
          <div className="login-heading">
            <span className="welcome-pill"><span /> Welcome back</span>
            <h1 id="login-title">Login to your account</h1>
            <p>Enter your details to continue to your admin dashboard.</p>
          </div>

          <form className="login-form" autoComplete="off" onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="mobile" className="form-label">Mobile number</label>
              <div className="input-group login-input-group">
                <span className="input-group-text country-code">+91</span>
                <input id="mobile" name="mobileNumber" className="form-control" type="tel" inputMode="numeric" autoComplete="off" placeholder="Enter your mobile number" maxLength={10} value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} required />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group password-input-group">
                <input id="password" name="password" className="form-control login-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button className="btn password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {showPassword
                      ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7a15.8 15.8 0 0 1-3 3.8" /><path d="M6.2 6.2C3.9 7.7 3 12 3 12s3.5 7 9 7a9.8 9.8 0 0 0 3.2-.5" /></>
                      : <><path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
            </div>
            <div className="d-flex justify-content-end forgot-row"><a href="#forgot-password">Forgot password?</a></div>
            {loginError && <p className="login-error" role="alert">{loginError}</p>}
            <button className="btn login-button w-100" type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'} <span aria-hidden="true">→</span>
            </button>
            <p className="login-note">Your next beautiful moment starts here <span>✿</span></p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Login
