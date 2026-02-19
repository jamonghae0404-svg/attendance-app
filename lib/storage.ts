import { Program, Participant, AttendanceRecord, Journal } from './types'

const KEYS = {
  programs: 'attendance_programs',
  participants: 'attendance_participants',
  records: 'attendance_records',
  journals: 'attendance_journals',
  auth: 'attendance_auth',
}

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ─── Programs ───────────────────────────────────────────
export function getPrograms(): Program[] {
  return getItem<Program>(KEYS.programs)
}

export function saveProgram(name: string): Program {
  const programs = getPrograms()
  const program: Program = { id: genId(), name, createdAt: new Date().toISOString() }
  setItem(KEYS.programs, [...programs, program])
  return program
}

export function deleteProgram(id: string): void {
  setItem(KEYS.programs, getPrograms().filter(p => p.id !== id))
}

// ─── Participants ────────────────────────────────────────
export function getParticipants(programId?: string): Participant[] {
  const all = getItem<Participant>(KEYS.participants)
  return programId ? all.filter(p => p.programId === programId) : all
}

export function saveParticipant(name: string, programId: string): Participant {
  const participants = getParticipants()
  const p: Participant = {
    id: genId(),
    name,
    programId,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.participants, [...participants, p])
  return p
}

export function terminateParticipant(id: string): void {
  const participants = getParticipants()
  setItem(
    KEYS.participants,
    participants.map(p =>
      p.id === id ? { ...p, status: 'inactive', endedAt: new Date().toISOString() } : p
    )
  )
}

export function reactivateParticipant(id: string): void {
  const participants = getParticipants()
  setItem(
    KEYS.participants,
    participants.map(p =>
      p.id === id ? { ...p, status: 'active', endedAt: undefined } : p
    )
  )
}

// ─── Attendance Records ──────────────────────────────────
export function getRecords(programId?: string): AttendanceRecord[] {
  const all = getItem<AttendanceRecord>(KEYS.records)
  return programId ? all.filter(r => r.programId === programId) : all
}

export function getRecordsByDate(programId: string, date: string): AttendanceRecord[] {
  return getRecords(programId).filter(r => r.date === date)
}

export function saveRecord(
  participantId: string,
  programId: string,
  date: string,
  status: AttendanceRecord['status'],
  reason?: string
): AttendanceRecord {
  const all = getItem<AttendanceRecord>(KEYS.records)
  // 동일 날짜 기록 제거 후 재저장
  const filtered = all.filter(r => !(r.participantId === participantId && r.date === date))
  const record: AttendanceRecord = {
    id: genId(),
    participantId,
    programId,
    date,
    status,
    reason,
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.records, [...filtered, record])
  return record
}

export function deleteRecord(participantId: string, date: string): void {
  const all = getItem<AttendanceRecord>(KEYS.records)
  setItem(KEYS.records, all.filter(r => !(r.participantId === participantId && r.date === date)))
}

// ─── Journals ────────────────────────────────────────────
export function getJournal(programId: string, date: string): Journal | undefined {
  return getItem<Journal>(KEYS.journals).find(j => j.programId === programId && j.date === date)
}

export function saveJournal(programId: string, date: string, content: string): Journal {
  const all = getItem<Journal>(KEYS.journals)
  const existing = all.find(j => j.programId === programId && j.date === date)
  if (existing) {
    const updated = all.map(j =>
      j.id === existing.id ? { ...j, content } : j
    )
    setItem(KEYS.journals, updated)
    return { ...existing, content }
  }
  const journal: Journal = { id: genId(), programId, date, content, createdAt: new Date().toISOString() }
  setItem(KEYS.journals, [...all, journal])
  return journal
}

// ─── Auth ────────────────────────────────────────────────
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || '17120'

export function getPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_PASSWORD
  return localStorage.getItem(KEYS.auth) || DEFAULT_PASSWORD
}

export function setPassword(pw: string): void {
  localStorage.setItem(KEYS.auth, pw)
}

export function checkPassword(pw: string): boolean {
  return pw === getPassword()
}
