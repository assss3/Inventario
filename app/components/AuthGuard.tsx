'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'vendedor'
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    if (requiredRole && parsedUser.role !== requiredRole) {
      if (parsedUser.role === 'vendedor') {
        router.push('/vendedor')
      } else {
        router.push('/')
      }
      return
    }

    setLoading(false)
  }, [router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}