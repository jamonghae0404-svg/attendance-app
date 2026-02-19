'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, UserX, UserCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AppLogo from '@/components/AppLogo'
import {
  getPrograms, saveProgram, deleteProgram,
  getParticipants, saveParticipant, terminateParticipant, reactivateParticipant
} from '@/lib/storage'
import type { Program, Participant } from '@/lib/types'

export default function ManagementPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newProgramName, setNewProgramName] = useState('')
  const [newParticipantName, setNewParticipantName] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState<string>('')
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('auth_session')
    if (!session) router.replace('/')
  }, [router])

  function loadAll() {
    const progs = getPrograms()
    setPrograms(progs)
    setParticipants(getParticipants())
    if (progs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(progs[0].id)
      setExpandedProgram(progs[0].id)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function handleAddProgram(e: React.FormEvent) {
    e.preventDefault()
    if (!newProgramName.trim()) return
    saveProgram(newProgramName.trim())
    setNewProgramName('')
    loadAll()
  }

  function handleDeleteProgram(id: string) {
    if (!confirm('프로그램을 삭제하면 이용자 정보도 함께 삭제됩니다. 계속하시겠습니까?')) return
    deleteProgram(id)
    loadAll()
  }

  function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault()
    if (!newParticipantName.trim() || !selectedProgramId) return
    saveParticipant(newParticipantName.trim(), selectedProgramId)
    setNewParticipantName('')
    loadAll()
  }

  function getParticipantsForProgram(programId: string, status?: 'active' | 'inactive') {
    return participants.filter(p =>
      p.programId === programId &&
      (status ? p.status === status : true)
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <AppLogo />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* 프로그램 추가 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">프로그램 추가</h2>
          <form onSubmit={handleAddProgram} className="flex gap-2">
            <input
              type="text"
              value={newProgramName}
              onChange={e => setNewProgramName(e.target.value)}
              placeholder="프로그램명 입력"
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                text-sm text-gray-900 outline-none focus:border-indigo-400 focus:bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium
                active:bg-indigo-700 flex items-center gap-1.5"
            >
              <Plus size={16} />
              추가
            </button>
          </form>
        </div>

        {/* 프로그램 목록 */}
        {programs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>등록된 프로그램이 없습니다</p>
          </div>
        ) : (
          programs.map(program => {
            const active = getParticipantsForProgram(program.id, 'active')
            const inactive = getParticipantsForProgram(program.id, 'inactive')
            const isExpanded = expandedProgram === program.id

            return (
              <div key={program.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* 프로그램 헤더 */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => {
                    setExpandedProgram(isExpanded ? null : program.id)
                    setSelectedProgramId(program.id)
                  }}
                >
                  <div>
                    <span className="font-semibold text-gray-900">{program.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      활성 {active.length}명
                      {inactive.length > 0 && ` · 종결 ${inactive.length}명`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteProgram(program.id) }}
                      className="text-gray-300 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {/* 이용자 관리 */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* 이용자 추가 폼 */}
                    <form onSubmit={handleAddParticipant} className="flex gap-2">
                      <input
                        type="text"
                        value={newParticipantName}
                        onChange={e => setNewParticipantName(e.target.value)}
                        placeholder="이용자 이름 입력"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                          text-sm text-gray-900 outline-none focus:border-indigo-400 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium
                          active:bg-indigo-700 flex items-center gap-1.5"
                      >
                        <Plus size={16} />
                        등록
                      </button>
                    </form>

                    {/* 활성 이용자 */}
                    {active.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">활성 이용자</p>
                        <div className="space-y-2">
                          {active.map(p => (
                            <div key={p.id}
                              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">{p.name}</span>
                              <button
                                onClick={() => { terminateParticipant(p.id); loadAll() }}
                                className="flex items-center gap-1 text-xs text-red-500 bg-red-50
                                  px-3 py-1.5 rounded-lg active:bg-red-100"
                              >
                                <UserX size={14} />
                                종결
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 종결 이용자 */}
                    {inactive.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowInactive(s => !s)}
                          className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1"
                        >
                          종결 이용자 {inactive.length}명
                          {showInactive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        {showInactive && (
                          <div className="space-y-2">
                            {inactive.map(p => (
                              <div key={p.id}
                                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 opacity-60">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                                  {p.endedAt && (
                                    <span className="ml-2 text-xs text-gray-400">
                                      {p.endedAt.slice(0, 10)} 종결
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => { reactivateParticipant(p.id); loadAll() }}
                                  className="flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50
                                    px-3 py-1.5 rounded-lg active:bg-indigo-100"
                                >
                                  <UserCheck size={14} />
                                  복귀
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {active.length === 0 && inactive.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        등록된 이용자가 없습니다
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
