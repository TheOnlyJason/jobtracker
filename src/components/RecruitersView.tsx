import { useState, useMemo, useEffect } from 'react'
import type { Recruiter } from '../types'
import {
  fetchRecruiters,
  insertRecruiter,
  updateRecruiter,
  deleteRecruiter,
} from '../lib/supabase'
import { Modal, useToast } from './ui'
import { IconPlus, IconLink, IconTrash, IconUsers } from './icons'

export default function RecruitersView() {
  const notify = useToast()
  const [rows, setRows] = useState<Recruiter[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', linkedin_url: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRecruiters()
      .then(setRows)
      .catch((e) => notify(e.message ?? 'Failed to load recruiters', 'err'))
      .finally(() => setLoading(false))
  }, [notify])

  const stats = useMemo(() => {
    const total = rows.length
    const messaged = rows.filter((r) => r.messaged).length
    const replied = rows.filter((r) => r.replied).length
    const replyRate = messaged > 0 ? Math.round((replied / messaged) * 100) : 0
    return { total, messaged, replied, replyRate }
  }, [rows])

  async function toggle(r: Recruiter, key: 'messaged' | 'replied') {
    const next = !r[key]
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, [key]: next } : x)))
    try {
      await updateRecruiter(r.id, { [key]: next })
    } catch (e) {
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, [key]: !next } : x)))
      notify(e instanceof Error ? e.message : 'Update failed', 'err')
    }
  }

  async function remove(id: number) {
    const prev = rows
    setRows((p) => p.filter((x) => x.id !== id))
    try {
      await deleteRecruiter(id)
      notify('Recruiter removed')
    } catch (e) {
      setRows(prev)
      notify(e instanceof Error ? e.message : 'Delete failed', 'err')
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      notify('Name is required', 'err')
      return
    }
    setSaving(true)
    try {
      const created = await insertRecruiter({
        name: form.name.trim(),
        linkedin_url: form.linkedin_url.trim() || null,
      })
      setRows((p) => [created, ...p])
      setForm({ name: '', linkedin_url: '' })
      setOpen(false)
      notify('Recruiter added')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Recruiters" value={stats.total} accent="#6366f1" />
        <MiniStat label="Messaged" value={stats.messaged} accent="#60a5fa" />
        <MiniStat label="Replied" value={stats.replied} accent="#34d399" />
        <MiniStat label="Reply rate" value={`${stats.replyRate}%`} accent="#fbbf24" />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#d4d4e4]">Technical recruiters</h3>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <IconPlus className="h-4 w-4" /> Add recruiter
        </button>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16 text-sm text-[--color-muted]">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="card grid place-items-center gap-3 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(99,102,241,0.12)] text-[#a5b4fc]">
            <IconUsers />
          </span>
          <p className="text-sm text-[--color-muted]">No recruiters yet. Track who you've reached out to.</p>
          <button className="btn btn-ghost" onClick={() => setOpen(true)}>
            <IconPlus className="h-4 w-4" /> Add your first recruiter
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-[--color-border]">
          {rows.map((r) => (
            <div key={r.id} className="group flex items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[--color-surface-2] text-sm font-semibold text-[#a5b4fc]">
                {r.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#eaeaf4]">{r.name}</p>
                {r.linkedin_url ? (
                  <a href={r.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[--color-muted] hover:text-[#a5b4fc]">
                    <IconLink className="h-3 w-3" /> LinkedIn
                  </a>
                ) : (
                  <span className="text-xs text-[#5a5a72]">No link</span>
                )}
              </div>
              <Toggle label="Messaged" active={r.messaged} color="#60a5fa" onClick={() => toggle(r, 'messaged')} />
              <Toggle label="Replied" active={r.replied} color="#34d399" onClick={() => toggle(r, 'replied')} />
              <button
                title="Remove"
                onClick={() => remove(r.id)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[--color-muted] opacity-0 transition-opacity hover:bg-[rgba(248,113,113,0.12)] hover:text-[#f87171] group-hover:opacity-100"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add recruiter">
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[--color-muted]">Name <span className="text-[#f87171]">*</span></span>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Recruiter" autoFocus />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[--color-muted]">LinkedIn URL</span>
            <input className="input" value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/…" />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[--color-muted]">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight" style={{ color: accent }}>{value}</p>
    </div>
  )
}

function Toggle({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all sm:inline-flex"
      style={{
        background: active ? `${color}1f` : 'var(--color-surface-2)',
        borderColor: active ? `${color}55` : 'var(--color-border)',
        color: active ? color : '#7a7a92',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? color : '#4a4a5e' }} />
      {label}
    </button>
  )
}
