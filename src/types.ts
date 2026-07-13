export interface Job {
  id: number
  job_id: string
  job_title: string
  company: string | null
  location: string | null
  job_url: string | null
  experience_level: string | null
  status: string | null
  easy_apply: string | null
  repost: boolean | null
  date_added: string | null
  created_at: string | null
}

export interface Recruiter {
  id: number
  name: string
  linkedin_url: string | null
  messaged: boolean
  replied: boolean
  created_at: string | null
}

export type JobInsert = {
  job_id: string
  job_title: string
  company?: string | null
  location?: string | null
  job_url?: string | null
  experience_level?: string | null
  status?: string | null
  easy_apply?: string | null
}

export interface DashboardStats {
  total: number
  companies: number
  by_status: Record<string, number>
  top_companies: { company: string; n: number }[]
}

export const STATUSES = [
  'To Apply',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Ghosted',
  'Skip',
] as const

export type Status = (typeof STATUSES)[number]

export const STATUS_META: Record<
  string,
  { dot: string; text: string; bg: string; border: string }
> = {
  'To Apply': { dot: '#94a3b8', text: '#cbd5e1', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)' },
  Applied: { dot: '#60a5fa', text: '#93c5fd', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
  Interviewing: { dot: '#fbbf24', text: '#fcd34d', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
  Offer: { dot: '#34d399', text: '#6ee7b7', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
  Rejected: { dot: '#f87171', text: '#fca5a5', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  Ghosted: { dot: '#6b7280', text: '#9ca3af', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
  Skip: { dot: '#c084fc', text: '#d8b4fe', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)' },
}

export const EXPERIENCE_LEVELS = [
  'Internship',
  'Entry Level',
  'Associate',
  'Mid-Senior level',
  'Director',
  'Executive',
] as const
