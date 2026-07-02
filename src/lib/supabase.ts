import { createClient } from '@supabase/supabase-js'
import type { Job, JobInsert, Recruiter } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  // Surfaced in the UI by App's connection guard.
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(url, key)
export const isConfigured = Boolean(url && key)

/* ---------- Jobs ---------- */

// Supabase caps each REST request at 1000 rows (PostgREST Max Rows),
// so page through until an empty page marks the end.
const PAGE_SIZE = 1000

export async function fetchJobs(): Promise<Job[]> {
  const all: Job[] = []
  for (let from = 0; ; ) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('date_added', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    const rows = data ?? []
    all.push(...rows)
    if (rows.length === 0) break
    from += rows.length
  }
  return all
}

export async function updateJob(id: number, patch: Partial<Job>): Promise<void> {
  const { error } = await supabase.from('jobs').update(patch).eq('id', id)
  if (error) throw error
}

export async function insertJob(job: JobInsert): Promise<Job> {
  const { data, error } = await supabase.from('jobs').insert(job).select().single()
  if (error) throw error
  return data as Job
}

export async function deleteJob(id: number): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}

/* ---------- Recruiters ---------- */

export async function fetchRecruiters(): Promise<Recruiter[]> {
  const { data, error } = await supabase
    .from('technical_recruiters')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function insertRecruiter(
  r: Pick<Recruiter, 'name' | 'linkedin_url'>,
): Promise<Recruiter> {
  const { data, error } = await supabase
    .from('technical_recruiters')
    .insert(r)
    .select()
    .single()
  if (error) throw error
  return data as Recruiter
}

export async function updateRecruiter(
  id: number,
  patch: Partial<Recruiter>,
): Promise<void> {
  const { error } = await supabase.from('technical_recruiters').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteRecruiter(id: number): Promise<void> {
  const { error } = await supabase.from('technical_recruiters').delete().eq('id', id)
  if (error) throw error
}
