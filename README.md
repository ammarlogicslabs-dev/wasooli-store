# Wasooli Store

React storefront and admin panel for Wasooli networking products. The UI talks to the **Wasooli Store API** over HTTP; catalog, orders, cart, and auth live on the backend (not in browser storage).

## Stack

- Vite 8 and React 19
- React Router 7
- Tailwind CSS v4
- Framer Motion, Lucide, and React Toastify

## Configure the API

Copy `.env.example` to `.env` and set the backend base URL (no trailing slash):

```bash
# Production API
VITE_API_URL=https://wasoolistoreapi.wasooli.pk

# Local API (WasooliStore.Api default launch URL)
# VITE_API_URL=http://localhost:5248
```

If `VITE_API_URL` is unset, the client defaults to the production API host.

## Run locally

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`. Point `VITE_API_URL` at a running API instance.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Deploy

- **Frontend:** build with Vite (`npm run build`) and host the `dist/` output (e.g. Vercel). Set `VITE_API_URL` in the host’s environment for that deployment.
- **Backend:** deploy [wasooli-store_api](https://github.com/MIkki008/wasooli-store_api) separately (IIS or equivalent) and allow the storefront origin in API CORS.

## Sign-in

Customer and admin use the same `/login` page. After a successful API login, routing follows the user **role** (`Customer` → shop, `Admin` → `/admin`), not a hard-coded email list.

Seed / demo credentials come from the API configuration (see the API repo), not from this frontend.

## Storefront routes

Shop, product, checkout, and account routes require a customer session. Unknown store paths redirect to `/shop`.

| Path | Page |
| --- | --- |
| `/` | Shop when signed in, otherwise login |
| `/login` | Shared sign-in for customer and admin |
| `/shop` | Product catalog |
| `/products/:slug` | Product details |
| `/checkout` | Delivery, payment, and order confirmation |
| `/account` | Password, notifications, orders, wishlist, and cart |

## Admin routes

Admin pages require an admin session. Opening `/admin` without one sends you to `/login`. Unknown admin paths redirect to `/admin`.

| Path | Page |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/products` | Catalog list |
| `/admin/products/new` | Add product |
| `/admin/products/:id/edit` | Edit product |
| `/admin/categories` | Categories |
| `/admin/orders` | Orders |
| `/admin/orders/:id` | Order details and fulfillment |
| `/admin/inventory` | Stock and history |
| `/admin/customers` | Customers |
| `/admin/customers/:key` | Customer details |
| `/admin/reports` | Sales and payment reports |
| `/admin/settings` | Store settings |
| `/admin/profile` | Admin profile |

## What you can do

**Storefront**

- Browse the catalog (paged from the API), filter, and sort
- Add items to cart and wishlist (synced when signed in)
- Check out with delivery and payment options handled by the API
- Track orders from the account page

**Admin**

- Dashboard metrics and sales chart from `/api/admin/dashboard`
- Manage products (including bulk `priceTiers`), categories, inventory, orders, customers, and coupons
- Export order reports as CSV
