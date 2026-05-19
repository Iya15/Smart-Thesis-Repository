# Deployment Guide

Step-by-step instructions to deploy the Smart Thesis Repository to production.
Stack: **Supabase** (database) · **Render** (backend) · **Vercel** (frontend)

---

## Prerequisites

Before deploying, make sure you have accounts on:
- [Supabase](https://supabase.com) — PostgreSQL database (free tier)
- [Cloudinary](https://cloudinary.com) — PDF storage (free tier)
- [Google AI Studio](https://aistudio.google.com) — Gemini API key (free tier)
- [Render](https://render.com) — backend hosting (free tier)
- [Vercel](https://vercel.com) — frontend hosting (free tier)
- [GitHub](https://github.com) — source code hosting

---

## Step 1 — Supabase (Database)

> Your Supabase project should already be set up from development. This step confirms credentials.

1. Go to [supabase.com](https://supabase.com) → open your project
2. Navigate to **Settings → Database**
3. Scroll to **Connection string** → select **URI** format
4. Copy the string — it looks like:
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
5. Save this as `DATABASE_URL` — you will need it in Step 3

> **Important:** Use the **Transaction** or **Session** pooler URL if available, not the direct connection, for better connection handling on Render's free tier.

---

## Step 2 — Cloudinary (File Storage)

> Already set up in development. Confirm your credentials.

1. Go to [cloudinary.com](https://cloudinary.com) → Dashboard
2. Copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Save these as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Step 3 — Deploy Backend to Render

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to [render.com](https://render.com) → **New → Web Service**
   - Connect your GitHub repository
   - Set **Root Directory** to `backend`
   - Render will auto-detect the `render.yaml` configuration

3. **Set environment variables** (in Render dashboard → Environment)

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Supabase connection string |
   | `JWT_SECRET` | A long random string (`openssl rand -base64 64`) |
   | `CLOUDINARY_CLOUD_NAME` | From Step 2 |
   | `CLOUDINARY_API_KEY` | From Step 2 |
   | `CLOUDINARY_API_SECRET` | From Step 2 |
   | `GEMINI_API_KEY` | From aistudio.google.com |
   | `CLIENT_URL` | Your Vercel frontend URL (set after Step 4) |
   | `NODE_ENV` | `production` |

4. **Deploy** — click Deploy. Wait ~3 minutes for the first build.

5. **Copy your Render URL** — it looks like `https://thesis-repo-api.onrender.com`
   - Test it: `GET https://your-render-url.onrender.com/api/health`
   - Should return: `{ "status": "ok" }`

---

## Step 4 — Deploy Frontend to Vercel

1. **Create a new project on Vercel**
   - Go to [vercel.com](https://vercel.com) → **New Project**
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

2. **Set environment variable**

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Your Render URL from Step 3 (e.g. `https://thesis-repo-api.onrender.com`) |

3. **Deploy** — click Deploy. Vercel builds in ~1 minute.

4. **Copy your Vercel URL** — it looks like `https://smart-thesis.vercel.app`

5. **Update `CLIENT_URL` on Render** — go back to Render → Environment Variables → set `CLIENT_URL` to your Vercel URL → redeploy.

---

## Step 5 — Run Database Migrations on Production

The first deployment needs to run Prisma migrations against the Supabase database.

**Option A: Render Shell** (recommended)
1. Go to Render dashboard → your web service → **Shell** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

**Option B: Local machine**
1. Set your local `DATABASE_URL` to the Supabase production string
2. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

---

## Step 6 — Verify the Deployment

Run through this checklist end-to-end:

- [ ] `GET /api/health` returns `{ "status": "ok" }` on the Render URL
- [ ] Landing page loads at the Vercel URL
- [ ] Register a new account → login → see dashboard
- [ ] Upload a PDF thesis → verify it appears in Cloudinary
- [ ] Run an AI tool → verify the result is generated and saved
- [ ] Admin account can approve/reject theses

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Backend crashes with `GEMINI_API_KEY is not configured` | Add the env var on Render and redeploy |
| CORS errors in browser | Set `CLIENT_URL` on Render to your exact Vercel URL (no trailing slash) |
| `prisma migrate deploy` fails | Confirm `DATABASE_URL` is the Supabase connection string with correct password |
| Render service sleeps (free tier) | Free tier spins down after 15 min inactivity — first request after sleep takes ~30s |
| Cloudinary upload 401 | Verify all three Cloudinary env vars match your dashboard |
| JWT cookie not sent | Ensure frontend `NEXT_PUBLIC_API_URL` does NOT have a trailing slash |

---

## Re-deploying

- **Backend changes**: `git push origin main` → Render auto-deploys from the connected branch
- **Frontend changes**: `git push origin main` → Vercel auto-deploys
- **Schema changes**: After deploying backend, run `npx prisma migrate deploy` in the Render shell
