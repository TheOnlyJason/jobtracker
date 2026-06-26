# JobTracker

A job-application tracking platform built on **React + Vite + TypeScript + Tailwind v4**, wired to a **Supabase** Postgres backend.

It works directly against your existing `jobs` and `technical_recruiters` tables — no schema changes required.

## Features

- **Dashboard** — totals, applied count, active pipeline, response rate, pipeline-by-status bars, and top companies.
- **Jobs** — searchable / sortable table with status-filter pills, inline status editing (writes straight to Supabase), Easy-Apply / repost badges, open-posting link, and delete with confirmation.
- **Board** — Kanban view across `To Apply → Applied → Interviewing → Offer → Rejected → Ghosted` with drag-and-drop to change status.
- **Recruiters** — track technical recruiters with messaged / replied toggles and a reply-rate stat.
- Add jobs via a modal (auto-extracts the LinkedIn job id from a pasted URL).

## Setup

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + key
npm run dev            # http://localhost:5173
```

### Environment

`.env` (already created for this project):

```
VITE_SUPABASE_URL=https://efizzdriuiboeyioiuiv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

The publishable key is safe to ship in client code.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build |

## Data model

| Table | Columns used |
| --- | --- |
| `jobs` | `job_id`, `job_title`, `company`, `location`, `job_url`, `experience_level`, `status`, `easy_apply`, `repost`, `date_added` |
| `technical_recruiters` | `name`, `linkedin_url`, `messaged`, `replied` |

## ⚠️ Security note

Both tables currently have **Row Level Security (RLS) disabled**. Anyone with the
publishable key (which ships in the browser bundle) can read and write every row.
That's fine for a private, single-user tool, but if you deploy this publicly you
should add Supabase Auth and RLS policies. See the project notes for the migration.
