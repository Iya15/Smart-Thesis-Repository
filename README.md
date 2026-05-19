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

The **Smart Thesis Repository** is a SaaS-style academic platform built for BSIT students and faculty. Students can upload PDF thesis papers, which are automatically indexed for full-text search and ready for AI-powered analysis. Advisers and admins can review, comment on, and manage submissions through a clean dashboard interface.

---

## Features

| Feature | Description |
|---|---|
| **PDF Upload** | Drag-and-drop PDF upload to Cloudinary with automatic text extraction |
| **Full-Text Search** | PostgreSQL `to_tsvector` / `plainto_tsquery` search across title, abstract, and extracted content |
| **AI Research Tools** | 5 Gemini-powered tools: summary, abstract, title suggestions, APA citation, related studies |
| **Role-Based Access** | Student · Admin · Adviser — each with different permissions |
| **Bookmarks** | Save and revisit any thesis with a single click |
| **Comments** | Advisers and admins leave feedback directly on thesis pages |
| **Admin Panel** | Approve or reject thesis submissions |
| **Secure Auth** | JWT stored in httpOnly cookies — no localStorage exposure |

---

## User Roles

| Role | Permissions |
|---|---|
| **STUDENT** | Register, upload theses, use AI tools, search, bookmark |
| **ADMIN** | All student permissions + approve/reject theses, manage users, post comments |
| **ADVISER** | View theses, post comments on student papers |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) (App Router) | React framework with server/client component model |
| [TypeScript](https://www.typescriptlang.org/) | Full type safety across all components and hooks |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible component primitives |
| [Axios](https://axios-http.com/) | HTTP client with httpOnly cookie support (`withCredentials: true`) |
| [lucide-react](https://lucide.dev/) | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | REST API server |
| [TypeScript](https://www.typescriptlang.org/) | Typed controllers, services, and middleware |
| [Prisma ORM](https://www.prisma.io/) | Type-safe database access |
| [Zod](https://zod.dev/) | Runtime validation on all request bodies |
| [Multer](https://github.com/expressjs/multer) | PDF file handling (memory storage) |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | Extracts text content from uploaded PDFs |

### Database & Storage
| Technology | Purpose |
|---|---|
| [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) | Primary database (free tier) |
| [Cloudinary](https://cloudinary.com/) | PDF file storage and delivery (free tier) |

### AI
| Technology | Purpose |
|---|---|
| [Google Gemini 1.5 Flash](https://ai.google.dev/) | AI text generation (free tier) |

### Authentication
| Technology | Purpose |
|---|---|
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT generation and verification |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing (12 salt rounds) |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | httpOnly cookie parsing |

### Deployment
| Service | Hosts |
|---|---|
| [Vercel](https://vercel.com/) | Next.js frontend |
| [Render](https://render.com/) | Express.js backend |
| [Supabase](https://supabase.com/) | PostgreSQL database |

---

## Project Structure

```
Smart_Thesis_Repository/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (7 models)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts              # Prisma client singleton
│   │   │   └── cloudinary.ts      # Cloudinary + multer storage config
│   │   ├── controllers/           # Request handlers (thin layer)
│   │   │   ├── auth.controller.ts
│   │   │   ├── thesis.controller.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── bookmark.controller.ts
│   │   │   └── comment.controller.ts
│   │   ├── services/              # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── thesis.service.ts
│   │   │   ├── file.service.ts    # Cloudinary upload/delete
│   │   │   ├── ai.service.ts      # Gemini integration + rate limiting
│   │   │   ├── bookmark.service.ts
│   │   │   └── comment.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT cookie verification
│   │   │   ├── role.middleware.ts  # Role-based access control
│   │   │   └── upload.middleware.ts # Multer PDF filter + size limit
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── thesis.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── bookmark.routes.ts
│   │   │   └── comment.routes.ts
│   │   ├── utils/
│   │   │   ├── jwt.util.ts         # signToken / verifyToken
│   │   │   ├── response.util.ts    # Unified success/error helpers
│   │   │   └── pdf.util.ts         # extractTextFromBuffer
│   │   ├── types/
│   │   │   └── express.d.ts        # req.user type extension
│   │   └── app.ts                  # Express app setup
│   ├── server.ts                   # Entry point
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx           # Auth-protected shell
    │   │   ├── dashboard/page.tsx
    │   │   ├── thesis/
    │   │   │   ├── page.tsx         # Thesis listing + search
    │   │   │   ├── upload/page.tsx
    │   │   │   └── [id]/page.tsx    # Thesis detail
    │   │   ├── ai-tools/page.tsx
    │   │   └── bookmarks/page.tsx
    │   ├── layout.tsx               # Root layout + AuthProvider
    │   ├── page.tsx                 # Landing page
    │   └── providers.tsx            # Client-side context wrapper
    ├── components/
    │   ├── ai/
    │   │   ├── AiToolPanel.tsx      # 5 tool buttons + usage counter
    │   │   └── AiOutput.tsx         # Output display + copy button
    │   ├── layout/
    │   │   └── DashboardLayout.tsx  # Sidebar + top navbar
    │   ├── shared/
    │   │   ├── FileUpload.tsx       # Drag-and-drop PDF uploader
    │   │   ├── SearchBar.tsx        # Debounced search input
    │   │   └── FilterBar.tsx        # Year / course / status filters
    │   └── thesis/
    │       ├── ThesisCard.tsx
    │       ├── ThesisDetail.tsx
    │       ├── BookmarkButton.tsx   # Optimistic toggle
    │       └── CommentSection.tsx   # Live comments + form
    ├── hooks/
    │   ├── useAuth.ts               # AuthContext + AuthProvider
    │   └── useThesis.ts
    ├── lib/
    │   └── api.ts                   # Axios instance (withCredentials)
    └── types/
        └── index.ts                 # All TypeScript interfaces
```

---

## Database Schema

```
User          — id, name, email, password, role (STUDENT|ADMIN|ADVISER)
Thesis        — id, title, abstract, fileUrl, extractedText, status, year, course
Tag           — id, name (unique)  ←→  Thesis (many-to-many)
AiOutput      — id, thesisId, type (SUMMARY|ABSTRACT|…), content
Bookmark      — id, userId, thesisId  (@@unique)
Comment       — id, thesisId, authorId, content
AiUsage       — id, userId, type, usedAt  (daily rate limit tracking)
```

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
| `POST` | `/api/ai/abstract/:id` | Required | Generate 150–250 word abstract |
| `POST` | `/api/ai/titles/:id` | Required | Suggest 5 alternative titles |
| `POST` | `/api/ai/citation/:id` | Required | Format APA 7th edition citation |
| `POST` | `/api/ai/related/:id` | Required | Suggest 5 related research topics |
| `GET` | `/api/ai/outputs/:id` | Required | Get saved AI outputs for thesis |
| `GET` | `/api/ai/usage` | Required | Today's AI request count |
| `POST` | `/api/bookmarks/:id` | Required | Toggle bookmark |
| `GET` | `/api/bookmarks` | Required | Get all bookmarked theses |
| `GET` | `/api/bookmarks/:id/status` | Required | Check if thesis is bookmarked |
| `GET` | `/api/comments/:id` | Required | Get comments on a thesis |
| `POST` | `/api/comments/:id` | Admin/Adviser | Post a comment |

---

## Security

| Measure | Implementation |
|---|---|
| **Password hashing** | bcrypt with 12 salt rounds |
| **Authentication** | JWT (7-day expiry) stored in `httpOnly` cookie — not accessible to JavaScript |
| **CORS** | Whitelist `CLIENT_URL` only, `credentials: true` |
| **Input validation** | Zod schemas on every request body |
| **Role enforcement** | `requireRole()` middleware stacked on protected routes |
| **File validation** | PDF mime type check + 10 MB size limit via Multer |
| **AI rate limiting** | Max 10 Gemini requests per user per day (tracked in DB) |
| **Timing-safe login** | bcrypt compare always runs even for nonexistent emails |
| **Cloudinary rollback** | Uploaded file deleted from Cloudinary if DB write fails |

---

## Environment Variables

### Backend — `backend/.env`
```env
DATABASE_URL=          # PostgreSQL connection string from Supabase
JWT_SECRET=            # Long random string (openssl rand -base64 64)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=        # From aistudio.google.com
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Frontend — `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier)
- A [Cloudinary](https://cloudinary.com/) account (free tier)
- A [Google AI Studio](https://aistudio.google.com/) API key (free tier)

### Backend
```bash
cd backend
npm install

# Copy and fill in your environment variables
cp .env.example .env

# Generate Prisma client and run initial migration
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npx ts-node server.ts
# → Server running on port 5000
```

### Frontend
```bash
cd frontend
npm install

# Create env file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Initialize shadcn/ui (first time only)
npx shadcn@latest init

# Start development server
npm run dev
# → http://localhost:3000
```

---

## Architecture

The project follows **clean layered architecture** throughout:

```
Request → Route → Middleware → Controller → Service → Database
```

- **Routes** — wire HTTP methods to controllers and stack middleware
- **Middleware** — auth, role checks, file upload handling
- **Controllers** — validate input (Zod), call services, format responses
- **Services** — all business logic, DB queries, external API calls
- **Utils** — pure helpers (JWT, response shaping, PDF extraction)

---

<div align="center">
  <sub>Built with Next.js 14, Express.js, PostgreSQL, and Google Gemini AI</sub>
</div>
