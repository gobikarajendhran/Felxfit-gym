import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Star, X, Calendar } from 'lucide-react'
import { TrainersAPI, AppointmentsAPI } from '../api/services'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader.jsx'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function BookingModal({ trainer, onClose }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!date || !time) return toast.error('Please choose a date and time')
    setSubmitting(true)
    try {
      await AppointmentsAPI.create({ trainer: trainer.id, date, time_slot: time, notes })
      toast.success('Appointment requested! Check your dashboard.')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not book appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
        <h3 className="font-semibold text-lg mb-1">Book {trainer.name}</h3>
        <p className="text-xs text-gray-500 mb-4">{trainer.specialization}</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-field mt-1" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Time Slot</label>
            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field mt-1" rows={3} placeholder="Goals, injuries, preferences..." />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    TrainersAPI.list().then((res) => setTrainers(res.data.results || res.data)).finally(() => setLoading(false))
  }, [])

  const handleBook = (trainer) => {
    if (!user) return navigate('/login')
    setSelected(trainer)
  }

  return (
    <div className="container-app py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="badge">Our Team</span>
        <h1 className="section-title mt-3">Certified Trainers Ready To Coach You</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3">
          Book a 1-on-1 session with a trainer who matches your goals and schedule.
        </p>
      </div>

      {loading ? <Loader full /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((t) => (
            <div key={t.id} className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xl font-bold font-display text-primary-700 dark:text-primary-300">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400">{t.specialization}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Star size={12} className="fill-accent-500 text-accent-500" /> {t.rating} · {t.experience_years} yrs
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{t.bio}</p>
              {t.availability?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {t.availability.map((a) => (
                    <span key={a.id} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {DAYS[a.day_of_week]} {a.start_time?.slice(0, 5)}-{a.end_time?.slice(0, 5)}
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => handleBook(t)} className="btn-primary w-full text-sm !py-2.5">
                <Calendar size={16} /> Book Appointment
              </button>
            </div>
          ))}
          {trainers.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No trainers available yet.</p>
          )}
        </div>
      )}

      {selected && <BookingModal trainer={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
