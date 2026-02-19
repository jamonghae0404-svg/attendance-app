'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const SAVED_KEY = 'ale_saved_credentials'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setEmail(parsed.email || '')
        setPassword(parsed.password || '')
        setRememberMe(true)
      }
    } catch {}
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const supabase = createClient()

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        if (rememberMe) {
          localStorage.setItem(SAVED_KEY, JSON.stringify({ email, password }))
        } else {
          localStorage.removeItem(SAVED_KEY)
        }

        router.push('/attendance')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('가입 확인 이메일이 발송되었습니다. 이메일을 확인해주세요.')
      }
    } catch (err: any) {
      const msgMap: Record<string, string> = {
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'Email not confirmed': '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.',
        'User already registered': '이미 가입된 이메일입니다.',
      }
      setError(msgMap[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* ALE 로고 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-5
            shadow-lg shadow-indigo-200">
            <span className="text-white text-3xl font-black tracking-tight">ALE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ALE 출석부</h1>
          <p className="text-xs text-gray-400 mt-1.5 tracking-wide">
            <span className="text-indigo-500 font-semibold">A</span>rdim{' '}
            <span className="text-indigo-500 font-semibold">L</span>ifelong{' '}
            <span className="text-indigo-500 font-semibold">E</span>ducation
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 text-center">
            {mode === 'login' ? '로그인' : '계정 만들기'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 이메일 */}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="이메일"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                  text-gray-900 text-sm outline-none focus:border-indigo-400 focus:bg-white
                  transition-all"
              />
            </div>

            {/* 비밀번호 */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="비밀번호"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50
                  text-gray-900 text-sm outline-none focus:border-indigo-400 focus:bg-white
                  transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-0.5"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* 아이디/비밀번호 저장 */}
            {mode === 'login' && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(s => !s)}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0
                    ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm text-gray-600">아이디/비밀번호 저장</span>
              </label>
            )}

            {/* 에러/메시지 */}
            {error && (
              <p className="text-xs text-red-500 text-center bg-red-50 py-2 rounded-lg">{error}</p>
            )}
            {message && (
              <p className="text-xs text-green-600 text-center bg-green-50 py-2 rounded-lg">{message}</p>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                text-white font-semibold rounded-xl text-sm transition-colors
                flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn size={16} />로그인</>
              ) : (
                <><UserPlus size={16} />가입하기</>
              )}
            </button>
          </form>

          {/* 모드 전환 */}
          <div className="mt-5 text-center">
            {mode === 'login' ? (
              <button
                onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                className="text-sm text-gray-500"
              >
                계정이 없으신가요?{' '}
                <span className="text-indigo-600 font-semibold">가입하기</span>
              </button>
            ) : (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage('') }}
                className="text-sm text-gray-500"
              >
                이미 계정이 있으신가요?{' '}
                <span className="text-indigo-600 font-semibold">로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
