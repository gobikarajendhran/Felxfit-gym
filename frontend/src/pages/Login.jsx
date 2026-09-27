import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Welcome back, ${user.first_name || user.username}!`)
      navigate(user.is_staff ? '/admin' : (location.state?.from || '/dashboard'))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-20 flex justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold font-display text-center mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Log in to manage your membership and bookings.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Username</label>
            <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field mt-1" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn size={18} /> {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium">Register</Link>
        </p>
        <p className="text-[11px] text-center text-gray-400 mt-4">
          Demo login — customer: demo_member / Member@1234 · admin: admin / Admin@1234
        </p>
      </motion.div>
    </div>
  )
}
