import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [validating, setValidating] = useState(true)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link')
      setValidating(false)
      return
    }

    // Validate the reset token
    const validateToken = async () => {
      try {
        const response = await fetch('https://stiles.co.za/api/validate-reset-token.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Invalid or expired reset link')
          setTokenValid(false)
        } else {
          setTokenValid(true)
        }
      } catch (err) {
        setError('Failed to validate reset link')
        setTokenValid(false)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://stiles.co.za/api/reset-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed')
      }

      setSuccess(data.message || 'Password reset successfully')
      setFormData({ password: '', confirmPassword: '' })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark mx-auto"></div>
              <p className="mt-4 text-gray-600">Validating reset link...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!tokenValid) {
    return (
      <Layout>
        <Helmet>
          <title>Invalid Reset Link | Stiles</title>
          <meta name="description" content="Invalid password reset link" />
        </Helmet>
        <section className='w-full bg-black relative flex flex-col justify-center items-center pt-20 h-[40vh]'>
          <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
          <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center drop-shadow-md'>Invalid Reset Link</h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link 
                to="/forgot-password" 
                className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Helmet>
        <title>Reset Password | Stiles</title>
        <meta name="description" content="Reset your Stiles account password" />
      </Helmet>
      <section className='w-full bg-black relative flex flex-col justify-center items-center pt-20 h-[40vh]'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
          <h1 className='text-white font-bold text-5xl text-center drop-shadow-md'>Reset Password</h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-dark focus:ring-dark text-base"
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-dark focus:ring-dark text-base"
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-dark hover:text-gray-800">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ResetPassword 