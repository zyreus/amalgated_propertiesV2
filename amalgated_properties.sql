-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 26, 2026 at 04:16 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `amalgated_properties`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity_type` varchar(120) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `body` text NOT NULL,
  `audience` enum('all','admin','client') DEFAULT 'all',
  `status` enum('draft','published','archived') DEFAULT 'published',
  `published_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` varchar(191) NOT NULL,
  `visitor_name` varchar(191) DEFAULT 'Visitor',
  `visitor_email` varchar(191) DEFAULT NULL,
  `status` enum('open','in_progress','resolved','archived') DEFAULT 'open',
  `mode` enum('ai','human') DEFAULT 'ai',
  `admin_unread_count` int(11) DEFAULT 0,
  `admin_last_read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `lease_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `document_type` varchar(120) DEFAULT NULL,
  `file_url` text NOT NULL,
  `visibility` enum('admin','client','public') DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `lease_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(191) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('unpaid','partial','paid','overdue','void') DEFAULT 'unpaid',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(80) DEFAULT NULL,
  `company` varchar(191) DEFAULT NULL,
  `inquiry_message` text DEFAULT NULL,
  `conversation_id` varchar(191) DEFAULT NULL,
  `source_page` varchar(191) DEFAULT NULL,
  `status` enum('new','contacted','qualified','converted','lost') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leases`
--

CREATE TABLE `leases` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `lease_number` varchar(191) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `rent_amount` decimal(12,2) NOT NULL,
  `security_deposit` decimal(12,2) DEFAULT 0.00,
  `payment_frequency` varchar(80) DEFAULT 'monthly',
  `status` enum('draft','active','expired','terminated','renewed') DEFAULT 'active',
  `terms` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_requests`
--

