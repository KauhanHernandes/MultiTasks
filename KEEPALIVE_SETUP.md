# Supabase Keepalive Setup Guide

## Overview
This project includes a **dual-layer keepalive system** to prevent Supabase from pausing your project after 7 days of inactivity (free plan limit):

| Layer | Frequency | Runs When | Cost |
|-------|-----------|-----------|------|
| **GitHub Actions (Primary)** | Every 6 days | 24/7, server-side | Free (GitHub Actions minutes) |
| **GitHub Actions (Backup)** | Daily | 24/7, server-side | Free |
| **Client-side (React Hook)** | When tab visible | User has app open | Free |

---

## Required GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard → Settings → API → `anon` `public` key |

### Optional: Slack Notifications (for failures)
| Secret Name | Value |
|-------------|-------|
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/services/...` |

---

## How It Works

### 1. Database Function (Already Applied)
The migration `20260428000837_create_keepalive_function.sql` creates:
- `keepalive_log` table - stores ping timestamps
- `update_keepalive()` function - updates timestamp, cleans old entries (>7 days)

### 2. GitHub Actions Workflows

**`.github/workflows/supabase-keepalive.yml`** (Primary)
- Runs **every 6 days at 03:00 UTC**
- Calls `POST /rest/v1/rpc/update_keepalive`
- Well within the 7-day limit with 1-day buffer

**`.github/workflows/supabase-keepalive-daily.yml`** (Backup)
- Runs **daily at 04:00 UTC**
- Lightweight - same RPC call
- Catches any missed 6-day runs

### 3. Client-side Hook (`useKeepalive.ts`)
- **Only runs when browser tab is visible** (saves resources)
- Checks every hour, but only pings if >5.5 days since last ping
- Also pings immediately when user returns to tab
- Uses `console.debug` (hidden by default) instead of `console.log`

---

## Free Plan Optimization

| Strategy | Why It Matters |
|----------|----------------|
| **6-day schedule** | Maximum buffer before 7-day pause |
| **03:00 UTC** | Off-peak, less likely to hit rate limits |
| **Minimal permissions** | `contents: read` only |
| **2-minute timeout** | Prevents runaway workflows |
| **Daily backup** | Redundancy without extra cost |
| **Client visibility check** | Zero cost when users aren't active |

---

## Testing

### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **Supabase Keepalive** workflow
3. Click **Run workflow** → **Run workflow**

### Verify in Supabase
```sql
-- Check keepalive logs
SELECT * FROM keepalive_log ORDER BY created_at DESC LIMIT 10;

-- Check last successful ping
SELECT MAX(last_ping) as last_keepalive FROM keepalive_log;
```

---

## Monitoring

### GitHub Actions
- **Actions tab** → Shows all runs with ✅/❌ status
- **Workflow run logs** → Detailed HTTP response from Supabase

### Optional: Slack Alerts
Add `SLACK_WEBHOOK_URL` secret to get notified only on failures.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Check `SUPABASE_ANON_KEY` is correct |
| `404 Not Found` | Verify `SUPABASE_URL` format (no trailing slash) |
| `500 Internal Error` | Run migration `20260428000837_create_keepalive_function.sql` in Supabase SQL Editor |
| Workflow not triggering | Check cron syntax, ensure repo has Actions enabled |

---

## Cost Estimate (Free Tier)

| Resource | Monthly Usage | Free Limit |
|----------|---------------|------------|
| GitHub Actions (Linux) | ~10 min/month (2 workflows × ~5 runs × 1 min) | 2,000 min/month |
| Supabase API calls | ~10 calls/month | Unlimited on free plan |

**Total: Well within free limits** ✅