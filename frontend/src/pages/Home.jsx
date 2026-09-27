import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Users, CalendarCheck, Star, ArrowRight, Flame, Leaf, Zap, Trophy, HeartPulse } from 'lucide-react'
import { ProgramsAPI, TrainersAPI, TestimonialsAPI } from '../api/services'
import Loader from '../components/Loader.jsx'

const iconMap = { dumbbell: Dumbbell, flame: Flame, leaf: Leaf, zap: Zap, trophy: Trophy, 'heart-pulse': HeartPulse }

const stats = [
  { label: 'Active Members', value: '2,400+', icon: Users },
  { label: 'Expert Trainers', value: '15+', icon: Dumbbell },
  { label: 'Classes / Week', value: '60+', icon: CalendarCheck },
  { label: 'Avg. Rating', value: '4.9/5', icon: Star },
]

export default function Home() {
  const [programs, setPrograms] = useState([])
  const [trainers, setTrainers] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [p, t, ts] = await Promise.allSettled([
          ProgramsAPI.list(), TrainersAPI.list(), TestimonialsAPI.list(),
        ])
        if (p.status === 'fulfilled') setPrograms((p.value.data.results || p.value.data).slice(0, 6))
        if (t.status === 'fulfilled') setTrainers((t.value.data.results || t.value.data).slice(0, 4))
        if (ts.status === 'fulfilled') setTestimonials((ts.value.data.results || ts.value.data).slice(0, 3))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-gray-950 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_35%)]" />
        <div className="container-app py-20 sm:py-28 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge bg-white/10 text-white mb-4">Premium Fitness Studio</span>
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold leading-tight max-w-2xl">
              Train Different. <span className="text-accent-400">Transform</span> Your Body.
            </h1>
            <p className="mt-5 text-gray-200 max-w-xl text-lg">
              Join FlexFit for expert-led programs, personal trainers, and a community that keeps you accountable — every single day.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/membership" className="btn-primary bg-accent-500 hover:bg-accent-400">
                View Membership Plans <ArrowRight size={18} />
              </Link>
              <Link to="/trainers" className="btn-secondary !border-white !text-white hover:!bg-white/10">
                Meet Our Trainers
              </Link>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="hidden lg:block absolute -right-10 top-16 w-72 h-72 rounded-full bg-accent-500/20 blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </section>

      {/* Stats */}
      <section className="container-app -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <s.icon className="mx-auto mb-2 text-primary-600 dark:text-primary-400" size={26} />
              <div className="text-2xl font-bold font-display">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {loading ? <Loader full /> : (
        <>
          {/* Programs */}
          <section className="container-app py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="badge">Our Programs</span>
              <h2 className="section-title mt-3">Programs Built Around Your Goals</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3">
                Whether it's strength, fat loss or flexibility — we've got a program engineered for you.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((p, i) => {
                const Icon = iconMap[p.icon] || Dumbbell
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4">
                      <Icon className="text-primary-600 dark:text-primary-400" size={22} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{p.description}</p>
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-3 inline-block">
                      {p.duration_weeks} week program
                    </span>
                  </motion.div>
                )
              })}
            </div>
            <div className="text-center mt-10">
              <Link to="/programs" className="btn-secondary">View All Programs <ArrowRight size={16} /></Link>
            </div>
          </section>

          {/* Trainers */}
          <section className="bg-gray-100 dark:bg-gray-900/50 py-20">
            <div className="container-app">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="badge">Expert Team</span>
                <h2 className="section-title mt-3">Meet Our Certified Trainers</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trainers.map((t) => (
                  <div key={t.id} className="card p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/40 mx-auto mb-4 flex items-center justify-center text-2xl font-bold font-display text-primary-700 dark:text-primary-300">
                      {t.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mb-2">{t.specialization}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.experience_years} yrs experience · ★ {t.rating}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/trainers" className="btn-primary">Book a Trainer <ArrowRight size={16} /></Link>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section className="container-app py-20">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="badge">Testimonials</span>
                <h2 className="section-title mt-3">What Our Members Say</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <div key={t.id} className="card p-6">
                    <div className="flex gap-1 mb-3 text-accent-500">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{t.message}"</p>
                    <p className="text-sm font-semibold mt-4">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA */}
      <section className="container-app pb-20">
        <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white p-10 sm:p-14 text-center rounded-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-3">Ready to Start Your Transformation?</h2>
          <p className="text-primary-100 max-w-xl mx-auto mb-6">
            Join FlexFit today and get access to world-class trainers, premium equipment and a supportive community.
          </p>
          <Link to="/register" className="btn-primary bg-accent-500 hover:bg-accent-400 inline-flex">
            Join Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
