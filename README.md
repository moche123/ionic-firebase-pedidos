# Delivery App

A small Ionic + Angular mock food ordering app: browse products, add them to a cart, check out, and manage your profile. Includes a simple admin screen for managing the product catalog.

The backend is swappable: the app runs against an in-memory **mock backend** by default (no setup required) or against a real **Firebase** project.

## Stack

| | |
|---|---|
| Framework | Angular 20 (standalone components, signals) |
| UI | Ionic 9 |
| Backend | Firebase (Firestore, Auth, Storage) via `@angular/fire` 20, or a built-in mock |
| Language | TypeScript |

## Quick start (mock backend, default)

No Firebase project needed — the app runs entirely against fake, in-memory data (persisted to your browser's `localStorage` so it survives a refresh).

```bash
npm install
npm start
```

Then open http://localhost:4200. You can browse the seeded products, register/log in with any email+password (accounts are stored locally, not really validated against anything), add items to your cart, and check out. There's also an admin screen at `/admin/products` for adding/editing/deleting products.

## Running against Firebase

```bash
npm run start:firebase
```

This swaps in `src/environments/environment.firebase.ts`, which points at a real Firebase project (Firestore + Auth + Storage). The repo ships with the config for the project this app was originally built against — **replace it with your own project's config** before deploying your own copy (Firebase Console → Project settings → Your apps). A Firebase web config is not a secret; access is controlled by your Firestore/Storage/Auth security rules, not by hiding these values.

Expected Firestore layout:

```
Products/{productId}
Customers/{uid}
Customers/{uid}/cart/{uid}
```

## How the mock/Firebase split works

The app never talks to Firebase or `localStorage` directly from components. Everything goes through three small interfaces in `src/app/core/ports/`:

- `AuthPort` — login/register/logout/auth state
- `DatabasePort` — CRUD + collection reads
- `StoragePort` — image upload

Each has two implementations — `src/app/core/firebase/*` (real `@angular/fire` v20 modular API) and `src/app/core/mock/*` (in-memory store backed by `localStorage`, with simulated network latency). `src/app/app.config.ts` picks which implementation to provide based on `environment.useMock`, so the rest of the app (pages, components, `CartService`) is written entirely against the ports and doesn't know which backend is active.

## Available scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server, mock backend (default) |
| `npm run start:firebase` | Dev server, real Firebase backend |
| `npm run build` | Production build, mock backend |
| `npm run build:firebase` | Production build, real Firebase backend |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Lint |

## Project structure

```
src/app/
  core/
    ports/        # AuthPort, DatabasePort, StoragePort — the backend contracts
    firebase/      # Firebase-backed implementations
    mock/          # In-memory/localStorage-backed implementations
  services/
    cart.service.ts
  pages/
    home/          # Product grid
    cart/          # Cart + checkout
    profile/       # Login / register / edit profile
  admin/
    product-settings/  # Add/edit/delete products
  components/
    product/       # Product card
    cart-item/     # Cart line item
```
