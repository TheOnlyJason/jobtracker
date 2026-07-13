import { useMemo } from 'react'
import type { DashboardStats } from '../types'
import { STATUSES, STATUS_META } from '../types'
import { IconList, IconBuilding, IconTarget, IconTrend, IconBolt } from './icons'

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[--color-muted]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-[--color-muted]">{sub}</p>}
        </div>
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard({ serverStats }: { serverStats: DashboardStats }) {
  const stats = useMemo(() => {
    const byStatus = serverStats.by_status
    const total = serverStats.total
    const companies = serverStats.companies
    const toApply = byStatus['To Apply'] ?? 0
    const applied = total - toApply - (byStatus['Skip'] ?? 0)
    const active = (byStatus['Applied'] ?? 0) + (byStatus['Interviewing'] ?? 0) + (byStatus['Offer'] ?? 0)
    const interviews = byStatus['Interviewing'] ?? 0
    const offers = byStatus['Offer'] ?? 0
    const responseRate = applied > 0 ? Math.round(((interviews + offers) / applied) * 100) : 0

    const topCompanies: [string, number][] = serverStats.top_companies.map((c) => [c.company, c.n])

    return { total, byStatus, companies, toApply, applied, active, responseRate, topCompanies }
  }, [serverStats])

  const maxStatus = Math.max(1, ...STATUSES.map((s) => stats.byStatus[s] ?? 0))
  const maxCompany = Math.max(1, ...stats.topCompanies.map((c) => c[1]))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total jobs" value={stats.total} sub={`across ${stats.companies} companies`} icon={<IconList />} accent="#6366f1" />
        <StatCard label="Applied" value={stats.applied} sub={`${stats.toApply} still to apply`} icon={<IconBolt />} accent="#60a5fa" />
        <StatCard label="Active pipeline" value={stats.active} sub="applied · interviewing · offers" icon={<IconTarget />} accent="#fbbf24" />
        <StatCard label="Response rate" value={`${stats.responseRate}%`} sub="interviews + offers / applied" icon={<IconTrend />} accent="#34d399" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Pipeline */}
        <div className="card p-5 lg:col-span-3">
          <h3 className="mb-4 text-sm font-semibold text-[#d4d4e4]">Pipeline by status</h3>
          <div className="space-y-3.5">
            {STATUSES.map((s) => {
              const n = stats.byStatus[s] ?? 0
              const m = STATUS_META[s]
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex w-28 shrink-0 items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: m.dot }} />
                    <span className="text-xs text-[--color-muted]">{s}</span>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[--color-surface-2]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(n / maxStatus) * 100}%`, background: m.dot, opacity: 0.85 }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold tabular-nums">{n}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top companies */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#d4d4e4]">
            <IconBuilding className="h-4 w-4 text-[--color-muted]" /> Top companies
          </h3>
          {stats.topCompanies.length === 0 ? (
            <p className="text-sm text-[--color-muted]">No companies yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topCompanies.map(([name, n]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs text-[#cbd5e1]" title={name}>{name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[--color-surface-2]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(n / maxCompany) * 100}%`, background: 'linear-gradient(90deg,#818cf8,#6366f1)' }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold tabular-nums text-[--color-muted]">{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
