import { useEffect, useState, useCallback } from 'react'
import type { DashboardStats, Job } from './types'
import { fetchJobs, fetchDashboardStats, updateJob, deleteJob, isConfigured } from './lib/supabase'
import { ToastProvider, useToast, Modal } from './components/ui'
import Dashboard from './components/Dashboard'
import JobsView from './components/JobsView'
import BoardView from './components/BoardView'
import RecruitersView from './components/RecruitersView'
import AddJobModal from './components/AddJobModal'
import {
  IconDashboard,
  IconList,
  IconBoard,
  IconUsers,
  IconPlus,
} from './components/icons'

type Tab = 'dashboard' | 'jobs' | 'board' | 'recruiters'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <IconDashboard className="h-4 w-4" /> },
  { key: 'jobs', label: 'Jobs', icon: <IconList className="h-4 w-4" /> },
  { key: 'board', label: 'Board', icon: <IconBoard className="h-4 w-4" /> },
  { key: 'recruiters', label: 'Recruiters', icon: <IconUsers className="h-4 w-4" /> },
]

function Shell() {
  const notify = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [addOpen, setAddOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.')
      setLoading(false)
      return
    }
    Promise.all([fetchJobs(), fetchDashboardStats()])
      .then(([js, st]) => {
        setJobs(js)
        setStats(st)
      })
      .catch((e) => setError(e?.message ?? 'Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [])

  // Keep the server-derived stats in step with local edits so the dashboard
  // stays accurate without a refetch.
  const shiftStats = useCallback((from: string | null, to: string | null, totalDelta = 0) => {
    setStats((s) => {
      if (!s) return s
      const by = { ...s.by_status }
      if (from) by[from] = Math.max(0, (by[from] ?? 0) - 1)
      if (to) by[to] = (by[to] ?? 0) + 1
      return { ...s, total: s.total + totalDelta, by_status: by }
    })
  }, [])

  const handleUpdate = useCallback(
    async (id: number, patch: Partial<Job>) => {
      const prev = jobs
      const oldStatus = jobs.find((j) => j.id === id)?.status ?? 'To Apply'
      const statusChanged = patch.status != null && patch.status !== oldStatus
      setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)))
      if (statusChanged) shiftStats(oldStatus, patch.status!)
      try {
        await updateJob(id, patch)
      } catch (e) {
        setJobs(prev)
        if (statusChanged) shiftStats(patch.status!, oldStatus)
        notify(e instanceof Error ? e.message : 'Update failed', 'err')
      }
    },
    [jobs, notify, shiftStats],
  )

  const confirmDelete = useCallback(async () => {
    if (confirmId == null) return
    setDeleting(true)
    const prev = jobs
    const deletedStatus = jobs.find((j) => j.id === confirmId)?.status ?? 'To Apply'
    setJobs((js) => js.filter((j) => j.id !== confirmId))
    shiftStats(deletedStatus, null, -1)
    try {
      await deleteJob(confirmId)
      notify('Job deleted')
    } catch (e) {
      setJobs(prev)
      shiftStats(null, deletedStatus, 1)
      notify(e instanceof Error ? e.message : 'Delete failed', 'err')
    } finally {
      setDeleting(false)
      setConfirmId(null)
    }
  }, [confirmId, jobs, notify, shiftStats])

  const toDelete = jobs.find((j) => j.id === confirmId)

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-16 sm:px-6">
      {/* Header */}
      <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-[--color-border] bg-[rgba(10,10,15,0.7)] px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] shadow-lg shadow-indigo-500/30">
              <IconList className="h-5 w-5 text-white" />
            </span>
            <div>
              <h1 className="text-base font-bold leading-none tracking-tight">JobTracker</h1>
              <p className="mt-1 text-xs text-[--color-muted]">{(stats?.total ?? jobs.length).toLocaleString()} jobs tracked</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <IconPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add job</span>
          </button>
        </div>

        {/* Tabs */}
        <nav className="mt-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
                style={{
                  color: active ? '#fff' : '#8b8ba3',
                  background: active ? 'var(--color-surface-2)' : 'transparent',
                }}
              >
                {t.icon}
                {t.label}
                {active && <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-[--color-accent]" />}
              </button>
            )
          })}
        </nav>
      </header>

      {/* Content */}
      {error ? (
        <div className="card mx-auto mt-10 max-w-lg p-6 text-center">
          <p className="text-sm font-semibold text-[#f87171]">Couldn't load data</p>
          <p className="mt-2 text-sm text-[--color-muted]">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid place-items-center py-32">
          <div className="flex items-center gap-3 text-sm text-[--color-muted]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[--color-border] border-t-[--color-accent]" />
            Loading your jobs…
          </div>
        </div>
      ) : (
        <main className="animate-fade">
          {tab === 'dashboard' && stats && <Dashboard serverStats={stats} />}
          {tab === 'jobs' && <JobsView jobs={jobs} total={stats?.total} onUpdate={handleUpdate} onDelete={setConfirmId} />}
          {tab === 'board' && <BoardView jobs={jobs} onUpdate={handleUpdate} />}
          {tab === 'recruiters' && <RecruitersView />}
        </main>
      )}

      <AddJobModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={(job) => {
          setJobs((js) => [job, ...js])
          shiftStats(null, job.status ?? 'To Apply', 1)
        }}
      />

      <Modal open={confirmId != null} onClose={() => setConfirmId(null)} title="Delete job?" width={420}>
        <p className="text-sm text-[--color-muted]">
          This will permanently remove{' '}
          <span className="font-medium text-[#eaeaf4]">{toDelete?.job_title}</span>
          {toDelete?.company ? ` at ${toDelete.company}` : ''} from your tracker.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
          <button
            className="btn"
            style={{ background: '#dc2626', color: 'white' }}
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  )
}
