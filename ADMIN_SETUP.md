# Prakruthi Aqua admin setup

Open `/admin/`. With no Supabase credentials, choose **Explore the admin demo** for local-only banner, category, product and order management. **View storefront** explicitly enables a demo preview in that browser tab. Exit the preview using the notice at the top of the site. Demo orders are clearly labelled and do not reach the business. Clearing browser data removes demo changes.

## Live setup

1. Create a Supabase project. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the public publishable key). Never use a service-role key in browser configuration.
2. Run `supabase/full-setup.sql` in the SQL editor. This combines the catalog, customer, enquiry and seed scripts in one transaction. The seed includes the existing 18 products, five categories, and five homepage slides. Re-running the seed does not overwrite admin edits.
3. In Supabase Authentication, create an admin user with an email and strong password. Copy that user's UUID. Grant access from the SQL editor:

```sql
insert into public.prakruthi_admin_members(user_id) values ('REPLACE_WITH_AUTH_USER_UUID');
```

No account can grant itself admin membership from the website. Regular authenticated customers cannot read orders or change catalog data.

4. Rebuild and restart the website. Sign in at `/admin/` with the admin email/password. Use Supabase Authentication's dashboard for password resets and account administration.
5. Admin image upload uses the public `prakruthi-catalog-media` bucket, with a 5 MB limit and admin-only upload policies. Product and banner images accept local `/images/` paths or HTTPS URLs.

## What updates the storefront

Published products appear in Shop All and at `/product/?id=PRODUCT_SLUG`. This query route supports newly added products without rebuilding a static deployment. Existing `/products/SLUG/` routes remain available for original catalog products; the new catalog links use the live route. Featured products are displayed on the homepage. Active categories appear as shop filters. Published banner slides are ordered by their position. The initial named navigation ranges continue to point to the original category names; update those links in source if those categories are renamed. Live catalog data refreshes on window focus and after an admin save in the current page. A page refresh also loads the latest data.

A category cannot be deleted while products reference it. Move products first. Product stock is an internal reference; the order-request flow confirms availability with the team and does not reserve inventory or decrement stock.

## Orders

The new website supports an **order request** checkout at `/checkout/`. Customers enter name, email, phone, address and optional notes. `prakruthi_place_order` validates the order and calculates totals from published product prices inside a database transaction. Clients cannot choose the final price, payment state or order status. Order records and customer details are readable only by approved administrators.

Customers receive an order reference; the order starts pending and unpaid. Admins can review details and record confirmed, processing, shipped, delivered or cancelled status. Payment status is a manual record: changing it does not charge or refund money. Shipping charges and payment arrangements are confirmed directly before payment. No payment gateway, courier API or legacy-shop order integration is included. Add production rate limiting/CAPTCHA for anonymous order requests before opening checkout to broad traffic.

Admin manual orders store a snapshot of the selected product names/prices. Existing order line snapshots remain unchanged when catalog prices change. No delete-order action is exposed.

## Verification and deployment

`npm run build` verifies the app and exports static routes. Configure the two public Supabase variables at build time when hosting. The public anon key is expected in the browser; the database RLS and admin membership enforce access. Verify the SQL policies in your Supabase project after applying the schema. Apply business-specific privacy and order terms before public launch.

## Local database verification

Run `npm run test:database` to execute the SQL schemas in an in-memory PostgreSQL runtime with stubbed Supabase auth/storage tables. The checks cover public catalog reads, private order access, blocked self-promotion, server-side price calculation, invalid quantities, duplicate items, draft product restrictions, admin status updates and category renames. These tests do not contact Supabase and do not validate actual file uploads or the hosted Supabase configuration. The live orders list loads the latest 500 orders; add server-side pagination for higher order volume.

## Complete database coverage

`supabase/full-setup.sql` includes products, categories, banners, orders (with immutable item snapshots), admin membership, contact enquiries, customer profiles, wishlist items, saved cart items, business enquiries, page content and public site settings. Customer sign-in credentials are managed by Supabase Auth, and media files by Supabase Storage. Seed data includes 18 products, five categories and five banners.

The catalog, banners, checkout orders, admin login and contact form already use Supabase when configured. The new customer/profile/cart/wishlist, business-enquiry and page/settings tables are prepared for integration: the current wishlist and cart still use browser storage, the business form opens WhatsApp, and informational pages remain in source code. Creating these tables alone does not change those flows or add admin editing screens for them. Existing guest orders remain private to administrators; customer order history is not linked by email.

No live project or credentials are included. Configure `.env.local`, apply the SQL, grant the first admin membership, and restart the app to activate the existing integrations. Never include a service-role key in browser configuration.

## Customer sign-in and registration popup

The header account button opens Sign In / Register. `/account/` opens the same popup for email confirmation callbacks. Sign In uses email/password; Register collects full name, email and a password of at least eight characters, with matching confirmation. Supabase Auth owns credentials; passwords are never stored in application tables. Registration stores the name in Auth user metadata. The customer profile table is not automatically populated.

Enable Email authentication in Supabase. Keep email confirmation enabled and configure the Site URL plus allowed `/account/` callback URLs for localhost and your deployed domain. The password-help option sends an existing user a one-time sign-in link; it does not change their password. Configure production email delivery in Supabase before launch. Without environment configuration, the form displays a setup message and creates no local accounts.

## Sharing the existing dealer Supabase project

Use `supabase/full-setup.sql`. All website tables and RPCs have the `prakruthi_` prefix. Media uses `prakruthi-catalog-media` and its own policy names. The installer does not rename, drop, modify policies on, or seed existing unprefixed tables (including `products`, `categories`, dealer and subdealer tables). Existing unprefixed website installations are not automatically migrated: do not delete or rename those shared tables.

Supabase Auth is shared by applications within one Supabase project. The website has a separate `prakruthi_admin_members` allowlist, so dealer admin privileges do not grant website management access. Auth provider settings, confirmation emails and user identities still belong to the shared project. Use a separate Supabase project if identity isolation is required.
