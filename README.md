<div align="center">

# Smart Thesis Repository

**An AI-powered academic research platform for BSIT students to upload, discover, and analyze thesis papers.**

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

</div>

---

## Overview

The **Smart Thesis Repository** is a full-stack SaaS platform built for BSIT students and faculty. Students upload PDF thesis papers that are automatically indexed for full-text search and analyzed with AI. Advisers leave structured feedback. Admins manage submissions and users through a dedicated dashboard.

---

## Screenshots

> **Landing Page**
> ![Landing Page][screenshot-landing]

> **Thesis Repository with Search & Filters**
> ![Thesis Listing][screenshot-listing]

> **AI Research Tools**
> ![AI Tools][screenshot-ai]

> **Admin Dashboard**
> ![Admin Panel][screenshot-admin]

[screenshot-landing]: #
[screenshot-listing]: #
[screenshot-ai]: #
[screenshot-admin]: #

---

## Features

- **PDF Upload** — Drag-and-drop upload to Cloudinary with automatic text extraction via `pdf-parse`
- **Full-Text Search** — PostgreSQL `to_tsvector` / `plainto_tsquery` across title, abstract, and extracted content
- **AI Research Tools** — 5 Gemini-powered tools: summary, abstract, title suggestions, APA citation, related studies
- **Daily Rate Limiting** — Max 10 AI requests per user per day, tracked in the database
- **Role-Based Access** — Student · Admin · Adviser with distinct permission sets
- **Bookmarks** — Save and revisit any thesis with an optimistic-UI toggle
- **Comments** — Advisers and Admins leave structured feedback on thesis pages
- **Admin Panel** — Approve/reject submissions, manage users, platform-wide statistics
- **Dark Mode** — System-preference aware, persistent via `next-themes`
- **JWT Auth** — Stored in httpOnly cookies — not accessible to JavaScript
- **Responsive** — Mobile-first Tailwind layout throughout

---

## User Roles

