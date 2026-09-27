import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-app py-32 text-center">
      <h1 className="text-7xl font-bold font-display text-primary-600 dark:text-primary-400">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-4 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-flex"><Home size={16} /> Back Home</Link>
    </div>
  )
}
