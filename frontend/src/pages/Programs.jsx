import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Flame, Leaf, Zap, Trophy, HeartPulse, Clock } from 'lucide-react'
import { ProgramsAPI } from '../api/services'
import Loader from '../components/Loader.jsx'

const iconMap = { dumbbell: Dumbbell, flame: Flame, leaf: Leaf, zap: Zap, trophy: Trophy, 'heart-pulse': HeartPulse }

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ProgramsAPI.list()
      .then((res) => setPrograms(res.data.results || res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-app py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="badge">All Programs</span>
        <h1 className="section-title mt-3">Find The Program That Fits You</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3">
          Structured, coach-designed programs for every fitness goal — from fat loss to competitive strength.
        </p>
      </div>

      {loading ? <Loader full /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p, i) => {
            const Icon = iconMap[p.icon] || Dumbbell
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4">
                  <Icon className="text-primary-600 dark:text-primary-400" size={22} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{p.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium mt-4">
                  <Clock size={14} /> {p.duration_weeks} week program
                </div>
              </motion.div>
            )
          })}
          {programs.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No programs available yet. Please check back soon.</p>
          )}
        </div>
      )}
    </div>
  )
}
