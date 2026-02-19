'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, NotebookPen, CheckCircle, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import ReasonAccordion from '@/components/ReasonAccordion'
import AppLogo from '@/components/AppLogo'
import {
  getPrograms, getParticipants, getRecordsByDate, saveRecord,
  deleteRecord, getJournal, saveJournal
} from '@/lib/db'
import { formatDate, getKoreanDayName } from '@/lib/utils'
import type { Program, Participant, AttendanceRecord, AttendanceStatus } from '@/lib/types'

export default function AttendancePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [date, setDate] = useState(formatDate(new Date()))
  const [participants, setParticipants] = useState<Participant[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [journalText, setJournalText] = useState('')
  const [journalSaved, setJournalSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // participantId being saved

  // 프로그램 초기 로드
  useEffect(() => {
    getPrograms().then(progs => {
      setPrograms(progs)
      if (progs.length > 0) setSelectedProgram(progs[0].id)
      else setLoading(false)
    }).catch(console.error)
  }, [])

  const loadData = useCallback(async () => {
    if (!selectedProgram) return
    setLoading(true)
    try {
      const [allParticipants, recs, journal] = await Promise.all([
        getParticipants(selectedProgram),
        getRecordsByDate(selectedProgram, date),
        getJournal(selectedProgram, date),
      ])
      setParticipants(allParticipants.filter(p => p.status === 'active'))
      setRecords(recs)
      const initReasons: Record<string, string> = {}
      recs.forEach(r => { if (r.reason) initReasons[r.participantId] = r.reason })
      setReasons(initReasons)
      setJournalText(journal?.content || '')
      setJournalSaved(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedProgram, date])

  useEffect(() => {
    loadData()
  }, [loadData])

  function getStatus(participantId: string): AttendanceStatus | null {
    return records.find(r => r.participantId === participantId)?.status ?? null
  }

  async function handleAttendance(participantId: string, status: AttendanceStatus) {
    setSaving(participantId)
    try {
      const current = getStatus(participantId)
      if (current === status) {
        await deleteRecord(participantId, date)
        setExpandedId(null)
      } else {
        const reason = ['absent', 'early_leave'].includes(status)
          ? reasons[participantId] || undefined
          : undefined
        await saveRecord(participantId, selectedProgram, date, status, reason)
        setExpandedId(status === 'present' ? null : participantId)
      }
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  async function handleReasonChange(participantId: string, reason: string) {
    setReasons(prev => ({ ...prev, [participantId]: reason }))
    const rec = records.find(r => r.participantId === participantId)
    if (rec && rec.status !== 'present') {
      try {
        await saveRecord(participantId, selectedProgram, date, rec.status, reason)
      } catch (err) {
        console.error(err)
      }
    }
  }

  function shiftDate(delta: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    setDate(formatDate(d))
  }

  async function handleSaveJournal() {
    if (!selectedProgram) return
    try {
      await saveJournal(selectedProgram, date, journalText)
      setJournalSaved(true)
      setTimeout(() => setJournalSaved(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const dateObj = new Date(date)
  const dayName = getKoreanDayName(dateObj)
  const isToday = date === formatDate(new Date())

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <AppLogo />
          <div className="mt-2">
            {/* 프로그램 선택 탭 */}
            {programs.length > 1 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {programs.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProgram(p.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${selectedProgram === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {/* 날짜 선택 */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2">
              <button onClick={() => shiftDate(-1)} className="text-gray-500 active:text-indigo-600 p-1">
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <span className="font-semibold text-gray-900">{date}</span>
                <span className="ml-2 text-sm text-gray-500">({dayName})</span>
                {isToday && (
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">오늘</span>
                )}
              </div>
              <button onClick={() => shiftDate(1)} className="text-gray-500 active:text-indigo-600 p-1">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {/* 로딩 */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">등록된 프로그램이 없습니다</p>
            <p className="text-sm mt-1">관리 탭에서 프로그램을 생성해주세요</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">등록된 이용자가 없습니다</p>
            <p className="text-sm mt-1">관리 탭에서 이용자를 등록해주세요</p>
          </div>
        ) : (
          participants.map(participant => {
            const status = getStatus(participant.id)
            const isSaving = saving === participant.id

            return (
              <div key={participant.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 text-base">{participant.name}</span>
                    {status && (
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full
                        ${status === 'present' ? 'bg-green-100 text-green-700' : ''}
                        ${status === 'absent' ? 'bg-red-100 text-red-700' : ''}
                        ${status === 'early_leave' ? 'bg-yellow-100 text-yellow-700' : ''}
                      `}>
                        {status === 'present' ? '출석' : status === 'absent' ? '결석' : '조퇴'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAttendance(participant.id, 'present')}
                      disabled={isSaving}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-60
                        ${status === 'present'
                          ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                          : 'bg-green-50 text-green-700 border border-green-200'}`}
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : '출석'}
                    </button>
                    <button
                      onClick={() => handleAttendance(participant.id, 'absent')}
                      disabled={isSaving}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-60
                        ${status === 'absent'
                          ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                          : 'bg-red-50 text-red-700 border border-red-200'}`}
                    >
                      결석
                    </button>
                    <button
                      onClick={() => handleAttendance(participant.id, 'early_leave')}
                      disabled={isSaving}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-60
                        ${status === 'early_leave'
                          ? 'bg-yellow-400 text-white shadow-sm shadow-yellow-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}
                    >
                      조퇴
                    </button>
                  </div>

                  <ReasonAccordion
                    open={status === 'absent' || status === 'early_leave'}
                    value={reasons[participant.id] || ''}
                    onChange={reason => handleReasonChange(participant.id, reason)}
                  />
                </div>
              </div>
            )
          })
        )}

        {/* 오늘의 일지 */}
        {!loading && selectedProgram && participants.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <NotebookPen size={18} className="text-indigo-500" />
              <span className="font-semibold text-gray-900">오늘의 일지</span>
            </div>
            <textarea
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              placeholder="오늘 활동 내용, 특이사항 등을 기록하세요..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700
                bg-gray-50 outline-none focus:border-indigo-400 focus:bg-white resize-none
                transition-all leading-relaxed"
            />
            <button
              onClick={handleSaveJournal}
              className={`mt-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all
                flex items-center justify-center gap-2
                ${journalSaved
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'}`}
            >
              {journalSaved ? <><CheckCircle size={16} />저장됨</> : '일지 저장'}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
