export interface Program {
  id: string
  name: string
  createdAt: string
}

export interface Participant {
  id: string
  name: string
  programId: string
  status: 'active' | 'inactive'
  createdAt: string
  endedAt?: string
}

export type AttendanceStatus = 'present' | 'absent' | 'early_leave'

export interface AttendanceRecord {
  id: string
  participantId: string
  programId: string
  date: string // YYYY-MM-DD
  status: AttendanceStatus
  reason?: string
  createdAt: string
}

export interface Journal {
  id: string
  programId: string
  date: string // YYYY-MM-DD
  content: string
  createdAt: string
}

export interface WeeklyStats {
  weekLabel: string
  startDate: string
  endDate: string
  actualCount: number   // 실인원
  totalCount: number    // 연인원
}

export interface MonthlyStats {
  monthLabel: string
  year: number
  month: number
  actualCount: number   // 실인원
  totalCount: number    // 연인원
}
