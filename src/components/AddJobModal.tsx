import { useState } from 'react'
import { Modal, useToast } from './ui'
import { insertJob } from '../lib/supabase'
import { STATUSES, EXPERIENCE_LEVELS } from '../types'
import type { Job } from '../types'

function deriveJobId(url: string): string {
  const m = url.match(/(?:jobs\/view\/|currentJobId=)(\d+)/)
  if (m) return m[1]
  return `manual-${Date.now()}`
}

export default function AddJobModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (job: Job) => void
}) {
  const notify = useToast()
  const [saving, setSaving] = useState(false)
  const [f, setF] = useState({
    job_title: '',
    company: '',
    location: '',
    job_url: '',
    experience_level: 'Entry Level',
    status: 'To Apply',
    easy_apply: false,
    min_experience: '',
  })

  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }))

  const reset = () =>
    setF({
      job_title: '',
      company: '',
      location: '',
      job_url: '',
      experience_level: 'Entry Level',
      status: 'To Apply',
      easy_apply: false,
      min_experience: '',
    })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.job_title.trim()) {
      notify('Job title is required', 'err')
      return
    }
    setSaving(true)
    try {
      const job = await insertJob({
        job_id: deriveJobId(f.job_url),
        job_title: f.job_title.trim(),
        company: f.company.trim() || null,
        location: f.location.trim() || null,
        job_url: f.job_url.trim() || null,
        experience_level: f.experience_level,
        status: f.status,
        easy_apply: f.easy_apply ? 'Yes' : null,
        min_experience_years: f.min_experience.trim() === '' ? null : Number(f.min_experience),
      })
      onAdded(job)
      notify('Job added')
      reset()
      onClose()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add job', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a job">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Job title" required>
          <input className="input" value={f.job_title} onChange={(e) => set('job_title', e.target.value)} placeholder="Software Engineer" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company">
            <input className="input" value={f.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Inc." />
          </Field>
          <Field label="Location">
            <input className="input" value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="San Francisco, CA" />
          </Field>
        </div>
        <Field label="Job URL">
          <input className="input" value={f.job_url} onChange={(e) => set('job_url', e.target.value)} placeholder="https://linkedin.com/jobs/view/..." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Experience level">
            <select className="input" value={f.experience_level} onChange={(e) => set('experience_level', e.target.value)}>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" value={f.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Min experience required (years)">
          <input
            className="input"
            type="number"
            min={0}
            max={30}
            value={f.min_experience}
            onChange={(e) => set('min_experience', e.target.value)}
            placeholder="e.g. 0"
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#cbd5e1]">
          <input
            type="checkbox"
            checked={f.easy_apply}
            onChange={(e) => set('easy_apply', e.target.checked)}
            className="h-4 w-4 accent-[--color-accent]"
          />
          Easy Apply available
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Add job'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[--color-muted]">
        {label} {required && <span className="text-[#f87171]">*</span>}
      </span>
      {children}
    </label>
  )
}
