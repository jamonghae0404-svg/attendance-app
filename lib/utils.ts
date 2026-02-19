import { AttendanceRecord, WeeklyStats, MonthlyStats } from './types'

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getKoreanDayName(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[date.getDay()]
}

export function getWeekDates(baseDate: Date): string[] {
  const day = baseDate.getDay() // 0=일
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return formatDate(d)
  })
}

export function getMonthDates(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month - 1, i + 1)
    return formatDate(d)
  })
}

export function calcStats(
  records: AttendanceRecord[],
  dates: string[]
): { actualCount: number; totalCount: number } {
  const presentRecords = records.filter(
    r => dates.includes(r.date) && r.status === 'present'
  )
  const uniqueParticipants = new Set(presentRecords.map(r => r.participantId))
  return {
    actualCount: uniqueParticipants.size,
    totalCount: presentRecords.length,
  }
}

export function getWeeklyStats(
  records: AttendanceRecord[],
  baseDate: Date
): WeeklyStats {
  const dates = getWeekDates(baseDate)
  const { actualCount, totalCount } = calcStats(records, dates)
  return {
    weekLabel: `${dates[0].slice(5)} ~ ${dates[6].slice(5)}`,
    startDate: dates[0],
    endDate: dates[6],
    actualCount,
    totalCount,
  }
}

export function getMonthlyStats(
  records: AttendanceRecord[],
  year: number,
  month: number
): MonthlyStats {
  const dates = getMonthDates(year, month)
  const { actualCount, totalCount } = calcStats(records, dates)
  return {
    monthLabel: `${year}년 ${month}월`,
    year,
    month,
    actualCount,
    totalCount,
  }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    present: '출석',
    absent: '결석',
    early_leave: '조퇴',
  }
  return map[status] || status
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    present: 'text-green-600',
    absent: 'text-red-500',
    early_leave: 'text-yellow-500',
  }
  return map[status] || ''
}
