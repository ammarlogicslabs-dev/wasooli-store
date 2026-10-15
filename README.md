# Wasooli Store

A React storefront for networking cables. Shop, product details, cart, wishlist, and checkout run in the browser with a demo login.

## Stack

- Vite and React
- React Router
- Tailwind CSS
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

Shop, product, and checkout routes require a session. Sign in with either identifier and the password below.

| Field | Value |
| --- | --- |
| Username or email | `Wasooli` or `wasooli123@gmail.com` |
| Password | `wasooli123` |

The session is stored in `localStorage` under `wasooli_user`. Cart and wishlist use `wasooli_cart` and `wasooli_wishlist`.

## Routes

| Path | Page |
| --- | --- |
| `/` | Shop when signed in, otherwise login |
| `/login` | Sign in |
| `/shop` | Product catalog |
| `/products/:slug` | Product details |
| `/checkout` | Delivery, payment, and order confirmation |

## What you can do

- Search, filter by category and price, and sort the catalog
- Open a product for description, features, specifications, and shipping notes
- Add items from the product card or the product page; the cart drawer opens from the bag button
- Save items to the wishlist and open them from the header
- Check out with standard or express delivery, cash on delivery, or bank transfer
