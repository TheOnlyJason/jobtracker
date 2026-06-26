import { useMemo, useState } from 'react'
import type { Job } from '../types'
import { STATUSES, STATUS_META } from '../types'
import { IconSearch, IconExternal, IconTrash, IconBolt } from './icons'
import { StatusBadge } from './ui'

type SortKey = 'date' | 'company' | 'title' | 'status'
type RepostFilter = 'all' | 'reposts' | 'original'

export default function JobsView({
  jobs,
  onUpdate,
  onDelete,
}: {
  jobs: Job[]
  onUpdate: (id: number, patch: Partial<Job>) => void
  onDelete: (id: number) => void
}) {
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [repostFilter, setRepostFilter] = useState<RepostFilter>('all')
  const [sort, setSort] = useState<SortKey>('date')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let out = jobs.filter((j) => {
      if (statusFilter !== 'All' && (j.status ?? 'To Apply') !== statusFilter) return false
      if (repostFilter === 'reposts' && !j.repost) return false
      if (repostFilter === 'original' && j.repost) return false
      if (!needle) return true
      return (
        j.job_title.toLowerCase().includes(needle) ||
        (j.company ?? '').toLowerCase().includes(needle) ||
        (j.location ?? '').toLowerCase().includes(needle)
      )
    })
    out = [...out].sort((a, b) => {
      switch (sort) {
        case 'company':
          return (a.company ?? '').localeCompare(b.company ?? '')
        case 'title':
          return a.job_title.localeCompare(b.job_title)
        case 'status':
          return (a.status ?? '').localeCompare(b.status ?? '')
        default:
          return (b.date_added ?? '').localeCompare(a.date_added ?? '') || b.id - a.id
      }
    })
    return out
  }, [jobs, q, statusFilter, repostFilter, sort])

  const repostCounts = useMemo(() => {
    let reposts = 0
    for (const j of jobs) if (j.repost) reposts++
    return { reposts, original: jobs.length - reposts }
  }, [jobs])

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: jobs.length }
    for (const s of STATUSES) c[s] = 0
    for (const j of jobs) c[j.status ?? 'To Apply'] = (c[j.status ?? 'To Apply'] ?? 0) + 1
    return c
  }, [jobs])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-muted]" />
          <input
            className="input pl-9"
            placeholder="Search title, company, location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-auto"
            value={repostFilter}
            onChange={(e) => setRepostFilter(e.target.value as RepostFilter)}
          >
            <option value="all">All postings ({jobs.length})</option>
            <option value="reposts">Reposts only ({repostCounts.reposts})</option>
            <option value="original">Hide reposts ({repostCounts.original})</option>
          </select>
          <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="date">Newest first</option>
            <option value="company">Company A–Z</option>
            <option value="title">Title A–Z</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...STATUSES] as string[]).map((s) => {
          const active = statusFilter === s
          const m = s !== 'All' ? STATUS_META[s] : null
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: active ? (m ? m.bg : 'rgba(99,102,241,0.15)') : 'var(--color-surface)',
                borderColor: active ? (m ? m.border : 'rgba(99,102,241,0.4)') : 'var(--color-border)',
                color: active ? (m ? m.text : '#a5b4fc') : '#9a9ab0',
              }}
            >
              {m && <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} />}
              {s}
              <span className="tabular-nums opacity-60">{counts[s] ?? 0}</span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-[--color-muted]">
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id} className="group border-b border-[--color-border] last:border-0 transition-colors hover:bg-[--color-surface-2]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#eaeaf4]">{j.job_title}</span>
                      {j.easy_apply && (
                        <span title="Easy Apply" className="inline-flex items-center gap-0.5 rounded bg-[rgba(99,102,241,0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-[#a5b4fc]">
                          <IconBolt className="h-2.5 w-2.5" /> Easy
                        </span>
                      )}
                      {j.repost && (
                        <span title="Repost" className="rounded bg-[rgba(251,191,36,0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[#fcd34d]">Repost</span>
                      )}
                    </div>
                    <div className="text-xs text-[--color-muted]">{j.company ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-[#c4c4d4]">{j.location ?? '—'}</td>
                  <td className="px-4 py-3 text-[--color-muted]">{j.experience_level ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusSelect job={j} onUpdate={onUpdate} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-[--color-muted]">
                    {j.date_added ? new Date(j.date_added).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                      {j.job_url && (
                        <a
                          href={j.job_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open job posting"
                          className="grid h-8 w-8 place-items-center rounded-lg text-[--color-muted] hover:bg-[--color-surface] hover:text-[#a5b4fc]"
                        >
                          <IconExternal className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        title="Delete"
                        onClick={() => onDelete(j.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-[--color-muted] hover:bg-[rgba(248,113,113,0.12)] hover:text-[#f87171]"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-16 text-center">
            <StatusBadge status="To Apply" />
            <p className="mt-3 text-sm text-[--color-muted]">No jobs match your filters.</p>
          </div>
        )}
      </div>
      <p className="px-1 text-xs text-[--color-muted]">
        Showing {filtered.length} of {jobs.length} jobs
      </p>
    </div>
  )
}

function StatusSelect({ job, onUpdate }: { job: Job; onUpdate: (id: number, patch: Partial<Job>) => void }) {
  const status = job.status ?? 'To Apply'
  const m = STATUS_META[status] ?? STATUS_META['To Apply']
  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={(e) => onUpdate(job.id, { status: e.target.value })}
        className="cursor-pointer appearance-none rounded-full py-1 pl-6 pr-7 text-xs font-semibold outline-none transition-colors"
        style={{ background: m.bg, color: m.text, border: `1px solid ${m.border}` }}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="bg-[#13131c] text-white">{s}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full" style={{ background: m.dot }} />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px]" style={{ color: m.text }}>▼</span>
    </div>
  )
}
