# Wasooli Store

A React storefront and admin panel for networking equipment. Shopping, checkout, account, and store management all run in the browser with demo logins and `localStorage`. There is no backend.

## Stack

- Vite 8 and React 19
- React Router 7
- Tailwind CSS v4
- Framer Motion, Lucide, and React Toastify

## Run locally

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Demo login

Customer and admin both sign in on `/login`. The identifier decides which session starts.

| Role | Username or email | Password | Lands on |
| --- | --- | --- | --- |
| Customer | `Wasooli` or `wasooli123@gmail.com` | `wasooli123` | `/shop` |
| Admin | `admin` or `admin@wasooli.store` | `admin123` | `/admin` |

Customer session is stored in `localStorage` as `wasooli_user`. Admin session uses `wasooli_demo_admin_session`. Cart, wishlist, stock, and orders stay in the same browser storage so the shop and admin stay in sync.

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
| `/admin/customers` | Customers from saved orders |
| `/admin/customers/:key` | Customer details |
| `/admin/reports` | Sales and payment reports |
| `/admin/settings` | Store settings |
| `/admin/profile` | Admin profile |

## What you can do

**Storefront**

- Search, filter by category and price, and sort the catalog
- Open a product for description, features, specifications, and shipping notes
- Add items from the product card or the product page; the cart drawer opens from the bag button
- Save items to the wishlist and open them from the header
- Check out with standard or express delivery, cash on delivery, or bank transfer
- Track orders from the account page

**Admin**

- See orders, sales, stock alerts, and recent activity on the dashboard
- Add, edit, archive, or delete products; those changes show on the shop
- Adjust inventory; checkout deducts stock and cancelled orders restore it
- Update order status, payment, courier, and tracking
- Review customers created from placed orders
- Export order reports as CSV
- Reset demo catalog data from store settings
