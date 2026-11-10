# Prakruthi Aqua

A redesigned responsive brand and catalog website built with Next.js App Router, TypeScript, Tailwind CSS 4 and Supabase.

## Run

1. `npm install`
2. `npm run dev`
3. Visit http://localhost:3000

`npm run build` creates a static export in `out/`. `npm run typecheck` checks TypeScript.

## Supabase

Copy `.env.example` to `.env.local` and add your Supabase project URL and public anon/publishable key. Never add a service-role key. Run `supabase/schema.sql` in the Supabase SQL editor. Enable email OTP and allow `http://localhost:3000/account/` and your production `/account/` URL in Authentication URL settings. Rebuild after changing public environment variables.

With Supabase configured, the contact form inserts enquiries under RLS and email-link authentication works. Without credentials, contact enquiries can be explicitly sent through WhatsApp, and account users are directed to the existing store. Add production anti-abuse protection and an appropriate privacy notice before accepting public form submissions at scale.

## Commerce

Searchable imported catalog, categories, sorting, product details, persistent local collection, editable quantities, and WhatsApp collection enquiries. Purchase buttons link to each existing official shop product. This project does not process payments or submit orders, and the local collection does not transfer into the legacy store cart. A unified Supabase orders/inventory/payment integration requires a chosen payment provider and business configuration.

## Source content

Logo, product names, prices and product photos were imported from https://prakruthiaqua.in/ and https://shop.prakruthiaqua.in/ on 7 November 2026. Aquarium, plant, water and bird images reuse the Unsplash image references already present on the original brand website. Prices are a catalog snapshot; official store checkout confirms current price and availability. Original claims/testimonials were not independently verified and are not reproduced as endorsements.

## Pages

Home, shop, 18 generated product detail pages, our story, contact/business enquiry, account, and 404. All use shared responsive navigation, search and collection drawer.

The Sites private deployment is a review copy; existing domains and legacy shop remain unchanged. To deploy to Vercel, import this directory and configure the two public Supabase environment variables.

## Admin and new website orders

See `ADMIN_SETUP.md` for `/admin/`, local demo mode, live Supabase configuration, catalog editing, image uploads, and order-request checkout at `/checkout/`. The dynamic `/product/?id=SLUG` route supports newly created products without a static rebuild. Run `npm run test:database` for local PostgreSQL access-policy and order-validation tests. Online payments are not collected; new website orders begin as pending and unpaid.
# prakruthiaqua.in
