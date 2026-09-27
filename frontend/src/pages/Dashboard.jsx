import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { User, CalendarCheck, Dumbbell, CreditCard, XCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { AppointmentsAPI, ClassBookingsAPI, MembershipsAPI, PaymentsAPI } from '../api/services'
import Loader from '../components/Loader.jsx'

const tabs = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'membership', label: 'Membership', icon: ShieldCheck },
  { key: 'appointments', label: 'Trainer Appointments', icon: Dumbbell },
  { key: 'classes', label: 'Class Bookings', icon: CalendarCheck },
  { key: 'payments', label: 'Payments', icon: CreditCard },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [memberships, setMemberships] = useState([])
  const [appointments, setAppointments] = useState([])
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const [m, a, b, p] = await Promise.allSettled([
        MembershipsAPI.mine(), AppointmentsAPI.mine(), ClassBookingsAPI.mine(), PaymentsAPI.mine(),
      ])
      if (m.status === 'fulfilled') setMemberships(m.value.data.results || m.value.data)
      if (a.status === 'fulfilled') setAppointments(a.value.data.results || a.value.data)
      if (b.status === 'fulfilled') setBookings(b.value.data.results || b.value.data)
      if (p.status === 'fulfilled') setPayments(p.value.data.results || p.value.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const cancelAppointment = async (id) => {
    try {
      await AppointmentsAPI.cancel(id)
      toast.success('Appointment cancelled.')
      load()
    } catch { toast.error('Could not cancel.') }
  }

  const cancelBooking = async (id) => {
    try {
      await ClassBookingsAPI.cancel(id)
      toast.success('Booking cancelled.')
      load()
    } catch { toast.error('Could not cancel.') }
  }

  const activeMembership = memberships.find((m) => m.status === 'active')

  return (
    <div className="container-app py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display">Welcome, {user?.first_name || user?.username} 👋</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your membership, bookings and appointments.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-gray-100 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? <Loader full /> : (
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'overview' && (
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="card p-5">
                <p className="text-xs text-gray-500">Membership Status</p>
                <p className="text-xl font-bold font-display mt-1">{activeMembership ? activeMembership.plan_detail.name : 'No active plan'}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500">Upcoming Appointments</p>
                <p className="text-xl font-bold font-display mt-1">{appointments.filter((a) => a.status !== 'cancelled').length}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500">Class Bookings</p>
                <p className="text-xl font-bold font-display mt-1">{bookings.filter((b) => b.status !== 'cancelled').length}</p>
              </div>
            </div>
          )}

          {tab === 'membership' && (
            <div className="space-y-4">
              {memberships.length === 0 && <p className="text-gray-500">No membership yet — visit the Membership page to get started.</p>}
              {memberships.map((m) => (
                <div key={m.id} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold">{m.plan_detail.name}</p>
                    <p className="text-xs text-gray-500">{m.start_date} → {m.end_date}</p>
                  </div>
                  <span className={`badge ${m.status === 'active' ? '' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 && <p className="text-gray-500">No appointments booked yet.</p>}
              {appointments.map((a) => (
                <div key={a.id} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold">{a.trainer_name}</p>
                    <p className="text-xs text-gray-500">{a.date} at {a.time_slot?.slice(0, 5)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge">{a.status}</span>
                    {a.status !== 'cancelled' && (
                      <button onClick={() => cancelAppointment(a.id)} className="text-red-500 text-xs flex items-center gap-1 font-medium">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'classes' && (
            <div className="space-y-4">
              {bookings.length === 0 && <p className="text-gray-500">No class bookings yet.</p>}
              {bookings.map((b) => (
                <div key={b.id} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold">{b.class_name}</p>
                    <p className="text-xs text-gray-500">{b.booking_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge">{b.status}</span>
                    {b.status !== 'cancelled' && (
                      <button onClick={() => cancelBooking(b.id)} className="text-red-500 text-xs flex items-center gap-1 font-medium">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'payments' && (
            <div className="space-y-4">
              {payments.length === 0 && <p className="text-gray-500">No payments yet.</p>}
              {payments.map((p) => (
                <div key={p.id} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold">₹{p.amount} — {p.purpose.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`badge ${p.status === 'success' ? '' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
