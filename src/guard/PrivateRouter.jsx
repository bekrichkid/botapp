import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const PrivateRouter = ({children}) => {
    const isAuth =  useSelector(state => state.auth.isAuth)
    console.log(isAuth)
    const navigate = useNavigate();

    useEffect(() => {
      if(!isAuth) {
        navigate("/login")
      }
    }, [isAuth, navigate])
  return (
    isAuth ? children : null
  )
}

export default PrivateRouter