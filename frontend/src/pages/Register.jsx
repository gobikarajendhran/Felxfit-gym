import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', phone: '', password: '', password2: '',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) return toast.error("Passwords don't match.")
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to FlexFit.')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      const firstError = data ? Object.values(data)[0]?.[0] || Object.values(data)[0] : null
      toast.error(firstError || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-20 flex justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold font-display text-center mb-1">Join FlexFit</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Create your account to book trainers, classes and manage your membership.</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">First Name</label>
              <input required value={form.first_name} onChange={update('first_name')} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Last Name</label>
              <input value={form.last_name} onChange={update('last_name')} className="input-field mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Username</label>
            <input required value={form.username} onChange={update('username')} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input type="email" required value={form.email} onChange={update('email')} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Phone</label>
            <input value={form.phone} onChange={update('phone')} className="input-field mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Password</label>
              <input type="password" required value={form.password} onChange={update('password')} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Confirm Password</label>
              <input type="password" required value={form.password2} onChange={update('password2')} className="input-field mt-1" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus size={18} /> {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium">Login</Link>
        </p>
      </motion.div>
    </div>
  )
}
