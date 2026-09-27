import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, ShieldCheck, Dumbbell, ClipboardList, IndianRupee, CalendarCheck, ExternalLink } from 'lucide-react'
import { AdminAPI } from '../api/services'
import Loader from '../components/Loader.jsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AdminAPI.stats().then((res) => setStats(res.data)).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Members', value: stats.total_members, icon: Users },
    { label: 'Total Users', value: stats.total_users, icon: Users },
    { label: 'Active Memberships', value: stats.active_memberships, icon: ShieldCheck },
    { label: 'Active Trainers', value: stats.total_trainers, icon: Dumbbell },
    { label: 'Pending Appointments', value: stats.pending_appointments, icon: ClipboardList },
    { label: 'Upcoming Class Bookings', value: stats.upcoming_class_bookings, icon: CalendarCheck },
  ] : []

  return (
    <div className="container-app py-12">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of FlexFit gym operations.</p>
        </div>
        <a href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/admin/`}
           target="_blank" rel="noreferrer" className="btn-secondary text-sm !py-2">
          Full Admin Panel <ExternalLink size={14} />
        </a>
      </div>

      {loading ? <Loader full /> : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {cards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
                <c.icon className="text-primary-600 dark:text-primary-400 mb-2" size={22} />
                <p className="text-2xl font-bold font-display">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-5 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <IndianRupee className="mb-2" size={22} />
              <p className="text-2xl font-bold font-display">₹{Number(stats?.total_revenue || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-primary-100">Total Revenue</p>
            </motion.div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">Recent Payments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Purpose</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recent_payments || []).map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 dark:border-gray-900">
                      <td className="py-2.5">{p.user__username}</td>
                      <td className="py-2.5">₹{p.amount}</td>
                      <td className="py-2.5 capitalize">{p.purpose.replace('_', ' ')}</td>
                      <td className="py-2.5 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!stats?.recent_payments || stats.recent_payments.length === 0) && (
                    <tr><td colSpan={4} className="py-6 text-center text-gray-400">No payments yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            For full CRUD management of members, trainers, programs, plans, classes, schedules,
            bookings and payments, use the <strong>Full Admin Panel</strong> above (Django admin) —
            it includes search, filters and inline editing for every model.
          </p>
        </>
      )}
    </div>
  )
}
