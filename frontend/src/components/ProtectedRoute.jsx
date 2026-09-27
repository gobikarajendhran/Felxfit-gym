import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) return <Loader full />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !user.is_staff) return <Navigate to="/dashboard" replace />

  return children
}