| Role | Permissions |
|---|---|
| **STUDENT** | Register, upload theses, use AI tools, search, bookmark |
| **ADMIN** | All student permissions + approve/reject theses, manage users, view platform stats |
| **ADVISER** | View theses, post comments on student papers |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) (App Router) | React framework with server/client component model |
| [TypeScript](https://www.typescriptlang.org/) | Full type safety across all components and hooks |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling with dark mode support |
| [next-themes](https://github.com/pacocoursey/next-themes) | System-aware dark/light mode with persistence |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible component primitives |
| [Axios](https://axios-http.com/) | HTTP client with httpOnly cookie support |
| [lucide-react](https://lucide.dev/) | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | REST API server |
| [TypeScript](https://www.typescriptlang.org/) | Typed controllers, services, and middleware |
| [Prisma ORM](https://www.prisma.io/) | Type-safe database access |
| [Zod](https://zod.dev/) | Runtime validation on all request bodies |
| [Multer](https://github.com/expressjs/multer) | PDF file handling (memory storage) |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | Text extraction from uploaded PDFs |

### Database & Storage
| Technology | Purpose |
|---|---|
| [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) | Primary database (free tier) |
| [Cloudinary](https://cloudinary.com/) | PDF file storage and delivery (free tier) |

### AI & Auth
| Technology | Purpose |
|---|---|
| [Google Gemini 1.5 Flash](https://ai.google.dev/) | AI text generation (free tier) |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT — 7-day expiry, httpOnly cookie |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing (12 salt rounds) |

---

## Project Structure

```
Smart_Thesis_Repository/
├── backend/
│   ├── prisma/schema.prisma       # 7 Prisma models
│   ├── src/
│   │   ├── config/                # Prisma client singleton, Cloudinary
│   │   ├── controllers/           # auth, thesis, ai, bookmark, comment, admin
│   │   ├── services/              # Business logic + DB queries
│   │   ├── middleware/            # auth, role, upload
│   │   ├── routes/                # All Express routers
│   │   └── utils/                 # JWT, response helpers, pdf extractor
│   ├── server.ts
│   └── render.yaml                # Render deployment config
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/login, register
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/         # Role-aware stats
│   │   │   ├── thesis/            # Listing, upload, detail
│   │   │   ├── ai-tools/          # 5 Gemini tools
│   │   │   ├── bookmarks/
│   │   │   └── admin/             # Stats + user management
│   │   └── providers.tsx          # ThemeProvider + AuthProvider
│   ├── components/
│   │   ├── ai/                    # AiToolPanel, AiOutput
│   │   ├── layout/                # DashboardLayout (sidebar + dark toggle)
│   │   ├── shared/                # LoadingSkeleton, EmptyState, ErrorBanner,
│   │   │                          #   SearchBar, FilterBar, FileUpload
│   │   └── thesis/                # ThesisCard, ThesisDetail, BookmarkButton,
│   │                              #   CommentSection
│   ├── hooks/                     # useAuth, useThesis
│   ├── lib/api.ts                 # Axios instance
│   ├── types/index.ts             # All TypeScript interfaces
│   └── vercel.json                # Vercel deployment config
│
├── DEPLOYMENT.md                  # Step-by-step production deployment guide
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- [Supabase](https://supabase.com/) project (free tier)
- [Cloudinary](https://cloudinary.com/) account (free tier)
- [Google AI Studio](https://aistudio.google.com/) API key (free tier)

### Backend

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env

# Generate Prisma client and run migration
npx prisma generate
npx prisma migrate dev --name init

# Start development server (http://localhost:5000)
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Initialize shadcn/ui (first time only)
npx shadcn@latest init

# Start development server (http://localhost:3000)
npm run dev
```

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `JWT_SECRET` | Long random string (`openssl rand -base64 64`) |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `GEMINI_API_KEY` | From aistudio.google.com |
| `CLIENT_URL` | Frontend URL (e.g. `http://localhost:3000`) |
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |

### `frontend/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `http://localhost:5000`) |

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create account |
| `POST` | `/api/auth/login` | Public | Login, set JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear JWT cookie |
| `GET` | `/api/auth/me` | Required | Get current user |
| `GET` | `/api/theses` | Public | Paginated listing with search & filters |
| `GET` | `/api/theses/mine` | Required | Current user's own theses |
| `GET` | `/api/theses/:id` | Public | Full thesis with AI outputs & comments |
| `POST` | `/api/theses` | Required | Upload PDF thesis |
| `PATCH` | `/api/theses/:id/status` | Admin | Approve or reject |
| `POST` | `/api/ai/summarize/:id` | Required | Generate 3-paragraph summary |
| `POST` | `/api/ai/abstract/:id` | Required | Generate formal abstract |
| `POST` | `/api/ai/titles/:id` | Required | Suggest 5 alternative titles |
| `POST` | `/api/ai/citation/:id` | Required | Format APA 7th edition citation |
| `POST` | `/api/ai/related/:id` | Required | Suggest related research topics |
| `GET` | `/api/ai/outputs/:id` | Required | Saved AI outputs for thesis |
| `GET` | `/api/ai/usage` | Required | Today's AI request count |
| `POST` | `/api/bookmarks/:id` | Required | Toggle bookmark |
| `GET` | `/api/bookmarks` | Required | All bookmarked theses |
| `GET` | `/api/bookmarks/:id/status` | Required | Check if bookmarked |
| `GET` | `/api/comments/:id` | Required | Get comments on a thesis |
| `POST` | `/api/comments/:id` | Admin/Adviser | Post a comment |
| `GET` | `/api/admin/stats` | Admin | Platform statistics |
| `GET` | `/api/admin/theses` | Admin | All theses (no status filter) |
| `GET` | `/api/admin/users` | Admin | Paginated user list |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user + cascade |

---

## Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt, 12 salt rounds |
| Authentication | JWT (7-day expiry), `httpOnly` cookie |
| CORS | `CLIENT_URL` whitelist, `credentials: true` |
| Input validation | Zod on every request body |
| Role enforcement | `requireRole()` middleware on all protected routes |
| File validation | PDF mime check + 10 MB limit via Multer |
| AI rate limiting | Max 10 Gemini requests/user/day (DB-tracked) |
| Timing-safe login | bcrypt always runs even for non-existent emails |
| Cloudinary rollback | Uploaded file deleted if DB write fails |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

**Quick summary:**
1. **Supabase** — copy the PostgreSQL connection string
2. **Render** — connect GitHub repo, set env vars, deploy backend
3. **Vercel** — connect GitHub repo, set `NEXT_PUBLIC_API_URL`, deploy frontend
4. **Migrations** — run `npx prisma migrate deploy` in Render shell

---

## License

This project is licensed under the [MIT License](LICENSE).

```
MIT License — Copyright (c) 2025 Smart Thesis Repository

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to deal in the Software without restriction, including without
limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software.
```
