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

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('date_added', { ascending: false })
    .order('id', { ascending: false })
  if (error) throw error
  return data ?? []
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
