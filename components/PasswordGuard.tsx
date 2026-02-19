'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { checkPassword } from '@/lib/storage'

interface Props {
  onUnlock: () => void
}

export default function PasswordGuard({ onUnlock }: Props) {
  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (checkPassword(value)) {
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setValue('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div
        className={`w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8
          ${shake ? 'animate-bounce' : ''}`}
      >
        <div className="flex flex-col items-center mb-8">
          {/* ALE 로고 배지 */}
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-200">
            <span className="text-white text-3xl font-black tracking-tight">ALE</span>
          </div>

          {/* 앱 이름 */}
          <h1 className="text-2xl font-bold text-gray-900">ALE 출석부</h1>

          {/* 약자 풀네임 - 이니셜 강조 */}
          <p className="text-xs text-gray-400 mt-1.5 tracking-wide">
            <span className="text-indigo-500 font-semibold">A</span>rdim{' '}
            <span className="text-indigo-500 font-semibold">L</span>ifelong{' '}
            <span className="text-indigo-500 font-semibold">E</span>ducation
          </p>

          <p className="text-sm text-gray-400 mt-4">비밀번호를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={value}
              onChange={e => {
                setValue(e.target.value)
                setError(false)
              }}
              placeholder="비밀번호"
              className={`w-full px-4 py-3.5 rounded-xl border text-gray-900 text-center text-xl
                tracking-widest outline-none transition-all
                ${error
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-gray-50 focus:border-indigo-400 focus:bg-white'
                }`}
              autoFocus
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">
              비밀번호가 올바르지 않습니다
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
              text-white font-semibold rounded-xl transition-colors text-lg"
          >
            확인
          </button>
        </form>
      </div>
    </div>
  )
}
