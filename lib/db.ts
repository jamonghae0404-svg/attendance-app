import { createClient } from './supabase'
import type { Program, Participant, AttendanceRecord, Journal, AttendanceStatus } from './types'

// ─── Programs ───────────────────────────────────────────────────────────────
export async function getPrograms(): Promise<Program[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(r => ({ id: r.id, name: r.name, createdAt: r.created_at }))
}

export async function saveProgram(name: string): Promise<Program> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('programs')
    .insert({ name, owner_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return { id: data.id, name: data.name, createdAt: data.created_at }
}

export async function deleteProgram(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('programs').delete().eq('id', id)
  if (error) throw error
}

// ─── Participants ────────────────────────────────────────────────────────────
export async function getParticipants(programId?: string): Promise<Participant[]> {
  const supabase = createClient()
  let query = supabase.from('participants').select('*').order('created_at', { ascending: true })
  if (programId) query = query.eq('program_id', programId)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(r => ({
    id: r.id,
    name: r.name,
    programId: r.program_id,
    status: r.status as 'active' | 'inactive',
    createdAt: r.created_at,
    endedAt: r.ended_at ?? undefined,
  }))
}

export async function saveParticipant(name: string, programId: string): Promise<Participant> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('participants')
    .insert({ name, program_id: programId, owner_id: user!.id, status: 'active' })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    programId: data.program_id,
    status: data.status,
    createdAt: data.created_at,
  }
}

export async function terminateParticipant(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('participants')
    .update({ status: 'inactive', ended_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function reactivateParticipant(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('participants')
    .update({ status: 'active', ended_at: null })
    .eq('id', id)
  if (error) throw error
}

// ─── Attendance Records ──────────────────────────────────────────────────────
function mapRecord(r: any): AttendanceRecord {
  return {
    id: r.id,
    participantId: r.participant_id,
    programId: r.program_id,
    date: r.date,
    status: r.status as AttendanceStatus,
    reason: r.reason ?? undefined,
    createdAt: r.created_at,
  }
}

export async function getRecords(programId?: string): Promise<AttendanceRecord[]> {
  const supabase = createClient()
  let query = supabase.from('attendance').select('*')
  if (programId) query = query.eq('program_id', programId)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapRecord)
}

export async function getRecordsByDate(programId: string, date: string): Promise<AttendanceRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('program_id', programId)
    .eq('date', date)
  if (error) throw error
  return (data || []).map(mapRecord)
}

export async function saveRecord(
  participantId: string,
  programId: string,
  date: string,
  status: AttendanceStatus,
  reason?: string
): Promise<AttendanceRecord> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      { participant_id: participantId, program_id: programId, date, status, reason: reason || null, owner_id: user!.id },
      { onConflict: 'participant_id,date' }
    )
    .select()
    .single()
  if (error) throw error
  return mapRecord(data)
}

export async function deleteRecord(participantId: string, date: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('participant_id', participantId)
    .eq('date', date)
  if (error) throw error
}

// ─── Journals ────────────────────────────────────────────────────────────────
export async function getJournal(programId: string, date: string): Promise<Journal | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('program_id', programId)
    .eq('date', date)
    .maybeSingle()
  if (error) throw error
  if (!data) return undefined
  return { id: data.id, programId: data.program_id, date: data.date, content: data.content, createdAt: data.created_at }
}

export async function saveJournal(programId: string, date: string, content: string): Promise<Journal> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('journals')
    .upsert(
      { program_id: programId, date, content, owner_id: user!.id },
      { onConflict: 'program_id,date' }
    )
    .select()
    .single()
  if (error) throw error
  return { id: data.id, programId: data.program_id, date: data.date, content: data.content, createdAt: data.created_at }
}
