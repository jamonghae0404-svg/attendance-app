'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PasswordGuard from '@/components/PasswordGuard'

export default function HomePage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const session = sessionStorage.getItem('auth_session')
    if (session === 'true') {
      router.replace('/attendance')
    } else {
      setChecking(false)
    }
  }, [router])

  function handleUnlock() {
    sessionStorage.setItem('auth_session', 'true')
    setAuthenticated(true)
    router.replace('/attendance')
  }

  if (checking) return null

  return <PasswordGuard onUnlock={handleUnlock} />
}
