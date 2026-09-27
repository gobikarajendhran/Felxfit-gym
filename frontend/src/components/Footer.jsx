import React from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-24">
      <div className="container-app py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 text-white font-display font-bold text-xl mb-3">
            <Dumbbell size={24} className="text-primary-500" /> FlexFit
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium fitness programs, expert trainers and a community built to help you train different.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="hover:text-primary-400"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-primary-400"><Facebook size={18} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary-400"><Twitter size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/programs" className="hover:text-primary-400">Programs</Link></li>
            <li><Link to="/trainers" className="hover:text-primary-400">Trainers</Link></li>
            <li><Link to="/classes" className="hover:text-primary-400">Classes</Link></li>
            <li><Link to="/membership" className="hover:text-primary-400">Membership Plans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Tools</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/bmi-calculator" className="hover:text-primary-400">BMI Calculator</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary-400">My Dashboard</Link></li>
            <li><Link to="/contact" className="hover:text-primary-400">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Get in Touch</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><MapPin size={16} /> MG Road, Bengaluru, India</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail size={16} /> hello@flexfitgym.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} FlexFit Gym. All rights reserved.
      </div>
    </footer>
  )
}
