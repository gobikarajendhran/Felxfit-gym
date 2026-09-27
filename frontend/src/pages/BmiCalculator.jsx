import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

const categories = [
  { max: 18.5, label: 'Underweight', color: 'text-blue-500', tip: 'Consider a structured strength & nutrition plan to build healthy mass.' },
  { max: 25, label: 'Normal', color: 'text-primary-600 dark:text-primary-400', tip: "Great! Maintain your routine with balanced training and nutrition." },
  { max: 30, label: 'Overweight', color: 'text-accent-500', tip: 'A combined cardio + strength program can help you get back on track.' },
  { max: Infinity, label: 'Obese', color: 'text-red-500', tip: 'Our Weight Loss program pairs nutrition coaching with guided training.' },
]

export default function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState('metric')
  const [result, setResult] = useState(null)

  const calculate = (e) => {
    e.preventDefault()
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w) return
    let bmi
    if (unit === 'metric') {
      const meters = h / 100
      bmi = w / (meters * meters)
    } else {
      bmi = (w / (h * h)) * 703
    }
    const cat = categories.find((c) => bmi < c.max)
    setResult({ bmi: bmi.toFixed(1), ...cat })
  }

  return (
    <div className="container-app py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="badge">Free Tool</span>
        <h1 className="section-title mt-3">BMI Calculator</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3">Get an instant estimate of your Body Mass Index and a recommended next step.</p>
      </div>

      <div className="max-w-md mx-auto card p-8">
        <div className="flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 mb-6 text-sm">
          {['metric', 'imperial'].map((u) => (
            <button
              key={u}
              onClick={() => { setUnit(u); setResult(null) }}
              className={`flex-1 py-2 rounded-full font-medium transition-colors ${unit === u ? 'bg-white dark:bg-gray-950 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}
            >
              {u === 'metric' ? 'Metric (cm/kg)' : 'Imperial (in/lb)'}
            </button>
          ))}
        </div>

        <form onSubmit={calculate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
            <input type="number" step="0.1" required value={height} onChange={(e) => setHeight(e.target.value)} className="input-field mt-1" placeholder={unit === 'metric' ? 'e.g. 170' : 'e.g. 67'} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Weight ({unit === 'metric' ? 'kg' : 'lb'})</label>
            <input type="number" step="0.1" required value={weight} onChange={(e) => setWeight(e.target.value)} className="input-field mt-1" placeholder={unit === 'metric' ? 'e.g. 65' : 'e.g. 143'} />
          </div>
          <button type="submit" className="btn-primary w-full"><Activity size={18} /> Calculate BMI</button>
        </form>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
            <p className="text-4xl font-bold font-display">{result.bmi}</p>
            <p className={`font-semibold mt-1 ${result.color}`}>{result.label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{result.tip}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
