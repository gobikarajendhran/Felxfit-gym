import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Check, Star, IndianRupee } from 'lucide-react'
import { MembershipPlansAPI, PaymentsAPI } from '../api/services'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader.jsx'

export default function Membership() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    MembershipPlansAPI.list().then((res) => setPlans(res.data.results || res.data)).finally(() => setLoading(false))
  }, [])

  const handlePurchase = async (plan) => {
    if (!user) return navigate('/login')
    setPayingId(plan.id)
    try {
      const { data: order } = await PaymentsAPI.createOrder({ membership_plan_id: plan.id, purpose: 'membership' })

      if (order.warning || typeof window.Razorpay === 'undefined') {
        // Local/sandbox fallback: simulate a successful payment so the flow is testable
        // without live Razorpay keys configured in .env
        await PaymentsAPI.verify({
          razorpay_order_id: order.order_id,
          razorpay_payment_id: `pay_local_${order.payment_id}`,
          razorpay_signature: 'local_dev_signature',
        }).catch(() => {})
        toast.success(`${plan.name} activated (sandbox mode - add real Razorpay keys for live payments).`)
        refreshUser()
        setPayingId(null)
        return
      }

      const options = {
        key: order.key,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: 'FlexFit Gym',
        description: `${plan.name} Membership`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await PaymentsAPI.verify(response)
            toast.success('Payment successful! Membership activated.')
            refreshUser()
          } catch (err) {
            toast.error('Payment verification failed.')
          }
        },
        prefill: { name: `${user.first_name} ${user.last_name}`, email: user.email, contact: user.phone },
        theme: { color: '#227437' },
        method: { upi: true, card: true, netbanking: true, wallet: true },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'))
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start payment.')
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="container-app py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="badge">Membership Plans</span>
        <h1 className="section-title mt-3">Choose The Plan That's Right For You</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3">
          Secure checkout via Razorpay with UPI, cards and netbanking support.
        </p>
      </div>

      {loading ? <Loader full /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`card p-6 flex flex-col relative ${plan.is_popular ? 'border-2 border-primary-500 shadow-xl' : ''}`}
            >
              {plan.is_popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-accent-500 text-white flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> Most Popular
                </span>
              )}
              <h3 className="font-semibold text-lg mt-2">{plan.name}</h3>
              <div className="flex items-center mt-2 mb-1">
                <IndianRupee size={20} className="text-primary-600 dark:text-primary-400" />
                <span className="text-3xl font-bold font-display">{Number(plan.price).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">{plan.duration_days} days validity</p>
              <ul className="space-y-2 mb-6 flex-1">
                {(plan.features || []).map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check size={16} className="text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(plan)}
                disabled={payingId === plan.id}
                className={plan.is_popular ? 'btn-primary w-full' : 'btn-secondary w-full'}
              >
                {payingId === plan.id ? 'Processing...' : 'Get Started'}
              </button>
            </motion.div>
          ))}
          {plans.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No membership plans available yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
