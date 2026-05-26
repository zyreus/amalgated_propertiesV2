# APMC Enterprise Property Platform Architecture

This project is currently a React, Tailwind CSS, Vite, Express, and SQLite/MySQL-ready application. The requested Laravel/Blade concepts map to the existing stack as follows:

- Blade components become React components under `frontend/src/components`.
- Laravel controllers become Express route handlers under `backend/routes`.
- Laravel migrations map to the existing schema bootstrap in `backend/db-pm.js` and future MySQL migration scripts under `scripts`.
- Tailwind UI patterns remain shared across both public pages and authenticated portal layouts.

## Public Website Modules

- Home: premium hero, search entry point, counters, featured properties, company timeline, regional map, news, and CTA.
- Company: corporate profile, milestones, values, leadership, and governance.
- Properties: enterprise filters for region, city, type, availability, area, budget, bedrooms, bathrooms, and sorting.
- Property Details: gallery, fullscreen preview, Google Map embed, amenities, nearby establishments, lease terms, inquiry form, brochure action, schedule viewing, and WhatsApp/Messenger CTA.
- Investor Relations: occupancy charts, growth statistics, lease performance, portfolio mix, reports, and investment opportunities.
- News/CMS: dynamic announcements and future rich-text articles with categories, tags, SEO metadata, and related posts.
- Careers: job listings, application forms, resume upload, HR status tracking, and notification workflows.

## Backend Route Structure

- `GET /api/properties`: list properties with search, region, type, city, budget, area, bedroom, bathroom, status, and sort filters.
- `GET /api/properties/:slug`: return one property with images and units.
- `POST /api/properties`: admin property creation.
- `PATCH /api/properties/:id`: admin property update.
- `DELETE /api/properties/:id`: admin property deletion.
- `GET /api/dashboard/admin`: admin analytics summary.
- `GET /api/dashboard/client`: tenant or owner portal summary.
- `GET /api/announcements`: public and portal announcements.
- `GET /api/maintenance`: request list and status tracking.
- `POST /api/maintenance`: tenant issue reporting.
- `PATCH /api/maintenance/:id`: admin assignment and status updates.

## Database Recommendations

Core tables already exist:

- `users`, `roles`, `permissions`, `role_permissions`
- `properties`, `property_images`, `units`
- `tenants`, `leases`, `invoices`, `payments`
- `maintenance_requests`, `support_tickets_pm`
- `documents`, `notifications`, `announcements`, `activity_logs`

Recommended next schema additions:

- `property_inquiries`: property_id, name, email, phone, message, source, status, assigned_to, created_at.
- `property_nearby_places`: property_id, name, category, distance_label, sort_order.
- `property_brochures`: property_id, title, file_url, version, visibility.
- `blog_posts`: title, slug, excerpt, body, category_id, author_id, status, seo_title, seo_description, og_image, published_at.
- `blog_categories`, `blog_tags`, `blog_post_tags`.
- `job_posts`, `job_applications`, `application_status_events`.
- `maintenance_comments`, `maintenance_attachments`.
- `document_folders`, `document_versions`, `document_access_logs`.

## Admin CMS Architecture

The existing `AdminLayout` should remain the shell. Add focused modules for:

- Properties and units
- Tenants and owners
- Leases, invoices, payments, and receipts
- Maintenance tickets, comments, assignments, and attachments
- News/blog, FAQs, testimonials, careers, and downloadable files
- Contact submissions and property inquiries
- Analytics dashboard with occupancy, revenue, lease, maintenance, and funnel metrics

Use role permissions to keep owner, tenant, and administrator capabilities separate.

## Tenant And Owner Portal Architecture

Tenant features:

- Lease agreement access
- Invoice and payment history
- Downloadable receipts
- Maintenance requests with images and comments
- Announcements and support tickets
- Profile and account settings

Owner features:

- Occupancy analytics
- Earnings and remittance reports
- Tenant status and lease expirations
- Maintenance history and document downloads

## UI System Guidelines

- Use `rounded-[2rem]`, `shadow-card`, `shadow-soft`, navy gradients, and restrained glass panels for premium surfaces.
- Keep CTA hierarchy simple: primary filled navy, secondary outlined, tertiary text link.
- Use scroll reveal through existing `[data-animate]` behavior and Framer Motion for interactive sections.
- Keep search/filter controls sticky on desktop and compact on mobile.
- Prefer skeleton cards over text-only loading states.
- Lazy-load property images except the primary detail hero.
- Keep all public forms accessible with visible labels or `sr-only` labels and focus states.

## Performance And SEO

- Add per-page document titles and meta descriptions.
- Add JSON-LD schema for Organization, RealEstateAgent, LocalBusiness, BreadcrumbList, and Product/Offer for property pages.
- Generate a sitemap from routes and published content.
- Cache property and announcement API responses at the client layer, and add server caching when MySQL is deployed.
- Add responsive image variants for owned property media.
- Index search columns used by property filters: `status`, `type`, `city`, `province`, `area_sqm`, `price`, `bedrooms`, `bathrooms`.
