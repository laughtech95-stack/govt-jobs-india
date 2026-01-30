# Govt Jobs India — Production MVP

This is the production‑grade MVP for the Govt Jobs India platform.

## Stack (free)
- Cloudflare Pages (frontend hosting)
- Supabase (DB + auth + storage) — free tier
- GitHub Actions (daily ingestion cron)

## What’s included
- Responsive frontend with filters and search
- Demo data via `web/jobs.json`
- Subscription form (ready to connect to Supabase)
- Ingestion script placeholders

## Local preview
Open `web/index.html` in your browser.

## Deploy (Cloudflare Pages)
1. Create a GitHub repo and push this `/prod` folder.
2. In Cloudflare Pages: “Create a project → Connect GitHub”.
3. Build settings:
   - Framework: `None`
   - Build command: *(empty)*
   - Output directory: `web`
4. Deploy.

## API key setup (required for data.gov.in)
Add your key as a GitHub secret:
- Repo → Settings → Secrets and variables → Actions → New secret
- Name: `DATA_GOV_API_KEY`
- Value: your data.gov.in API key

## Supabase setup (when ready)
Create a project and add the following tables:

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  state text,
  qualification text,
  age_max int,
  posted_date date,
  deadline date,
  source_url text,
  source_name text,
  raw jsonb,
  created_at timestamp with time zone default now()
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  created_at timestamp with time zone default now()
);
```

## WhatsApp (later)
Meta WhatsApp Business Platform is paid per conversation. We’ll integrate after validation.

## Roadmap
- Connect real sources (NCS + data.gov.in + selected boards)
- Daily ingestion + de‑duplication
- Email/WhatsApp alerts
- Admin dashboard
