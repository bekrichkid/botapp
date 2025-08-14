import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'

const PrivateRouter = ({ children }) => {
  const isAuth = useSelector(state => state.auth.isAuth)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuth) {
      // Current path'ni save qilamiz, login qilgandan keyin qaytish uchun
      navigate("/login", { 
        state: { from: location.pathname },
        replace: true 
      })
    }
  }, [isAuth, navigate, location.pathname])

  // Loading state ko'rsatish
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return children
}

export default PrivateRouter