CREATE TABLE `maintenance_requests` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('open','assigned','in_progress','completed','cancelled') DEFAULT 'open',
  `assigned_to` varchar(191) DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cost` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` varchar(191) NOT NULL,
  `sender` enum('user','ai','admin') NOT NULL,
  `admin_name` varchar(191) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(80) DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `lease_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `method` varchar(80) DEFAULT 'bank_transfer',
  `reference_number` varchar(191) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'properties:manage', 'Create and manage properties'),
(2, 'leases:manage', 'Create and manage leases'),
(3, 'payments:manage', 'Record and reconcile payments'),
(4, 'maintenance:manage', 'Manage maintenance work orders'),
(5, 'dashboard:view', 'View dashboard analytics');

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` int(11) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` varchar(80) NOT NULL,
  `status` enum('available','leased','maintenance','inactive') DEFAULT 'available',
  `address` varchar(255) NOT NULL,
  `city` varchar(120) DEFAULT 'Davao City',
  `province` varchar(120) DEFAULT 'Davao del Sur',
  `description` text DEFAULT NULL,
  `price` decimal(12,2) DEFAULT 0.00,
  `area_sqm` decimal(10,2) DEFAULT 0.00,
  `bedrooms` int(11) DEFAULT 0,
  `bathrooms` int(11) DEFAULT 0,
  `parking_slots` int(11) DEFAULT 0,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`id`, `slug`, `name`, `type`, `status`, `address`, `city`, `province`, `description`, `price`, `area_sqm`, `bedrooms`, `bathrooms`, `parking_slots`, `amenities`, `featured`, `created_at`, `updated_at`) VALUES
(1, 'amalgated-corporate-center', 'Amalgated Corporate Center', 'office', 'leased', 'J.P. Laurel Avenue, Bajada', 'Davao City', 'Davao del Sur', 'Premium office spaces near Davao business districts.', 145000.00, 420.00, 0, 4, 12, '[\"24/7 security\",\"backup power\",\"parking\"]', 1, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(2, 'obrero-commercial-hub', 'Obrero Commercial Hub', 'commercial', 'available', 'Bo. Obrero, Davao City', 'Davao City', 'Davao del Sur', 'Street-facing retail and service spaces with strong foot traffic.', 95000.00, 260.00, 0, 3, 8, '[\"storefront\",\"CCTV\",\"loading area\"]', 1, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(3, 'lanang-executive-suites', 'Lanang Executive Suites', 'residential', 'available', 'Lanang, Davao City', 'Davao City', 'Davao del Sur', 'Furnished executive residences close to airport and malls.', 78000.00, 110.00, 3, 2, 2, '[\"pool\",\"gym\",\"concierge\"]', 1, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(4, 'matina-garden-residences', 'Matina Garden Residences', 'residential', 'available', 'Matina, Davao City', 'Davao City', 'Davao del Sur', 'Quiet mid-rise residences with landscaped common areas.', 52000.00, 86.00, 2, 2, 1, '[\"garden\",\"play area\",\"security\"]', 1, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(5, 'davao-logistics-park', 'Davao Logistics Park', 'industrial', 'available', 'Bunawan, Davao City', 'Davao City', 'Davao del Sur', 'Warehouse and logistics lots with truck access.', 210000.00, 1200.00, 0, 2, 20, '[\"loading bays\",\"wide roads\",\"perimeter fence\"]', 1, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(6, 'ecoland-retail-row', 'Ecoland Retail Row', 'commercial', 'available', 'Ecoland Drive, Davao City', 'Davao City', 'Davao del Sur', 'Compact retail units near transport and residential clusters.', 68000.00, 155.00, 0, 2, 5, '[\"high visibility\",\"parking\",\"signage\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(7, 'bajada-business-lofts', 'Bajada Business Lofts', 'office', 'available', 'Bajada, Davao City', 'Davao City', 'Davao del Sur', 'Flexible office lofts for growing professional teams.', 88000.00, 190.00, 0, 2, 4, '[\"fiber internet\",\"meeting room\",\"access control\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(8, 'toril-townhomes', 'Toril Townhomes', 'residential', 'leased', 'Toril, Davao City', 'Davao City', 'Davao del Sur', 'Family townhomes with easy access to schools and markets.', 43000.00, 96.00, 3, 2, 1, '[\"gated community\",\"parking\",\"service area\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(9, 'agdao-marketplace-units', 'Agdao Marketplace Units', 'commercial', 'available', 'Agdao, Davao City', 'Davao City', 'Davao del Sur', 'Affordable commercial units for neighborhood businesses.', 38000.00, 72.00, 0, 1, 2, '[\"market access\",\"roll-up doors\",\"water line\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(10, 'mintal-student-residences', 'Mintal Student Residences', 'residential', 'available', 'Mintal, Davao City', 'Davao City', 'Davao del Sur', 'Efficient rental residences near university communities.', 26000.00, 42.00, 1, 1, 1, '[\"study lounge\",\"laundry area\",\"security\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(11, 'maa-professional-plaza', 'Maa Professional Plaza', 'office', 'available', 'Maa Road, Davao City', 'Davao City', 'Davao del Sur', 'Professional clinic and office spaces along a key corridor.', 74000.00, 150.00, 0, 2, 4, '[\"elevator\",\"reception lobby\",\"parking\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(12, 'cabaguio-storage-compound', 'Cabaguio Storage Compound', 'industrial', 'available', 'Cabaguio Avenue, Davao City', 'Davao City', 'Davao del Sur', 'Secure storage and light industrial compound.', 120000.00, 680.00, 0, 2, 10, '[\"guard house\",\"yard space\",\"loading access\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(13, 'sasa-airport-commercial', 'Sasa Airport Commercial', 'commercial', 'available', 'Sasa, Davao City', 'Davao City', 'Davao del Sur', 'Commercial spaces serving airport-adjacent traffic.', 82000.00, 180.00, 0, 2, 6, '[\"road frontage\",\"parking\",\"CCTV\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(14, 'catalunan-grande-villas', 'Catalunan Grande Villas', 'residential', 'available', 'Catalunan Grande, Davao City', 'Davao City', 'Davao del Sur', 'Spacious villas for long-term corporate housing.', 98000.00, 240.00, 4, 3, 2, '[\"garden\",\"maid room\",\"covered parking\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57'),
(15, 'apmc-laurel-showroom', 'APMC Laurel Showroom', 'commercial', 'leased', 'J.P. Laurel Avenue, Davao City', 'Davao City', 'Davao del Sur', 'Flagship showroom space for premium brands.', 165000.00, 350.00, 0, 3, 10, '[\"glass frontage\",\"high ceiling\",\"backup power\"]', 0, '2026-05-20 03:57:57', '2026-05-20 03:57:57');

-- --------------------------------------------------------

--
-- Table structure for table `property_images`
--

CREATE TABLE `property_images` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `url` text NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(80) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'Property management administrator', '2026-05-20 03:57:57'),
(2, 'client', 'Property owner or tenant portal user', '2026-05-20 03:57:57');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets_pm`
--

