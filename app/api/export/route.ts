import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { records, participants, programs, journals } = await req.json()

    // 동적 import (서버 사이드)
    const XLSX = await import('xlsx')

    const wb = XLSX.utils.book_new()

    // ─── 출석 로그 시트 ─────────────────────────────────────
    const participantMap: Record<string, string> = {}
    participants.forEach((p: any) => { participantMap[p.id] = p.name })

    const programMap: Record<string, string> = {}
    programs.forEach((p: any) => { programMap[p.id] = p.name })

    const logData = [
      ['날짜', '요일', '프로그램', '이용자', '출결', '사유'],
      ...records
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .map((r: any) => {
          const d = new Date(r.date)
          const days = ['일', '월', '화', '수', '목', '금', '토']
          const statusMap: Record<string, string> = {
            present: '출석', absent: '결석', early_leave: '조퇴'
          }
          return [
            r.date,
            days[d.getDay()],
            programMap[r.programId] || '',
            participantMap[r.participantId] || '',
            statusMap[r.status] || r.status,
            r.reason || '',
          ]
        }),
    ]
    const logSheet = XLSX.utils.aoa_to_sheet(logData)
    logSheet['!cols'] = [{ wch: 12 }, { wch: 6 }, { wch: 20 }, { wch: 12 }, { wch: 8 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, logSheet, '출석 로그')

    // ─── 이용자별 요약 시트 ──────────────────────────────────
    const summaryRows: any[][] = [['프로그램', '이용자', '출석', '결석', '조퇴', '총일수']]
    participants.forEach((p: any) => {
      const pRecords = records.filter((r: any) => r.participantId === p.id)
      const present = pRecords.filter((r: any) => r.status === 'present').length
      const absent = pRecords.filter((r: any) => r.status === 'absent').length
      const earlyLeave = pRecords.filter((r: any) => r.status === 'early_leave').length
      summaryRows.push([
        programMap[p.programId] || '',
        p.name,
        present,
        absent,
        earlyLeave,
        pRecords.length,
      ])
    })
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }]
    XLSX.utils.book_append_sheet(wb, summarySheet, '이용자 요약')

    // ─── 일지 시트 ───────────────────────────────────────────
    if (journals.length > 0) {
      const journalData = [
        ['날짜', '프로그램', '내용'],
        ...journals
          .sort((a: any, b: any) => a.date.localeCompare(b.date))
          .map((j: any) => [j.date, programMap[j.programId] || '', j.content]),
      ]
      const journalSheet = XLSX.utils.aoa_to_sheet(journalData)
      journalSheet['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 60 }]
      XLSX.utils.book_append_sheet(wb, journalSheet, '일지')
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('아르딤_출석부')}.xlsx`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: '내보내기 실패' }, { status: 500 })
  }
}
