# APMC Enterprise Laravel Platform Blueprint

This blueprint translates the current APMC enterprise website into a Laravel, Blade, Tailwind CSS, MySQL, and JavaScript implementation path.

## Application Modules

- Public website: home, about, leadership, properties, projects, news, careers, contact, investor relations.
- Property portfolio: assets, galleries, lease terms, availability, brochures, map embeds, inquiry forms.
- Tenant portal: invoices, payment history, maintenance requests, receipts, documents, support tickets.
- Admin portal: properties, tenants, leases, invoices, maintenance, news CMS, careers, analytics, reports.
- Investor relations: occupancy charts, rent income growth, lease portfolio, acquisition programs, annual highlights.

## Laravel Structure

- `app/Models`: `Property`, `PropertyGallery`, `Tenant`, `Lease`, `Invoice`, `Payment`, `MaintenanceRequest`, `Announcement`, `NewsPost`, `JobOpening`, `JobApplication`, `InvestorMetric`, `Report`.
- `app/Http/Controllers/Public`: page controllers for public routes and SEO metadata.
- `app/Http/Controllers/Admin`: CMS, property, tenant, finance, HR, and analytics controllers.
- `app/Http/Controllers/Portal`: tenant dashboard, invoice, maintenance, document, and support controllers.
- `resources/views/components`: reusable Tailwind Blade components for cards, stats, timeline, leadership profiles, maps, charts, and CTAs.
- `resources/views/pages`: public page templates.
- `resources/views/admin`: authenticated admin screens.
- `resources/views/portal`: authenticated tenant screens.

## Core Migrations

- `properties`: `name`, `slug`, `region`, `location`, `category`, `status`, `area_sqm`, `lease_rate`, `description`, `map_embed_url`, `brochure_path`, `is_featured`.
- `property_galleries`: `property_id`, `image_path`, `alt_text`, `sort_order`.
- `leases`: `property_id`, `tenant_id`, `starts_at`, `ends_at`, `monthly_rate`, `status`, `terms_json`.
- `invoices`: `lease_id`, `invoice_no`, `amount`, `due_at`, `paid_at`, `status`.
- `payments`: `invoice_id`, `amount`, `method`, `reference_no`, `paid_at`, `receipt_path`.
- `maintenance_requests`: `tenant_id`, `property_id`, `category`, `priority`, `status`, `description`, `resolved_at`.
- `news_posts`: `title`, `slug`, `category_id`, `excerpt`, `content`, `featured_image`, `published_at`, `seo_title`, `seo_description`.
- `job_openings`: `title`, `department`, `location`, `type`, `description`, `status`.
- `job_applications`: `job_opening_id`, `name`, `email`, `phone`, `resume_path`, `cover_letter`, `status`.
- `investor_metrics`: `metric`, `value`, `period`, `metadata_json`.

## Data To Seed From Company Profile

- Company milestones: 2007 founding, 2010 ACI Building A & B, 2015 Key School, 2016 first building and Caticlan, 2018-2020 Pryce Tower and Project 101, 2021-2024 Landbank retention and 88.5% occupancy.
- Statistics: 92 commercial assets, 10 residential estates, ₱4.4B lease receivables, 9 group companies, 100+ contracts, 88.5% occupancy.
- Clients: EastWest Bank, Landbank, KFC, DITO, Converge, Allianz PNB, Pryce Corporation, government agencies, and tenant categories.
- Investment programs: ₱100M corporate office expansion, ₱100M Keys School expansion, ₱500M nationwide acquisition program.
- Properties: Apokon, La Fortuna, Pryce Tower, ACI buildings, Caticlan assets, and Mindanao portfolio assets.

## Recommended Controllers

- `HomeController`: aggregates stats, milestones, clients, featured properties, investment programs, news.
- `PropertyController`: listing, filters, detail page, inquiry submission, brochure download.
- `InvestorRelationsController`: charts, metrics, downloadable report requests.
- `NewsController`: categories, featured articles, related posts, SEO metadata.
- `CareersController`: job listings, resume upload, application workflow, HR notification.
- `Admin\DashboardController`: occupancy, receivables, leases, maintenance, tenant activity.
- `Admin\CmsController`: editable homepage sections, leadership, clients, milestones, investor metrics.

## UI/UX System

- Brand direction: corporate navy, white, soft blue accents, rounded-2xl cards, institutional spacing, restrained gradients.
- Motion: scroll reveal for timelines and cards, animated counters, marquee client carousel, chart transitions.
- Accessibility: keyboard-accessible modals, visible focus states, semantic headings, descriptive image alt text.
- Performance: lazy-loaded images, responsive sources, cached content queries, indexed filters, compressed assets.

## Admin CMS Priorities

1. Public content CMS for milestones, leadership, clients, statistics, and investor metrics.
2. Property CRUD with galleries, maps, brochures, lease terms, and availability.
3. News/blog CMS with categories, SEO fields, featured posts, and related content.
4. Careers CMS with job postings, resume uploads, status tracking, and email notifications.
5. Tenant portal data integration for invoices, payments, maintenance, receipts, and support.
