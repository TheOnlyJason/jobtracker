import { useEffect, useMemo, useState } from 'react'
import type { Job } from '../types'
import { STATUSES, STATUS_META, formatMinExperience } from '../types'
import { fetchJobsByMaxExperience } from '../lib/supabase'
import { IconSearch, IconExternal, IconTrash, IconBolt } from './icons'
import { StatusBadge, useToast } from './ui'

type SortKey = 'date' | 'company' | 'title' | 'status'
type RepostFilter = 'all' | 'reposts' | 'original'
type ExpFilter = 'any' | '0' | '1' | '2' | '3'

export default function JobsView({
  jobs,
  total,
  onUpdate,
  onDelete,
}: {
  jobs: Job[]
  total?: number
  onUpdate: (id: number, patch: Partial<Job>) => void
  onDelete: (id: number) => void
}) {
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [repostFilter, setRepostFilter] = useState<RepostFilter>('all')
  const [expFilter, setExpFilter] = useState<ExpFilter>('any')
  const [sort, setSort] = useState<SortKey>('date')
  const notify = useToast()

  // Rows fetched server-side when an experience filter is active; the loaded
  // window otherwise. Local status edits are mirrored into this copy.
  const [serverRows, setServerRows] = useState<Job[] | null>(null)
  useEffect(() => {
    if (expFilter === 'any') {
      setServerRows(null)
      return
    }
    let stale = false
    fetchJobsByMaxExperience(Number(expFilter))
      .then((rows) => {
        if (!stale) setServerRows(rows)
      })
      .catch((e) => notify(e instanceof Error ? e.message : 'Experience filter failed', 'err'))
    return () => {
      stale = true
    }
  }, [expFilter, notify])

  const source = serverRows ?? jobs

  const handleUpdate = (id: number, patch: Partial<Job>) => {
    onUpdate(id, patch)
    setServerRows((rows) => rows?.map((r) => (r.id === id ? { ...r, ...patch } : r)) ?? null)
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let out = source.filter((j) => {
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
  }, [source, q, statusFilter, repostFilter, sort])

  const repostCounts = useMemo(() => {
    let reposts = 0
    for (const j of source) if (j.repost) reposts++
    return { reposts, original: source.length - reposts }
  }, [source])

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: source.length }
    for (const s of STATUSES) c[s] = 0
    for (const j of source) c[j.status ?? 'To Apply'] = (c[j.status ?? 'To Apply'] ?? 0) + 1
    return c
  }, [source])

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
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value as ExpFilter)}
          >
            <option value="any">Any experience</option>
            <option value="0">No experience required</option>
            <option value="1">≤ 1 year</option>
            <option value="2">≤ 2 years</option>
            <option value="3">≤ 3 years</option>
          </select>
          <select
            className="input w-auto"
            value={repostFilter}
            onChange={(e) => setRepostFilter(e.target.value as RepostFilter)}
          >
            <option value="all">All postings ({source.length})</option>
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
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-[--color-muted]">
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Min exp</th>
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
                  <td className="px-4 py-3 whitespace-nowrap text-[#c4c4d4]">{formatMinExperience(j.min_experience_years)}</td>
                  <td className="px-4 py-3">
                    <StatusSelect job={j} onUpdate={handleUpdate} />
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
        Showing {filtered.length} of {source.length} jobs
        {serverRows != null ? (
          <> — newest {source.length} matching the experience filter</>
        ) : (
          total != null &&
          total > source.length && <> — latest {source.length} of {total.toLocaleString()} total</>
        )}
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
