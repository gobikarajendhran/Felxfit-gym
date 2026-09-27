import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail } from 'lucide-react'
import { ContactAPI } from '../api/services'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ContactAPI.send(form)
      toast.success("Message sent! We'll get back to you soon.")
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      toast.error('Could not send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="badge">Get In Touch</span>
        <h1 className="section-title mt-3">We'd Love To Hear From You</h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-5">
          <div className="card p-5 flex items-center gap-4">
            <MapPin className="text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-semibold">Location</p>
              <p className="text-xs text-gray-500">MG Road, Bengaluru, India</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <Phone className="text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-semibold">Phone</p>
              <p className="text-xs text-gray-500">+91 98765 43210</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <Mail className="text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-semibold">Email</p>
              <p className="text-xs text-gray-500">hello@flexfitgym.com</p>
            </div>
          </div>
        </motion.div>

        <motion.form initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          onSubmit={submit} className="lg:col-span-3 card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Your Name" value={form.name} onChange={update('name')} className="input-field" />
            <input type="email" required placeholder="Your Email" value={form.email} onChange={update('email')} className="input-field" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input placeholder="Phone" value={form.phone} onChange={update('phone')} className="input-field" />
            <input placeholder="Subject" value={form.subject} onChange={update('subject')} className="input-field" />
          </div>
          <textarea required rows={5} placeholder="Your Message" value={form.message} onChange={update('message')} className="input-field" />
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
            <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </div>
  )
}
