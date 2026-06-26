import { useMemo, useState } from 'react'
import type { Job } from '../types'
import { STATUSES, STATUS_META } from '../types'
import { IconExternal, IconBolt } from './icons'

export default function BoardView({
  jobs,
  onUpdate,
}: {
  jobs: Job[]
  onUpdate: (id: number, patch: Partial<Job>) => void
}) {
  const [dragId, setDragId] = useState<number | null>(null)
  const [over, setOver] = useState<string | null>(null)

  const columns = useMemo(() => {
    const map: Record<string, Job[]> = {}
    for (const s of STATUSES) map[s] = []
    for (const j of jobs) {
      const s = j.status ?? 'To Apply'
      ;(map[s] ??= []).push(j)
    }
    return map
  }, [jobs])

  function drop(status: string) {
    if (dragId != null) {
      const job = jobs.find((j) => j.id === dragId)
      if (job && (job.status ?? 'To Apply') !== status) onUpdate(dragId, { status })
    }
    setDragId(null)
    setOver(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-3">
      {STATUSES.map((s) => {
        const m = STATUS_META[s]
        const list = columns[s] ?? []
        const isOver = over === s
        return (
          <div
            key={s}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(s)
            }}
            onDragLeave={() => setOver((o) => (o === s ? null : o))}
            onDrop={() => drop(s)}
            className="flex w-72 shrink-0 flex-col rounded-2xl border transition-colors"
            style={{
              background: isOver ? m.bg : 'var(--color-surface)',
              borderColor: isOver ? m.border : 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: m.dot }} />
                <span className="text-sm font-semibold" style={{ color: m.text }}>{s}</span>
              </div>
              <span className="rounded-full bg-[--color-surface-2] px-2 py-0.5 text-xs font-semibold tabular-nums text-[--color-muted]">
                {list.length}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2 px-2.5 pb-3">
              {list.map((j) => (
                <div
                  key={j.id}
                  draggable
                  onDragStart={() => setDragId(j.id)}
                  onDragEnd={() => {
                    setDragId(null)
                    setOver(null)
                  }}
                  className="group cursor-grab rounded-xl border border-[--color-border] bg-[--color-surface-2] p-3 transition-all hover:border-[#3a3a52] active:cursor-grabbing"
                  style={{ opacity: dragId === j.id ? 0.4 : 1 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug text-[#eaeaf4]">{j.job_title}</p>
                    {j.job_url && (
                      <a
                        href={j.job_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-[--color-muted] opacity-0 transition-opacity hover:text-[#a5b4fc] group-hover:opacity-100"
                      >
                        <IconExternal className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[--color-muted]">{j.company ?? '—'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {j.location && <span className="text-[11px] text-[#7a7a92]">{j.location}</span>}
                    {j.easy_apply && (
                      <span className="ml-auto inline-flex items-center gap-0.5 rounded bg-[rgba(99,102,241,0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-[#a5b4fc]">
                        <IconBolt className="h-2.5 w-2.5" /> Easy
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {list.length === 0 && (
                <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-[--color-border] py-6 text-xs text-[#5a5a72]">
                  Drop here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
