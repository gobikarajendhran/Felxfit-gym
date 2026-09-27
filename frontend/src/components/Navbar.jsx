import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Dumbbell, LogOut, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/programs', label: 'Programs' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/classes', label: 'Classes' },
  { to: '/membership', label: 'Membership' },
  { to: '/bmi-calculator', label: 'BMI Calculator' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm'
          : 'bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm'
      }`}
    >
      <nav className="container-app flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary-700 dark:text-primary-400">
          <Dumbbell size={26} />
          FlexFit
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to={user.is_staff ? '/admin' : '/dashboard'}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 dark:text-primary-400"
              >
                <LayoutDashboard size={16} /> {user.is_staff ? 'Admin' : 'Dashboard'}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2 text-sm">
                Join Now
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <div className="container-app py-4 flex flex-col gap-3">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-1.5">
                  {l.label}
                </NavLink>
              ))}
              <hr className="border-gray-100 dark:border-gray-800" />
              {user ? (
                <>
                  <Link to={user.is_staff ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="text-sm font-semibold text-primary-600">
                    {user.is_staff ? 'Admin Dashboard' : 'My Dashboard'}
                  </Link>
                  <button onClick={() => { setOpen(false); handleLogout() }} className="text-left text-sm text-red-500">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm w-fit">Join Now</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
