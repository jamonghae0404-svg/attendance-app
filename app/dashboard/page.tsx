'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, ChevronLeft, ChevronRight, Users, TrendingUp } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AppLogo from '@/components/AppLogo'
import { getPrograms, getRecords, getParticipants } from '@/lib/storage'
import { getWeeklyStats, getMonthlyStats } from '@/lib/utils'
import type { Program, WeeklyStats, MonthlyStats } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [baseDate, setBaseDate] = useState(new Date())
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('auth_session')
    if (!session) router.replace('/')
  }, [router])

  useEffect(() => {
    const progs = getPrograms()
    setPrograms(progs)
    if (progs.length > 0 && !selectedProgram) setSelectedProgram(progs[0].id)
  }, [])

  useEffect(() => {
    if (!selectedProgram) return
    const records = getRecords(selectedProgram)
    setWeeklyStats(getWeeklyStats(records, baseDate))
    setMonthlyStats(getMonthlyStats(records, baseDate.getFullYear(), baseDate.getMonth() + 1))
  }, [selectedProgram, baseDate])

  function shiftWeek(delta: number) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + delta * 7)
    setBaseDate(d)
  }

  function shiftMonth(delta: number) {
    const d = new Date(baseDate)
    d.setMonth(d.getMonth() + delta)
    setBaseDate(d)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const records = getRecords(selectedProgram)
      const participants = getParticipants(selectedProgram)

      // journals
      const journalsRaw = localStorage.getItem('attendance_journals') || '[]'
      const journals = JSON.parse(journalsRaw).filter((j: any) => j.programId === selectedProgram)

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records,
          participants,
          programs,
          journals,
        }),
      })

      if (!res.ok) throw new Error('내보내기 실패')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `아르딤_출석부_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('내보내기에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }

  const currentProgramName = programs.find(p => p.id === selectedProgram)?.name || ''

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <AppLogo />
            <button
              onClick={handleExport}
              disabled={exporting || !selectedProgram}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white
                rounded-xl text-sm font-medium active:bg-indigo-700 disabled:opacity-50"
            >
              <Download size={16} />
              {exporting ? '처리중...' : '엑셀 내보내기'}
            </button>
          </div>

          {/* 프로그램 선택 */}
          {programs.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {programs.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProgram(p.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${selectedProgram === p.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* 주간 통계 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">주간 통계</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => shiftWeek(-1)} className="text-gray-400 active:text-indigo-600 p-1">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600 min-w-[120px] text-center">
                {weeklyStats?.weekLabel}
              </span>
              <button onClick={() => shiftWeek(1)} className="text-gray-400 active:text-indigo-600 p-1">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users size={16} className="text-indigo-500" />
                <span className="text-xs font-medium text-indigo-600">실인원</span>
              </div>
              <div className="text-3xl font-bold text-indigo-700">
                {weeklyStats?.actualCount ?? 0}
              </div>
              <div className="text-xs text-indigo-400 mt-0.5">명</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp size={16} className="text-purple-500" />
                <span className="text-xs font-medium text-purple-600">연인원</span>
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {weeklyStats?.totalCount ?? 0}
              </div>
              <div className="text-xs text-purple-400 mt-0.5">명</div>
            </div>
          </div>
        </div>

        {/* 월간 통계 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">월간 통계</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => shiftMonth(-1)} className="text-gray-400 active:text-indigo-600 p-1">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600 min-w-[80px] text-center">
                {monthlyStats?.monthLabel}
              </span>
              <button onClick={() => shiftMonth(1)} className="text-gray-400 active:text-indigo-600 p-1">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users size={16} className="text-blue-500" />
                <span className="text-xs font-medium text-blue-600">실인원</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {monthlyStats?.actualCount ?? 0}
              </div>
              <div className="text-xs text-blue-400 mt-0.5">명</div>
            </div>
            <div className="bg-cyan-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp size={16} className="text-cyan-500" />
                <span className="text-xs font-medium text-cyan-600">연인원</span>
              </div>
              <div className="text-3xl font-bold text-cyan-700">
                {monthlyStats?.totalCount ?? 0}
              </div>
              <div className="text-xs text-cyan-400 mt-0.5">명</div>
            </div>
          </div>
        </div>

        {/* 통계 설명 */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 space-y-1.5">
          <p>• <strong className="text-gray-700">실인원</strong>: 해당 기간 출석한 고유 인원 수</p>
          <p>• <strong className="text-gray-700">연인원</strong>: 해당 기간 총 출석 횟수 합산</p>
          <p>• 엑셀 내보내기 시 출석 로그, 이용자 요약, 일지가 포함됩니다</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
