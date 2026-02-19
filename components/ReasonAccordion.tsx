'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const QUICK_REASONS = ['병원 방문', '가족 행사', '무단 결석', '기타']

interface Props {
  value: string
  onChange: (reason: string) => void
  open: boolean
}

export default function ReasonAccordion({ value, onChange, open }: Props) {
  const [custom, setCustom] = useState(false)

  if (!open) return null

  return (
    <div className="mt-2 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden
      transition-all duration-300">
      <div className="p-3">
        <p className="text-xs text-gray-500 mb-2 font-medium">사유 선택</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_REASONS.map(reason => (
            <button
              key={reason}
              type="button"
              onClick={() => {
                onChange(reason)
                setCustom(false)
              }}
              className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all
                ${value === reason
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 active:bg-gray-50'
                }`}
            >
              {reason}
            </button>
          ))}
        </div>

        <div className="mt-2">
          <input
            type="text"
            placeholder="직접 입력..."
            value={QUICK_REASONS.includes(value) ? '' : value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm
              bg-white text-gray-700 outline-none focus:border-indigo-400"
          />
        </div>
      </div>
    </div>
  )
}
