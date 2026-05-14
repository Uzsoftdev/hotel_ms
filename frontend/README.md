# 🖥️ Frontend — allStay Hotel Management System

The frontend is a **React 18 single-page application** (SPA) built with Vite. It serves public-facing hotel browsing pages, an authenticated user portal (bookings, wishlist, profile, reviews), a staff dashboard, and a full admin panel. It is served as static assets via Nginx, with all API traffic proxied to the FastAPI backend.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Pages & Routing](#pages--routing)
4. [State & Data Management](#state--data-management)
5. [Internationalisation (i18n)](#internationalisation-i18n)
6. [Styling](#styling)
7. [Environment Variables](#environment-variables)
8. [Local Development](#local-development)
9. [Production Build](#production-build)
10. [Code Quality](#code-quality)

---

## Tech Stack

| Concern | Library / Tool | Version |
|---|---|---|
| UI framework | React | 18.3 |
| Build tool | Vite | 7.x |
| Routing | React Router DOM | 6.28 |
| HTTP client | Axios | 1.15 |
| i18n | i18next + react-i18next | 26 / 17 |
| Styling | Tailwind CSS | 3.4 |
| Auth (public) | `@supabase/supabase-js` | 2.105 |
| Linting | ESLint | — |

---

## Project Structure

```
frontend/
├── package.json                  # Workspace-level package.json
└── react-app/
    ├── index.html                # App shell (entry point for Vite)
    ├── vite.config.js            # Vite config (proxy rules, plugins)
    ├── tailwind.config.js        # Tailwind theme customisation
    ├── postcss.config.js         # PostCSS pipeline
    ├── .eslintrc.js              # ESLint rules
    ├── .env.production           # Production env overrides
    ├── public/                   # Static assets served as-is (favicons, etc.)
    ├── dist/                     # Build output (gitignored, served by Nginx)
    └── src/
        ├── main.jsx              # React DOM root, i18n bootstrap, router provider
        ├── App.jsx               # Top-level route tree & layout selection
        ├── App.css / styles.css  # Global styles & utility classes
        ├── assets/               # Images, SVGs, fonts imported by components
        ├── components/
        │   ├── admin/            # Admin-panel-specific components
        │   ├── common/           # Shared UI (Button, Modal, Spinner, Toast…)
        │   ├── public/           # Hotel cards, search bar, booking widget…
        │   ├── staff/            # Staff-facing dashboards
        │   └── user/             # User portal components (profile, bookings…)
        ├── contexts/             # React Context providers (Auth, Notifications…)
        ├── data/                 # Static JSON / seed data consumed by the UI
        ├── hooks/                # Custom React hooks (useAuth, useBooking…)
        ├── layouts/              # Page shell layouts (AdminLayout, UserLayout…)
        ├── lib/                  # Third-party client wrappers (axios instance, supabase)
        ├── locales/              # i18n translation files
        │   ├── en/               # English namespace JSONs
        │   └── uz/               # Uzbek namespace JSONs
        ├── pages/
        │   ├── admin/            # Admin panel pages
        │   ├── auth/             # Login, register, forgot-password pages
        │   ├── public/           # Home, hotel listing, hotel detail, about…
        │   ├── staff/            # Staff management views
        │   └── user/             # My bookings, wishlist, profile, reviews
        ├── routes/               # Route definitions & protected-route guards
        ├── services/             # API service modules (one file per resource)
        ├── styles/               # Component-scoped CSS modules
        └── utils/                # Helper functions (date formatting, currency…)
```

---

## Pages & Routing

Routing is handled by **React Router v6** with nested layouts. Protected routes check the auth context before rendering.

| Path | Page | Access |
|---|---|---|
| `/` | Home / Hotel listing | Public |
| `/hotels/:id` | Hotel detail & room browser | Public |
| `/search` | Full-text search results | Public |
| `/about` | About page | Public |
| `/login` | Login | Guest only |
| `/register` | Registration | Guest only |
| `/forgot-password` | Password reset | Guest only |
| `/user/bookings` | My bookings | Authenticated |
| `/user/profile` | Profile settings | Authenticated |
| `/user/wishlist` | Saved hotels | Authenticated |
| `/user/reviews` | My reviews | Authenticated |
| `/admin/*` | Admin panel | Admin role |
| `/staff/*` | Staff dashboard | Staff role |

---

## State & Data Management

- **Authentication state** is held in `AuthContext` and persisted via JWT tokens stored in `httpOnly` cookies (set by the backend).
- **Notifications** are managed by a dedicated context that subscribes to the WebSocket (`/ws/`) for real-time updates.
- **Server state** (hotel listings, bookings, etc.) is fetched directly with **Axios** in service modules. There is no global cache layer — components re-fetch on mount when needed.
- The Axios instance in `src/lib/` automatically attaches the `Authorization` header from the auth context and handles 401 token refresh.

---

## Internationalisation (i18n)

The app supports **English (`en`)** and **Uzbek (`uz`)** via `i18next`.

```
src/locales/
├── en/
│   ├── public-translations.json  # Public pages (home, about, hotel detail…)
│   ├── admin-translations.json   # Admin panel labels
│   └── …
└── uz/
    └── …
```

- Translations are split into namespaces (one JSON file per feature area).
- The active language is persisted in `localStorage` and defaults to the browser locale.
- Translation keys follow the format `namespace.section.key` (e.g. `about.team.members`).
- `returnObjects: true` is used where a translation key maps to an array (e.g. team member lists, feature bullet points).

### Switching Language

```jsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation('public-translations');
i18n.changeLanguage('uz');
```

---

## Styling

- **Tailwind CSS v3** is the primary styling system. Configuration lives in `tailwind.config.js`.
- Global resets and custom utility classes are in `src/styles.css`.
- Component-specific overrides use CSS Modules in `src/styles/`.
- The design follows the **Azure Horizon** design handoff (`/design_handoff_azure_horizon/` at the project root).

---

## Environment Variables

Vite exposes variables prefixed with `VITE_` to the browser bundle.

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for all backend API calls | `http://localhost:8000` |

Create a `.env.local` file in `react-app/` for local overrides:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

> **Never commit** secrets to `.env.production`. That file only contains the production API base URL.

---

## Local Development

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Steps

```bash
# 1. Install dependencies
cd frontend/react-app
npm install

# 2. Create a local env file
cp .env.production .env.local
# Edit VITE_API_BASE_URL to point at your running backend

# 3. Start the dev server with HMR
npm run dev
```

The app is served at **http://localhost:5173** by default. Vite's dev server proxies `/api/*` and `/ws/*` to the backend (configured in `vite.config.js`).

---

## Production Build

```bash
cd frontend/react-app
npm run build
```

Output is written to `react-app/dist/`. The Docker Compose setup mounts this directory into the `nginx_static` container.

```bash
# Preview the production build locally
npm run preview
```

---

## Code Quality

```bash
# Run ESLint
cd frontend/react-app
npx eslint src/

# Format with Prettier (config at project root .prettierrc)
npx prettier --write src/
```

Linting rules are defined in `.eslintrc.js`. The project uses Prettier for consistent formatting with the root `.prettierrc` configuration.