CREATE TABLE `support_tickets_pm` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `property_id` int(11) DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('open','pending','resolved','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `property_id` int(11) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(80) DEFAULT NULL,
  `emergency_contact` varchar(191) DEFAULT NULL,
  `status` enum('active','inactive','former') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `ticket_id` varchar(191) NOT NULL,
  `conversation_id` varchar(191) NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('open','pending','closed') DEFAULT 'open',
  `assigned_staff` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_unread` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `unit_number` varchar(120) NOT NULL,
  `floor` varchar(80) DEFAULT NULL,
  `type` varchar(80) DEFAULT NULL,
  `status` enum('vacant','occupied','reserved','maintenance','inactive') DEFAULT 'vacant',
  `rent_amount` decimal(12,2) DEFAULT 0.00,
  `area_sqm` decimal(10,2) DEFAULT 0.00,
  `bedrooms` int(11) DEFAULT 0,
  `bathrooms` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `username` varchar(191) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(80) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `property_id`, `name`, `email`, `username`, `password_hash`, `phone`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'APMC Administrator', 'admin@theamalgatedproperties.com', 'admin', '$2b$10$.G/Xtodhlzsl1yGxBQsv8e/8esi7x9ttp2FtL3U33aP6.kMuhPUyO', NULL, 'active', NULL, '2026-05-20 03:57:58', '2026-05-20 03:57:58'),
(2, 2, NULL, 'Demo Client', 'client@example.com', 'client', '$2b$10$.U.Qd3hwX7bcZVhhHbSkj..balsAvbEr1TnposrSF4PbSeOk/FFiG', NULL, 'active', NULL, '2026-05-20 03:57:58', '2026-05-20 03:57:58');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_visits`
--

CREATE TABLE `visitor_visits` (
  `id` int(11) NOT NULL,
  `visit_id` varchar(191) NOT NULL,
  `conversation_id` varchar(191) DEFAULT NULL,
  `ip` varchar(80) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `device` varchar(191) DEFAULT NULL,
  `browser` varchar(191) DEFAULT NULL,
  `pages_visited` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pages_visited`)),
  `visit_duration_seconds` int(11) DEFAULT 0,
  `message_count` int(11) DEFAULT 0,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_activity_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_logs_user` (`user_id`),
  ADD KEY `idx_activity_logs_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_announcements_status` (`status`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversations_status` (`status`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_documents_property` (`property_id`),
  ADD KEY `fk_documents_lease` (`lease_id`),
  ADD KEY `fk_documents_user` (`user_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_invoices_status` (`status`),
  ADD KEY `fk_invoices_lease` (`lease_id`),
  ADD KEY `fk_invoices_tenant` (`tenant_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leads_conversation` (`conversation_id`);

--
-- Indexes for table `leases`
--
ALTER TABLE `leases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lease_number` (`lease_number`),
  ADD KEY `idx_leases_property` (`property_id`),
  ADD KEY `idx_leases_user` (`user_id`),
  ADD KEY `idx_leases_status` (`status`),
  ADD KEY `fk_leases_unit` (`unit_id`),
  ADD KEY `fk_leases_tenant` (`tenant_id`);

--
-- Indexes for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_maintenance_property` (`property_id`),
  ADD KEY `idx_maintenance_status` (`status`),
  ADD KEY `fk_maintenance_unit` (`unit_id`),
  ADD KEY `fk_maintenance_tenant` (`tenant_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_messages_conversation` (`conversation_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_user` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_lease` (`lease_id`),
  ADD KEY `fk_payments_invoice` (`invoice_id`),
  ADD KEY `fk_payments_tenant` (`tenant_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_properties_slug` (`slug`),
  ADD KEY `idx_properties_status` (`status`);

--
-- Indexes for table `property_images`
--
ALTER TABLE `property_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property_images_property` (`property_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `fk_role_permissions_permission` (`permission_id`);

--
-- Indexes for table `support_tickets_pm`
--
ALTER TABLE `support_tickets_pm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_support_tickets_user` (`user_id`),
  ADD KEY `fk_support_tickets_property` (`property_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenants_user` (`user_id`),
  ADD KEY `fk_tenants_property` (`property_id`),
  ADD KEY `fk_tenants_unit` (`unit_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_id` (`ticket_id`),
  ADD KEY `idx_tickets_conversation` (`conversation_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_units_property_number` (`property_id`,`unit_number`),
  ADD KEY `idx_units_property` (`property_id`),
  ADD KEY `idx_units_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_users_role` (`role_id`),
  ADD KEY `idx_users_property` (`property_id`);

--
-- Indexes for table `visitor_visits`
--
ALTER TABLE `visitor_visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_visitor_visits_visit` (`visit_id`),
  ADD KEY `idx_visitor_visits_conversation` (`conversation_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leases`
--
ALTER TABLE `leases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `property_images`
--
ALTER TABLE `property_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `support_tickets_pm`
--
ALTER TABLE `support_tickets_pm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `visitor_visits`
--
ALTER TABLE `visitor_visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_documents_lease` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_documents_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_documents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_lease` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_invoices_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `leases`
--
ALTER TABLE `leases`
  ADD CONSTRAINT `fk_leases_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leases_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leases_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD CONSTRAINT `fk_maintenance_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_maintenance_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_maintenance_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payments_lease` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payments_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `property_images`
--
ALTER TABLE `property_images`
  ADD CONSTRAINT `fk_property_images_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets_pm`
--
ALTER TABLE `support_tickets_pm`
  ADD CONSTRAINT `fk_support_tickets_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_support_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tenants`
--
ALTER TABLE `tenants`
  ADD CONSTRAINT `fk_tenants_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tenants_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tenants_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_tickets_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `fk_units_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `visitor_visits`
--
ALTER TABLE `visitor_visits`
  ADD CONSTRAINT `fk_visitor_visits_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
