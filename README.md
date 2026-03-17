# ai-ott-web

Next.js frontend for the AI OTT streaming platform.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Video | HLS.js |
| Deploy | Cloudflare Workers (via Cloudflare Pages) |
| Backend | [ai-ott-server](https://github.com/namyoungpark-2/ai-ott-server) |

---

## Local Development

### Prerequisites

- Node.js 20+
- The backend (`ai-ott-server`) running locally on port 8080

### 1. Clone and install

```bash
git clone https://github.com/namyoungpark-2/ai-ott-web.git
cd ai-ott-web
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Set true only if backend is not running (mock login: admin/admin)
MOCK_AUTH_ENABLED=false
```

### 3. Run

```bash
npm run dev
```

App runs on **http://localhost:3000**.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | Backend base URL |
| `MOCK_AUTH_ENABLED` | `false` | Enable mock login when backend is offline |

> In production (Cloudflare), set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL in the Cloudflare Pages dashboard under **Settings → Environment Variables**.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home feed |
| `/contents/[id]` | Content detail |
| `/watch/[id]` | Video player (HLS) |
| `/categories/[slug]` | Category browse |
| `/search` | Search |
| `/my-list` | Watchlist |
| `/admin` | Admin panel |
| `/upload` | Video upload |

---

## Auth Flow

1. User clicks 로그인 in the navbar → `LoginModal` opens
2. **Login tab**: `POST /api/auth/login` → proxied to backend `/auth/login`
3. **Signup tab**: `POST /api/auth/signup` → proxied to backend `/auth/signup`
4. On success, JWT and user info are stored in `localStorage`
5. The JWT is available via `useAuth().token` for authenticated API calls
6. Logout clears localStorage

Admin login (hardcoded `admin`/`admin`) goes to `POST /auth/admin/login` on the backend.

---

## API Proxy Routes

All backend calls go through Next.js proxy routes under `app/api/` to avoid exposing the backend URL on the client.

| Proxy route | Backend endpoint |
|-------------|-----------------|
| `POST /api/auth/login` | `/auth/login` |
| `POST /api/auth/signup` | `/auth/signup` |
| `GET /api/feed` | `/api/app/feed` |
| `GET /api/catalog/browse` | `/api/app/catalog/browse` |
| `GET /api/catalog/search` | `/api/app/catalog/search` |
| `GET /api/contents/[id]` | `/api/app/contents/:id` |

---

## Deployment (Cloudflare Pages)

### 1. Connect repository

In the Cloudflare dashboard → **Pages → Create a project** → connect your GitHub repo.

### 2. Build settings

| Setting | Value |
|---------|-------|
| Framework preset | Next.js |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |
| Node.js version | 20 |

### 3. Environment variables

In Cloudflare Pages → **Settings → Environment Variables**, add:

```
NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend>.onrender.com
```

### 4. Deploy

Push to `main` — Cloudflare Pages auto-deploys on every push.

### Troubleshooting: 403 on API routes

If you see **403 Forbidden** on `/api/*` routes after deployment, check in the Cloudflare dashboard:

- **Zero Trust → Access → Applications** — remove or add bypass rules for `/api/*`
- **Security → Bots → Bot Fight Mode** — disable if enabled
- **Security → Settings → Security Level** — set to Medium or lower
- **Security → WAF → Custom Rules** — check for rules blocking POST requests

---

## Project Structure

```
app/
  api/              ← Next.js Route Handler proxies (server-side)
  contents/[id]/    ← Content detail page
  watch/[id]/       ← HLS video player
  categories/[slug]/← Category browse
  search/           ← Search page
  admin/            ← Admin panel
  upload/           ← Video upload
  layout.tsx        ← Root layout (AuthProvider, GlobalNav)
  page.tsx          ← Home feed

components/
  AuthProvider.tsx  ← Auth context (login, signup, logout, JWT token)
  LoginModal.tsx    ← Login / signup modal
  GlobalNav.tsx     ← Top navigation bar
```
