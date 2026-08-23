# Root and Rise

Premium e-commerce storefront for **Root and Rise**, a cake ingredients and confectionery supplies business.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- MongoDB + Mongoose
- Auth.js (NextAuth v5) with credentials, hashed passwords, and role-based access
- Zustand cart (guest local storage, merged after login)
- Cloudinary-ready image pipeline
- Payment provider abstraction (manual confirmation first; M-Pesa and cards later)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Set `MONGODB_URI`, `AUTH_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_CUSTOMER_PASSWORD`.

3. Install and run:

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin routes live at `/admin` and require an `ADMIN` or `STAFF` session.

## First increment

This foundation includes the design system, catalogue models, authentication, homepage, shop/category/product architecture, cart, checkout with pending payments, seed data, and a protected admin dashboard shell.
