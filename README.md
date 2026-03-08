# PawStore — Petstore API Frontend

A React SPA built against the [Swagger Petstore API](https://petstore.swagger.io/v2).

## Tech Stack

| Tool | Purpose |
|---|---|
| **Vite** | Build tooling & dev server |
| **React 18** + TypeScript | UI framework |
| **TailwindCSS** | Utility-first styling |
| **shadcn/ui** (Radix primitives) | Accessible UI components |
| **Jotai** | Atomic global state management |
| **Lucide React** | Icons |

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Features

### 🐾 Pets
- Browse pets filtered by status (available / pending / sold)
- Search by name or category
- Add new pets with name, category, photo URL, and status
- Edit or delete existing pets
- Detailed pet view with tags, photo, and metadata

### 🛍️ Store
- Live inventory breakdown by status category
- Order lookup by ID with shipment details

### 👤 Users
- Login / Logout with session token display
- User lookup by username
- Create new users

## Architecture

```
src/
├── api/
│   └── petstore.ts       # Typed API client (petApi, storeApi, userApi)
├── atoms/
│   └── index.ts          # Jotai atoms for all global state
├── components/
│   ├── ui/               # Reusable UI primitives (Button, Input, Badge, Dialog, Select)
│   └── Toast.tsx         # Toast notification system
├── pages/
│   ├── PetsPage.tsx
│   ├── StorePage.tsx
│   └── UsersPage.tsx
├── lib/
│   └── utils.ts          # cn() helper
├── App.tsx               # Root layout + tab navigation
└── main.tsx              # Jotai Provider + React root
```

## State Management (Jotai)

State is broken into focused atoms in `src/atoms/index.ts`:

- **UI atoms**: `activeTabAtom`, `modalAtom`
- **Pets atoms**: `petStatusFilterAtom`, `petSearchQueryAtom`, `petsAtom`, `petsLoadingAtom`, `petsErrorAtom`
- **Store atoms**: `inventoryAtom`, `orderLookupIdAtom`, `lookedUpOrderAtom`
- **User atoms**: `usernameSearchAtom`, `lookedUpUserAtom`, `userLoadingAtom`
- **Auth atoms** (persisted via `atomWithStorage`): `authTokenAtom`, `loggedInUsernameAtom`
- **Toast atom**: `toastsAtom`

## Time Spent

| Phase | Time |
|---|---|
| API analysis & architecture planning | ~20 min |
| Project scaffolding (Vite, Tailwind, TS config) | ~20 min |
| API client (`src/api/petstore.ts`) | ~20 min |
| Jotai atoms design | ~15 min |
| UI components (Button, Input, Badge, Dialog, Select) | ~30 min |
| PetsPage (list, filter, add/edit/delete/view) | ~45 min |
| StorePage (inventory, order lookup) | ~25 min |
| UsersPage (auth, user lookup, create) | ~30 min |
| App layout + nav + Toast system | ~20 min |
| Polish, README | ~15 min |
| **Total** | **~3.5 hours** |

## Notes & Tradeoffs

- **No router**: The app uses tab-based navigation via Jotai atom rather than React Router — appropriate for a single-domain tool of this scope.
- **Petstore API quirks**: The demo API at `petstore.swagger.io` is shared and mutable, so data may be inconsistent between fetches. Mutations (add/edit/delete) are real but the server resets periodically.
- **Auth**: Login persists the session token to localStorage via `atomWithStorage`. The API's auth doesn't gate most endpoints in practice, but the UI reflects signed-in state correctly.
- **Photo URLs**: Many pets in the demo API have invalid or placeholder photo URLs; the UI gracefully falls back to a paw icon.
- **Error handling**: All API calls have try/catch with user-facing toast notifications.
