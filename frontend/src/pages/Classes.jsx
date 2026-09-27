import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Clock, CheckCircle2 } from 'lucide-react'
import { ClassesAPI, ClassBookingsAPI } from '../api/services'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    ClassesAPI.list().then((res) => setClasses(res.data.results || res.data)).finally(() => setLoading(false))
  }, [])

  const bookSlot = async (schedule) => {
    if (!user) return navigate('/login')
    setBookingId(schedule.id)
    try {
      const today = new Date()
      const targetDay = schedule.day_of_week
      const diff = (targetDay - today.getDay() + 7) % 7 || 7
      const bookingDate = new Date(today)
      bookingDate.setDate(today.getDate() + diff)
      await ClassBookingsAPI.create({
        schedule: schedule.id,
        booking_date: bookingDate.toISOString().split('T')[0],
      })
      toast.success('Class booked! See it in your dashboard.')
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Could not book this slot.')
    } finally {
      setBookingId(null)
    }
  }

  return (
    <div className="container-app py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="badge">Weekly Schedule</span>
        <h1 className="section-title mt-3">Group Classes & Available Slots</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3">
          Reserve your spot in our most popular group classes — spots fill up fast.
        </p>
      </div>

      {loading ? <Loader full /> : (
        <div className="grid lg:grid-cols-2 gap-6">
          {classes.map((c) => (
            <div key={c.id} className="card p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{c.name}</h3>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {c.duration_minutes} min</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">with {c.trainer_name || 'FlexFit Coach'}</p>
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-1"><Users size={12} /> Capacity: {c.capacity}</p>

              <div className="space-y-2">
                {c.schedules?.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{DAYS[s.day_of_week]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium mb-1 ${s.available_slots > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'}`}>
                        {s.available_slots > 0 ? `${s.available_slots} slots left` : 'Full'}
                      </p>
                      <button
                        onClick={() => bookSlot(s)}
                        disabled={s.available_slots <= 0 || bookingId === s.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-40 flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> {bookingId === s.id ? 'Booking...' : 'Book'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No classes scheduled yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
