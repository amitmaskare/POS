-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 18, 2026 at 02:21 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pos_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cards`
--

CREATE TABLE `cards` (
  `id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Beverages', 'Active', '2025-12-10 11:06:45', '2025-12-10 19:06:52'),
(2, 'Snacks', 'Active', '2025-12-10 11:06:45', '2025-12-10 19:07:14'),
(3, 'Electronics', 'Active', '2025-12-10 11:06:45', '2025-12-10 19:07:28');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` bigint(20) NOT NULL DEFAULT 0,
  `address` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_items`
--

CREATE TABLE `exchange_items` (
  `id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` bigint(20) NOT NULL,
  `price` double NOT NULL DEFAULT 0,
  `amount` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hold_sales`
--

CREATE TABLE `hold_sales` (
  `id` int(11) NOT NULL,
  `hold_code` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `customer_mobile` varchar(50) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `status` enum('hold','completed','cancelled') DEFAULT 'hold',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hold_sale_items`
--

CREATE TABLE `hold_sale_items` (
  `id` int(11) NOT NULL,
  `hold_sale_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `offer_name` varchar(100) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `min_qty` int(11) DEFAULT 0,
  `offer_price` decimal(10,2) DEFAULT NULL,
  `offer_qty_price` varchar(20) NOT NULL DEFAULT 'regular',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `offer_name`, `product_id`, `min_qty`, `offer_price`, `offer_qty_price`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(1, '2 for 250', 2, 2, '25.00', 'offer_price', '2026-01-13', '2026-01-16', 'active', '2026-01-14 16:13:28');

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` int(11) NOT NULL,
  `package_name` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permissionId` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `slug_url` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permissionId`, `name`, `slug_url`, `created_at`, `updated_at`) VALUES
(1, 'Add Product', 'add-product', '2025-10-16 04:09:24', '2025-10-16 11:09:24'),
(3, 'view product', 'view-product', '2026-01-14 09:37:54', '2026-01-14 17:38:19');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL DEFAULT 0,
  `subcategory_id` int(11) NOT NULL DEFAULT 0,
  `product_name` varchar(100) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `cost_price` float NOT NULL DEFAULT 0,
  `unit_price` float NOT NULL DEFAULT 0,
  `selling_price` float NOT NULL DEFAULT 0,
  `tax_rate` float NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `initial_stock` float NOT NULL DEFAULT 0,
  `reorder_level` float NOT NULL DEFAULT 0,
  `min_stock` float NOT NULL DEFAULT 0,
  `max_stock` float NOT NULL DEFAULT 0,
  `unit` varchar(20) DEFAULT NULL,
  `package_id` int(11) NOT NULL DEFAULT 0,
  `unit_per_package` int(11) NOT NULL DEFAULT 0,
  `supplier_id` int(11) NOT NULL DEFAULT 0,
  `supplier_sku` varchar(100) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `favourite` enum('yes','no','loose') NOT NULL DEFAULT 'no',
  `is_returnable` varchar(20) NOT NULL DEFAULT 'yes',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `subcategory_id`, `product_name`, `sku`, `barcode`, `brand`, `description`, `cost_price`, `unit_price`, `selling_price`, `tax_rate`, `status`, `initial_stock`, `reorder_level`, `min_stock`, `max_stock`, `unit`, `package_id`, `unit_per_package`, `supplier_id`, `supplier_sku`, `image`, `favourite`, `is_returnable`, `created_at`, `updated_at`) VALUES
(1, 1, 0, 'Soap', 'SKU-148', '807545452148', NULL, NULL, 45, 50, 60, 5, 'Active', 100, 0, 0, 0, NULL, 0, 0, 1, NULL, 'soap.jpg', 'yes', 'yes', NULL, '2025-12-16 16:20:15'),
(2, 1, 0, 'Water Bottle', 'SKU-149', '807545452149', NULL, NULL, 20, 25, 30, 0, 'Active', 200, 0, 0, 0, NULL, 0, 0, 1, NULL, 'water.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(3, 1, 0, 'Shampoo', 'SKU-150', '807545452150', NULL, NULL, 90, 100, 120, 5, 'Active', 80, 0, 0, 0, NULL, 0, 0, 1, NULL, 'shampoo.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(4, 1, 0, 'Toothpaste', 'SKU-151', '807545452151', NULL, NULL, 65, 75, 90, 5, 'Active', 70, 0, 0, 0, NULL, 0, 0, 1, NULL, 'toothpaste.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(5, 1, 0, 'Toothbrush', 'SKU-152', '807545452152', NULL, NULL, 25, 30, 40, 5, 'Active', 150, 0, 0, 0, NULL, 0, 0, 1, NULL, 'toothbrush.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(6, 1, 0, 'Handwash', 'SKU-153', '807545452153', NULL, NULL, 50, 60, 70, 5, 'Active', 90, 0, 0, 0, NULL, 0, 0, 1, NULL, 'handwash.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(7, 1, 0, 'Detergent', 'SKU-154', '807545452154', NULL, NULL, 130, 150, 180, 5, 'Active', 60, 0, 0, 0, NULL, 0, 0, 1, NULL, 'detergent.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(8, 1, 0, 'Dishwash', 'SKU-155', '807545452155', NULL, NULL, 60, 70, 85, 5, 'Active', 75, 0, 0, 0, NULL, 0, 0, 1, NULL, 'dishwash.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(9, 1, 0, 'Facewash', 'SKU-156', '807545452156', NULL, NULL, 85, 95, 110, 5, 'Active', 50, 0, 0, 0, NULL, 0, 0, 1, NULL, 'facewash.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(10, 1, 0, 'Hair Oil', 'SKU-157', '807545452157', NULL, NULL, 105, 120, 140, 5, 'Active', 65, 0, 0, 0, NULL, 0, 0, 1, NULL, 'hairoil.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(11, 1, 0, 'Biscuits', 'SKU-158', '807545452158', NULL, NULL, 20, 25, 30, 5, 'Active', 300, 0, 0, 0, NULL, 0, 0, 1, NULL, 'biscuits.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(12, 1, 0, 'Chocolate', 'SKU-159', '807545452159', NULL, NULL, 35, 40, 50, 5, 'Active', 200, 0, 0, 0, NULL, 0, 0, 1, NULL, 'chocolate.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(13, 1, 0, 'Soft Drink', 'SKU-160', '807545452160', NULL, NULL, 30, 35, 45, 5, 'Active', 180, 0, 0, 0, NULL, 0, 0, 1, NULL, 'softdrink.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(14, 1, 0, 'Tea', 'SKU-161', '807545452161', NULL, NULL, 180, 200, 220, 5, 'Active', 40, 0, 0, 0, NULL, 0, 0, 1, NULL, 'tea.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(15, 1, 0, 'Coffee', 'SKU-162', '807545452162', NULL, NULL, 270, 300, 320, 5, 'Active', 30, 0, 0, 0, NULL, 0, 0, 1, NULL, 'coffee.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(16, 1, 0, 'Milk', 'SKU-163', '807545452163', NULL, NULL, 45, 50, 60, 0, 'Active', 120, 0, 0, 0, NULL, 0, 0, 1, NULL, 'milk.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(17, 1, 0, 'Curd', 'SKU-164', '807545452164', NULL, NULL, 55, 60, 70, 0, 'Active', 90, 0, 0, 0, NULL, 0, 0, 1, NULL, 'curd.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(18, 1, 0, 'Salt', 'SKU-165', '807545452165', NULL, NULL, 18, 20, 25, 0, 'Active', 400, 0, 0, 0, NULL, 0, 0, 1, NULL, 'salt.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(19, 1, 0, 'Sugar', 'SKU-166', '807545452166', NULL, NULL, 35, 40, 45, 0, 'Active', 250, 0, 0, 0, NULL, 0, 0, 1, NULL, 'sugar.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(20, 1, 0, 'Rice', 'SKU-167', '807545452167', NULL, NULL, 50, 55, 65, 0, 'Active', 500, 0, 0, 0, NULL, 0, 0, 1, NULL, 'rice.jpg', 'no', 'yes', NULL, '2025-12-15 14:00:30'),
(21, 0, 0, 'Not found ABC', NULL, '807545452259', NULL, NULL, 0, 0, 50, 0, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, NULL, 'no', 'yes', NULL, '2025-12-15 18:14:30'),
(22, 1, 0, 'Fresh Apple 1Kg', 'FR-APL-01', '100000000001', NULL, NULL, 80, 90, 120, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'apple.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(23, 1, 0, 'Banana 1 Dozen', 'FR-BAN-02', '100000000002', NULL, NULL, 40, 50, 70, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'banana.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(24, 1, 0, 'Orange 1Kg', 'FR-ORG-03', '100000000003', NULL, NULL, 60, 70, 95, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'orange.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(25, 2, 0, 'Milk 1L', 'DY-MIL-01', '100000000004', NULL, NULL, 45, 50, 60, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'milk.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(26, 2, 0, 'Butter 500g', 'DY-BUT-02', '100000000005', NULL, NULL, 180, 200, 230, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'butter.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(27, 2, 0, 'Cheese Block', 'DY-CHS-03', '100000000006', NULL, NULL, 220, 250, 290, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'cheese.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(28, 3, 0, 'Basmati Rice 5Kg', 'GR-RIC-01', '100000000007', NULL, NULL, 420, 450, 520, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'rice.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(29, 3, 0, 'Wheat Flour 5Kg', 'GR-WHT-02', '100000000008', NULL, NULL, 210, 240, 290, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'wheat.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(30, 3, 0, 'Sugar 1Kg', 'GR-SUG-03', '100000000009', NULL, NULL, 42, 45, 55, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'sugar.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(31, 4, 0, 'Tea Powder 500g', 'BV-TEA-01', '100000000010', NULL, NULL, 180, 200, 240, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'tea.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(32, 5, 0, 'Potato Chips', 'SN-CHP-01', '100000000011', NULL, NULL, 15, 18, 25, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'chips.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(33, 5, 0, 'Chocolate Cookies', 'SN-CK-02', '100000000012', NULL, NULL, 20, 25, 35, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'cookies.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(34, 5, 0, 'Salted Peanuts', 'SN-PNT-03', '100000000013', NULL, NULL, 30, 35, 50, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'peanuts.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(35, 6, 0, 'Cold Drink 750ml', 'BV-CD-01', '100000000014', NULL, NULL, 30, 35, 45, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'cola.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(36, 6, 0, 'Orange Juice', 'BV-JU-02', '100000000015', NULL, NULL, 50, 55, 70, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'juice.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(37, 6, 0, 'Energy Drink', 'BV-EN-03', '100000000016', NULL, NULL, 85, 90, 120, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'energy.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(38, 7, 0, 'Detergent Powder', 'HH-DTR-01', '100000000017', NULL, NULL, 120, 130, 160, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'detergent.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(39, 7, 0, 'Dishwash Liquid', 'HH-DSH-02', '100000000018', NULL, NULL, 70, 80, 110, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'dishwash.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(40, 7, 0, 'Floor Cleaner', 'HH-FLR-03', '100000000019', NULL, NULL, 90, 100, 130, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'floor.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(41, 8, 0, 'Bath Soap', 'PC-SOP-01', '100000000020', NULL, NULL, 20, 25, 35, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'soap.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(42, 8, 0, 'Shampoo 180ml', 'PC-SHM-02', '100000000021', NULL, NULL, 90, 100, 140, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'shampoo.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(43, 8, 0, 'Toothpaste', 'PC-TTH-03', '100000000022', NULL, NULL, 55, 60, 85, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'toothpaste.jpg', 'no', 'yes', NULL, '2025-12-24 15:50:47'),
(44, 9, 0, 'Notebook A4', 'ST-NB-01', '100000000023', NULL, NULL, 35, 40, 55, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'notebook.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(45, 9, 0, 'Ball Pen Blue', 'ST-PN-02', '100000000024', NULL, NULL, 5, 7, 10, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'pen.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(46, 9, 0, 'Marker Black', 'ST-MK-03', '100000000025', NULL, NULL, 18, 20, 30, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'marker.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(47, 10, 0, 'LED Bulb 9W', 'EL-BLB-01', '100000000026', NULL, NULL, 90, 100, 130, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'bulb.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(48, 10, 0, 'Extension Board', 'EL-EXT-02', '100000000027', NULL, NULL, 220, 250, 320, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'extension.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(49, 10, 0, 'Electric Iron', 'EL-IRN-03', '100000000028', NULL, NULL, 650, 700, 890, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'iron.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(50, 11, 0, 'Mobile Charger', 'EL-CHR-01', '100000000029', NULL, NULL, 180, 200, 260, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'charger.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(51, 11, 0, 'USB Cable', 'EL-USB-02', '100000000030', NULL, NULL, 60, 70, 100, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'usb.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(52, 12, 0, 'Bread White', 'FD-BRD-01', '100000000031', NULL, NULL, 25, 30, 40, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'bread.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(53, 12, 0, 'Brown Bread', 'FD-BRD-02', '100000000032', NULL, NULL, 30, 35, 50, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'bread2.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(54, 13, 0, 'Eggs 12 Pack', 'FD-EGG-01', '100000000033', NULL, NULL, 70, 80, 100, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'eggs.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(55, 13, 0, 'Eggs 6 Pack', 'FD-EGG-02', '100000000034', NULL, NULL, 38, 45, 60, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'eggs6.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(56, 14, 0, 'Chicken Masala', 'SP-MSL-01', '100000000035', NULL, NULL, 40, 45, 65, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'masala.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(57, 14, 0, 'Garam Masala', 'SP-MSL-02', '100000000036', NULL, NULL, 55, 60, 85, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'garam.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(58, 15, 0, 'Cooking Oil 1L', 'FD-OIL-01', '100000000037', NULL, NULL, 135, 150, 185, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'oil.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(59, 15, 0, 'Sunflower Oil', 'FD-OIL-02', '100000000038', NULL, NULL, 145, 160, 195, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'oil2.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(60, 16, 0, 'Tomato Ketchup', 'SN-KTC-01', '100000000039', NULL, NULL, 80, 90, 120, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'ketchup.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(61, 16, 0, 'Mayonnaise', 'SN-MAY-02', '100000000040', NULL, NULL, 90, 100, 135, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'mayo.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(62, 17, 0, 'Hand Wash', 'PC-HW-01', '100000000041', NULL, NULL, 65, 75, 105, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'handwash.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(63, 17, 0, 'Face Wash', 'PC-FW-02', '100000000042', NULL, NULL, 95, 110, 150, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'facewash.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(64, 18, 0, 'Toilet Cleaner', 'HH-TLT-01', '100000000043', NULL, NULL, 75, 85, 120, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'toilet.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(65, 18, 0, 'Phenyl', 'HH-PHN-02', '100000000044', NULL, NULL, 65, 75, 110, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'phenyl.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(66, 19, 0, 'Soft Drink 2L', 'BV-SD-01', '100000000045', NULL, NULL, 65, 75, 95, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'softdrink.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(67, 19, 0, 'Soda Water', 'BV-SD-02', '100000000046', NULL, NULL, 20, 25, 35, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'soda.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(68, 20, 0, 'Ice Cream Vanilla', 'FD-IC-01', '100000000047', NULL, NULL, 90, 100, 140, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'icecream.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(69, 20, 0, 'Ice Cream Chocolate', 'FD-IC-02', '100000000048', NULL, NULL, 95, 110, 150, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'icecream2.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(70, 21, 0, 'Mineral Water 1L', 'BV-WTR-01', '100000000049', NULL, NULL, 12, 15, 20, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'water.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(71, 21, 0, 'Mineral Water 500ml', 'BV-WTR-02', '100000000050', NULL, NULL, 8, 10, 15, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'water2.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(72, 22, 0, 'Paper Towels', 'HH-PPR-01', '100000000051', NULL, NULL, 60, 70, 95, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'towel.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(73, 22, 0, 'Napkins', 'HH-NPK-02', '100000000052', NULL, NULL, 35, 40, 60, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'napkin.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(74, 23, 0, 'Pencil', 'ST-PCL-01', '100000000053', NULL, NULL, 4, 5, 8, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'pencil.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(75, 23, 0, 'Eraser', 'ST-ERS-02', '100000000054', NULL, NULL, 3, 4, 6, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'eraser.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(76, 24, 0, 'Mouse USB', 'EL-MSE-01', '100000000055', NULL, NULL, 250, 270, 350, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'mouse.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(77, 24, 0, 'Keyboard', 'EL-KBD-02', '100000000056', NULL, NULL, 450, 500, 650, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'keyboard.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(78, 25, 0, 'LED TV Remote', 'EL-RMT-01', '100000000057', NULL, NULL, 180, 200, 260, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'remote.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(79, 26, 0, 'Tea Cups Set', 'HM-CUP-01', '100000000058', NULL, NULL, 280, 300, 390, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'cups.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(80, 26, 0, 'Steel Glass', 'HM-GLS-02', '100000000059', NULL, NULL, 90, 100, 140, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'glass.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(81, 27, 0, 'Bath Towel', 'HM-TWL-01', '100000000060', NULL, NULL, 220, 250, 320, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'towel.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(82, 27, 0, 'Door Mat', 'HM-MAT-02', '100000000061', NULL, NULL, 180, 200, 280, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'mat.jpg', 'no', 'yes', NULL, '2025-12-24 15:51:23'),
(83, 28, 0, 'Face Cream', 'PC-FCR-01', '100000000062', NULL, NULL, 95, 110, 150, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'facecream.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(84, 28, 0, 'Body Lotion', 'PC-BLT-02', '100000000063', NULL, NULL, 120, 140, 190, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'lotion.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(85, 29, 0, 'Hair Oil 200ml', 'PC-HRO-01', '100000000064', NULL, NULL, 85, 95, 130, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'hairoil.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(86, 29, 0, 'Hair Gel', 'PC-HRG-02', '100000000065', NULL, NULL, 60, 70, 100, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'hairgel.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(87, 30, 0, 'Mosquito Repellent', 'HH-MOS-01', '100000000066', NULL, NULL, 75, 85, 120, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'repellent.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(88, 30, 0, 'Room Freshener', 'HH-RMF-02', '100000000067', NULL, NULL, 90, 105, 150, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'freshener.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(89, 31, 0, 'Laptop Bag', 'EL-BAG-01', '100000000068', NULL, NULL, 650, 700, 950, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'bag.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(90, 31, 0, 'Headphones', 'EL-HDP-02', '100000000069', NULL, NULL, 850, 900, 1250, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'headphones.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(91, 32, 0, 'Power Bank', 'EL-PWB-01', '100000000070', NULL, NULL, 900, 1000, 1350, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'powerbank.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(92, 32, 0, 'Bluetooth Speaker', 'EL-SPK-02', '100000000071', NULL, NULL, 1100, 1200, 1600, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'speaker.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(93, 33, 0, 'Notebook Spiral', 'ST-NBS-01', '100000000072', NULL, NULL, 45, 50, 70, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'notebook2.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(94, 33, 0, 'Highlighter Pen', 'ST-HLP-02', '100000000073', NULL, NULL, 25, 30, 45, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'highlighter.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(95, 34, 0, 'Dish Scrubber', 'HH-DSC-01', '100000000074', NULL, NULL, 18, 22, 35, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'scrubber.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(96, 34, 0, 'Steel Wool', 'HH-STW-02', '100000000075', NULL, NULL, 15, 18, 30, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'steelwool.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(97, 35, 0, 'Green Tea', 'BV-GRT-01', '100000000076', NULL, NULL, 180, 200, 260, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'greentea.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(98, 35, 0, 'Coffee Powder', 'BV-COF-02', '100000000077', NULL, NULL, 220, 250, 320, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'coffee.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(99, 36, 0, 'Frozen Peas', 'FD-FP-01', '100000000078', NULL, NULL, 90, 100, 140, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'peas.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(100, 36, 0, 'Frozen Corn', 'FD-FC-02', '100000000079', NULL, NULL, 95, 105, 150, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'corn.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(101, 37, 0, 'Chewing Gum', 'SN-GUM-01', '100000000080', NULL, NULL, 5, 6, 10, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'gum.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(102, 37, 0, 'Mint Candy', 'SN-CND-02', '100000000081', NULL, NULL, 8, 10, 15, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'candy.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(103, 38, 0, 'Baby Diapers Small', 'BC-DPR-01', '100000000082', NULL, NULL, 380, 420, 520, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'diaper.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(104, 38, 0, 'Baby Wipes', 'BC-WPS-02', '100000000083', NULL, NULL, 120, 140, 190, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'wipes.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(105, 39, 0, 'Car Shampoo', 'AUTO-CSH-01', '100000000084', NULL, NULL, 180, 200, 260, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'carshampoo.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(106, 39, 0, 'Dashboard Polish', 'AUTO-DPL-02', '100000000085', NULL, NULL, 150, 170, 230, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'polish.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(107, 40, 0, 'Pet Food 1Kg', 'PET-PFD-01', '100000000086', NULL, NULL, 320, 350, 450, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'petfood.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(108, 40, 0, 'Pet Shampoo', 'PET-PSH-02', '100000000087', NULL, NULL, 180, 200, 260, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'petshampoo.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(109, 41, 0, 'LED Torch', 'EL-TCH-01', '100000000088', NULL, NULL, 180, 200, 280, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'torch.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(110, 41, 0, 'Emergency Light', 'EL-EML-02', '100000000089', NULL, NULL, 950, 1000, 1350, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'emlight.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(111, 42, 0, 'Screw Driver Set', 'HW-SDR-01', '100000000090', NULL, NULL, 220, 250, 330, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'screwdriver.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(112, 42, 0, 'Hammer', 'HW-HMR-02', '100000000091', NULL, NULL, 180, 200, 280, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'hammer.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(113, 43, 0, 'Wall Clock', 'HM-CLK-01', '100000000092', NULL, NULL, 450, 500, 650, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'clock.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(114, 43, 0, 'Table Lamp', 'HM-LMP-02', '100000000093', NULL, NULL, 650, 700, 950, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'lamp.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(115, 44, 0, 'Yoga Mat', 'SP-YGM-01', '100000000094', NULL, NULL, 480, 520, 680, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'yogamat.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(116, 44, 0, 'Skipping Rope', 'SP-SKP-02', '100000000095', NULL, NULL, 120, 140, 200, 12, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'rope.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(117, 45, 0, 'Protein Bar', 'HL-PBR-01', '100000000096', NULL, NULL, 45, 50, 70, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'proteinbar.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(118, 45, 0, 'Energy Bar', 'HL-EBR-02', '100000000097', NULL, NULL, 40, 45, 65, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'energybar.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(119, 46, 0, 'Sanitary Pads', 'HL-SPD-01', '100000000098', NULL, NULL, 180, 200, 260, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'pads.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(120, 46, 0, 'Hand Sanitizer', 'HL-HSN-02', '100000000099', NULL, NULL, 60, 70, 100, 18, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'sanitizer.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(121, 47, 0, 'Face Mask Pack', 'HL-FMK-01', '100000000100', NULL, NULL, 40, 45, 70, 5, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, 'mask.jpg', 'no', 'yes', NULL, '2025-12-24 15:53:58'),
(138, 0, 0, 'XYZ', NULL, '807545452144', NULL, NULL, 0, 0, 120, 0, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, NULL, 'no', 'yes', NULL, '2025-12-27 17:20:27'),
(139, 0, 0, 'ABC', NULL, '807545452143', NULL, NULL, 0, 0, 130, 0, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, NULL, 'no', 'yes', NULL, '2025-12-27 17:22:19'),
(140, 0, 0, 'ABCD', NULL, '807545452141', NULL, NULL, 0, 0, 450, 0, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, NULL, 'no', 'yes', NULL, '2025-12-27 17:22:57'),
(141, 0, 0, 'Saktiman', NULL, '807545452553', NULL, NULL, 0, 0, 145, 0, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, NULL, 'no', 'yes', NULL, '2025-12-30 20:22:24'),
(142, 0, 0, 'Haldiram chips', NULL, '807545452554', NULL, NULL, 0, 0, 45, 0, 'Active', 0, 0, 0, 0, NULL, 0, 0, 0, NULL, NULL, 'loose', 'yes', NULL, '2026-01-12 17:19:51'),
(144, 1, 0, 'sabun', 'sabun123', '1234', 'liux', 'Hello product', 10, 0, 12, 2, 'Active', 15, 0, 0, 0, NULL, 0, 0, 1, NULL, NULL, 'no', 'yes', NULL, '2026-01-11 13:34:54');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `po_number` varchar(100) DEFAULT NULL,
  `userId` int(11) NOT NULL DEFAULT 0,
  `purchase_date` date DEFAULT NULL,
  `supplier_id` int(11) NOT NULL DEFAULT 0,
  `subtotal` float NOT NULL DEFAULT 0,
  `tax` float NOT NULL DEFAULT 0,
  `grand_total` float NOT NULL DEFAULT 0,
  `status` varchar(50) DEFAULT 'pending',
  `type` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `po_number`, `userId`, `purchase_date`, `supplier_id`, `subtotal`, `tax`, `grand_total`, `status`, `type`, `created_at`, `updated_at`) VALUES
(1, 'PO-08-12-2025-0001', 1, '2025-12-08', 3, 320.5, 10, 350.5, 'pending', 'send', '2025-12-08 08:42:48', '2025-12-08 16:42:48'),
(2, 'PO-10-12-2025-0002', 1, '2025-12-08', 9, 320.5, 15, 380.5, 'pending', 'send', '2025-12-10 01:38:22', '2025-12-10 09:38:22'),
(3, 'PO-08-12-2025-0005', 1, '2025-12-08', 3, 320.5, 10, 350.5, 'pending', 'send', '2025-12-08 10:07:20', '2025-12-08 18:07:20'),
(4, 'PO-08-12-2025-0004', 1, '2025-12-08', 3, 344, 10, 344, 'pending', 'send', '2025-12-12 05:45:08', '2025-12-12 13:45:08'),
(5, 'PO-08-12-2025-0005', 1, '2025-12-08', 3, 320.5, 10, 350.5, 'pending', 'send', '2025-12-10 08:25:10', '2025-12-10 16:25:10'),
(6, 'PO-08-12-2025-0006', 1, '2025-12-08', 3, 320.5, 10, 350.5, 'pending', 'send', '2025-12-10 09:17:55', '2025-12-10 17:17:55'),
(17, 'PO-10-12-2025-0007', 1, '2025-12-10', 9, 320.5, 15, 380.5, 'pending', 'send', '2025-12-10 09:33:02', '2025-12-10 17:33:02'),
(18, 'PO-10-12-2025-0008', 1, '2025-12-10', 9, 320.5, 15, 380.5, 'pending', 'send', '2025-12-10 09:31:41', '2025-12-10 17:31:41'),
(19, 'PO-11-12-2025-0009', 1, '2025-12-11', 1, 700, 10, 700, 'pending', 'send', '2025-12-11 03:31:45', '2025-12-11 11:31:45'),
(20, 'TEMP-11-12-2025-0010', 1, '2025-12-11', 3, 150, 10, 150, 'pending', 'draft', '2025-12-12 05:45:38', '2025-12-12 13:45:38'),
(21, 'TEMP-11-01-2026-0011', 1, '2026-01-11', 1, 20, 10, 20, 'pending', 'draft', '2026-01-11 06:08:47', '2026-01-11 14:08:47'),
(22, 'TEMP-11-01-2026-0012', 1, '2026-01-11', 1, 20, 10, 20, 'pending', 'draft', '2026-01-11 06:11:35', '2026-01-11 14:11:35'),
(23, 'PO-11-01-2026-0013', 1, '2026-01-11', 1, 20, 10, 20, 'completed', 'send', '2026-01-11 07:47:33', '2026-01-11 15:47:33');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL DEFAULT 0,
  `po_number` varchar(100) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` bigint(20) NOT NULL DEFAULT 0,
  `received_qty` bigint(20) NOT NULL DEFAULT 0,
  `cost_price` float NOT NULL DEFAULT 0,
  `order_reason` text DEFAULT NULL,
  `received_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_id`, `po_number`, `product_id`, `quantity`, `received_qty`, `cost_price`, `order_reason`, `received_reason`, `created_at`) VALUES
(1, 0, 'PO-08-12-2025-0001', 5, 2, 0, 0, NULL, NULL, '2025-12-11 15:52:12'),
(2, 0, 'PO-08-12-2025-0001', 3, 3, 0, 0, NULL, NULL, '2025-12-11 15:52:12'),
(5, 0, 'PO-08-12-2025-0005', 5, 12, 0, 12, NULL, NULL, '2025-12-08 17:59:42'),
(6, 0, 'PO-08-12-2025-0005', 3, 5, 0, 20, NULL, NULL, '2025-12-08 17:59:42'),
(7, 0, 'PO-08-12-2025-0004', 5, 12, 0, 120, NULL, NULL, '2025-12-12 13:45:08'),
(8, 0, 'PO-08-12-2025-0004', 3, 10, 0, 120, NULL, NULL, '2025-12-12 13:45:08'),
(9, 0, 'PO-08-12-2025-0005', 5, 12, 0, 12, NULL, NULL, '2025-12-08 18:14:02'),
(10, 0, 'TEMP-06-12-2025-0005', 3, 5, 0, 20, NULL, NULL, '2025-12-08 18:13:43'),
(11, 0, 'PO-08-12-2025-0006', 5, 12, 0, 12, NULL, NULL, '2025-12-08 18:12:46'),
(12, 0, 'PO-08-12-2025-0006', 3, 5, 0, 20, NULL, NULL, '2025-12-08 18:12:46'),
(25, 0, 'PO-10-12-2025-0002', 9, 22, 0, 45, NULL, NULL, '2025-12-10 09:41:04'),
(26, 0, 'PO-10-12-2025-0002', 4, 50, 0, 20, NULL, NULL, '2025-12-10 09:41:04'),
(47, 17, 'PO-10-12-2025-0007', 9, 22, 0, 45, NULL, NULL, '2025-12-10 17:40:28'),
(48, 17, 'PO-10-12-2025-0007', 4, 50, 0, 20, NULL, NULL, '2025-12-10 17:33:02'),
(49, 18, 'PO-10-12-2025-0008', 4, 50, 5, 20, NULL, NULL, '2025-12-11 17:22:06'),
(50, 18, 'PO-10-12-2025-0008', 4, 50, 5, 20, NULL, NULL, '2025-12-11 17:22:06'),
(51, 19, 'PO-11-12-2025-0009', 0, 12, 6, 0, NULL, NULL, '2025-12-11 17:20:19'),
(52, 19, 'PO-11-12-2025-0009', 0, 5, 6, 0, NULL, NULL, '2025-12-11 17:20:19'),
(53, 20, 'TEMP-11-12-2025-0010', 5, 2, 0, 120, NULL, NULL, '2025-12-12 13:45:38'),
(54, 20, 'TEMP-11-12-2025-0010', 4, 3, 0, 20, NULL, NULL, '2025-12-12 13:45:38'),
(55, 23, 'PO-11-01-2026-0013', 144, 2, 2, 0, NULL, NULL, '2026-01-11 15:47:33');

-- --------------------------------------------------------

--
-- Table structure for table `ration_cards`
--

CREATE TABLE `ration_cards` (
  `id` int(11) NOT NULL,
  `card_type_id` int(11) NOT NULL DEFAULT 0,
  `card_number` varchar(100) DEFAULT NULL,
  `card_holder_name` varchar(100) DEFAULT NULL,
  `mobile` bigint(20) NOT NULL DEFAULT 0,
  `address` text DEFAULT NULL,
  `family_member` int(11) NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

CREATE TABLE `returns` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `invoice_no` varchar(50) DEFAULT NULL,
  `return_type` enum('refund','exchange') DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `approved_by` int(11) NOT NULL DEFAULT 0,
  `approved_at` datetime DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `returns`
--

INSERT INTO `returns` (`id`, `sale_id`, `invoice_no`, `return_type`, `refund_amount`, `approved_by`, `approved_at`, `reason`, `created_at`) VALUES
(1, 1, NULL, 'refund', '0.00', 0, NULL, NULL, '2026-01-08 10:21:57'),
(2, 1, NULL, 'refund', '0.00', 0, NULL, NULL, '2026-01-08 10:27:44'),
(3, 1, NULL, 'refund', '0.00', 0, NULL, NULL, '2026-01-08 10:54:09'),
(4, 1, NULL, 'refund', '30.00', 0, NULL, NULL, '2026-01-08 10:58:07'),
(5, 1, NULL, 'refund', '45.00', 0, NULL, NULL, '2026-01-08 10:59:13'),
(6, 1, NULL, 'refund', '30.00', 0, NULL, NULL, '2026-01-08 11:04:27'),
(7, 1, NULL, 'refund', '0.00', 0, NULL, NULL, '2026-01-08 11:05:34'),
(8, 1, NULL, 'refund', '0.00', 0, NULL, NULL, '2026-01-08 11:05:41'),
(9, 1, NULL, 'refund', '0.00', 0, NULL, NULL, '2026-01-08 11:06:13'),
(10, 1, NULL, 'refund', '45.00', 0, NULL, NULL, '2026-01-08 11:06:36'),
(11, 1, NULL, 'exchange', '30.00', 0, NULL, NULL, '2026-01-08 12:31:29'),
(12, 1, NULL, 'exchange', '0.00', 0, NULL, NULL, '2026-01-08 12:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `return_approvals`
--

CREATE TABLE `return_approvals` (
  `id` bigint(20) NOT NULL,
  `return_id` int(11) NOT NULL DEFAULT 0,
  `sale_id` int(11) NOT NULL DEFAULT 0,
  `cashier_id` int(11) NOT NULL DEFAULT 0,
  `manager_id` int(11) NOT NULL DEFAULT 0,
  `action` enum('refund','exchange') DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `id` int(11) NOT NULL,
  `return_id` int(11) DEFAULT NULL,
  `sale_item_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `return_qty` int(11) DEFAULT NULL,
  `tax` double NOT NULL DEFAULT 0,
  `refund_amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_items`
--

INSERT INTO `return_items` (`id`, `return_id`, `sale_item_id`, `product_id`, `product_name`, `image`, `return_qty`, `tax`, `refund_amount`) VALUES
(1, 4, 5, 2, 'Water Bottle', 'http://localhost:4000/public/uploads/product/water.jpg', 1, 0, '30.00'),
(2, 5, 11, 142, 'Haldiram chips', NULL, 1, 0, '45.00'),
(3, 6, 5, 2, 'Water Bottle', 'http://localhost:4000/public/uploads/product/water.jpg', 1, 0, '30.00'),
(4, 10, 11, 142, 'Haldiram chips', NULL, 1, 0, '45.00'),
(5, 11, 1, 1, 'Soap', 'http://localhost:4000/public/uploads/product/soap.jpg', 1, 0, '60.00'),
(6, 11, 5, 2, 'Water Bottle', 'http://localhost:4000/public/uploads/product/water.jpg', 1, 0, '30.00'),
(7, 12, 7, 11, 'Biscuits', 'http://localhost:4000/public/uploads/product/biscuits.jpg', 1, 0, '30.00');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `roleId` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`roleId`, `name`, `created_at`, `updated_at`) VALUES
(1, 'admin', '2026-01-17 02:51:47', '2026-01-17 10:52:12'),
(2, 'cashier', '2026-01-17 02:51:47', '2026-01-17 10:52:12'),
(3, 'manager', '2026-01-17 02:52:18', '2026-01-17 10:52:27');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 0,
  `permission_id` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `updated_at`) VALUES
(5, 3, 1, '2026-01-15 18:22:43'),
(6, 3, 3, '2026-01-15 18:22:37'),
(7, 4, 1, '2026-01-16 16:48:10'),
(8, 2, 3, '2025-10-19 16:01:54');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `invoice_no` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `payment_method` enum('cash','card','upi') DEFAULT NULL,
  `payment_status` varchar(10) NOT NULL DEFAULT 'pending',
  `status` enum('completed','cancelled','returned','partially_returned') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `invoice_no`, `user_id`, `subtotal`, `tax`, `total`, `payment_method`, `payment_status`, `status`, `created_at`) VALUES
(1, 'TXN-30-12-2025-0001', 1, '230.00', '0.16', '230.16', 'cash', 'pending', 'partially_returned', '2025-12-30 20:32:01'),
(2, 'TXN-30-12-2025-0002', 1, '210.00', '10.50', '220.50', 'cash', 'pending', 'completed', '2025-12-30 20:32:54'),
(3, 'TXN-30-12-2025-0003', 1, '210.00', '10.50', '220.50', 'cash', 'pending', 'completed', '2025-12-31 05:43:14'),
(4, 'TXN-11-01-2026-0004', 1, '24.00', '1.20', '25.20', 'cash', 'pending', 'completed', '2026-01-11 14:02:16'),
(5, 'TXN-17-01-2026-0005', 1, '60.00', '3.00', '63.00', '', 'pending', 'completed', '2026-01-17 19:10:13'),
(6, 'TXN-17-01-2026-0006', 1, '60.00', '3.00', '63.00', '', 'pending', 'completed', '2026-01-17 19:11:30');

-- --------------------------------------------------------

--
-- Table structure for table `sales_items`
--

CREATE TABLE `sales_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `tax` double NOT NULL DEFAULT 0,
  `qty` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `returned_qty` int(11) NOT NULL DEFAULT 0,
  `is_returned` enum('no','partial','yes') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_items`
--

INSERT INTO `sales_items` (`id`, `sale_id`, `product_id`, `product_name`, `tax`, `qty`, `price`, `total`, `image`, `returned_qty`, `is_returned`) VALUES
(1, 1, 1, 'Soap', 0, 1, '60.00', '60.00', 'http://localhost:4000/public/uploads/product/soap.jpg', 1, 'yes'),
(3, 2, NULL, 'Shampoo', 0, 1, '120.00', '120.00', 'http://localhost:4000/public/uploads/product/shampoo.jpg', 0, 'no'),
(4, 2, NULL, 'Toothpaste', 0, 1, '90.00', '90.00', 'http://localhost:4000/public/uploads/product/toothpaste.jpg', 0, 'no'),
(5, 1, 2, 'Water Bottle', 0, 1, '30.00', '30.00', 'http://localhost:4000/public/uploads/product/water.jpg', 1, 'yes'),
(7, 1, 11, 'Biscuits', 0, 1, '30.00', '30.00', 'http://localhost:4000/public/uploads/product/biscuits.jpg', 1, 'yes'),
(9, 3, NULL, 'Shampoo', 0, 1, '120.00', '120.00', 'http://localhost:4000/public/uploads/product/shampoo.jpg', 0, 'no'),
(10, 3, NULL, 'Toothpaste', 0, 1, '90.00', '90.00', 'http://localhost:4000/public/uploads/product/toothpaste.jpg', 0, 'no'),
(11, 1, 142, 'Haldiram chips', 0, 2, '45.00', '90.00', NULL, 0, 'no'),
(12, 1, 16, 'Milk', 0, 1, '60.00', '60.00', 'http://localhost:4000/public/uploads/product/milk.jpg', 0, 'no'),
(13, 1, 14, 'Tea', 0, 1, '220.00', '220.00', 'http://localhost:4000/public/uploads/product/tea.jpg', 0, 'no'),
(14, 4, 144, 'sabun', 0, 2, '24.00', '48.00', NULL, 0, 'no'),
(15, 5, 1, 'Soap', 0, 1, '60.00', '60.00', 'http://localhost:4000/public/uploads/product/soap.jpg', 0, 'no'),
(16, 6, 1, 'Soap', 0, 1, '60.00', '60.00', 'http://localhost:4000/public/uploads/product/soap.jpg', 0, 'no');

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `type` varchar(10) DEFAULT NULL,
  `note` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`id`, `product_id`, `stock`, `type`, `note`, `created_at`, `updated_at`) VALUES
(1, 144, 15, 'credit', 'Add Product', '2026-01-11 05:34:54', '2026-01-11 13:34:54'),
(2, 144, 2, 'debit', 'Sale', '2026-01-11 06:02:16', '2026-01-11 14:02:16'),
(3, 144, 2, 'credit', 'Purchase Receiving', '2026-01-11 07:47:33', '2026-01-11 15:47:33'),
(4, 1, 1, 'debit', 'Sale', '2026-01-17 11:10:13', '2026-01-17 19:10:13'),
(5, 1, 1, 'debit', 'Sale', '2026-01-17 11:11:30', '2026-01-17 19:11:30');

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `ownerId` int(11) NOT NULL DEFAULT 0,
  `store_name` varchar(100) DEFAULT NULL,
  `store_id` varchar(100) DEFAULT NULL,
  `phone` bigint(20) DEFAULT 0,
  `address` varchar(255) DEFAULT NULL,
  `gst` varchar(100) DEFAULT NULL,
  `tax` float DEFAULT 0,
  `city` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `pincode` varchar(50) DEFAULT NULL,
  `address_proof` varchar(50) DEFAULT NULL,
  `currency` varchar(20) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `branding` varchar(255) DEFAULT NULL,
  `business_name` varchar(100) DEFAULT NULL,
  `gst_number` varchar(100) DEFAULT NULL,
  `vat` float NOT NULL DEFAULT 0,
  `logo` varchar(255) DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `ownerId`, `store_name`, `store_id`, `phone`, `address`, `gst`, `tax`, `city`, `location`, `pincode`, `address_proof`, `currency`, `type`, `branding`, `business_name`, `gst_number`, `vat`, `logo`, `website`, `email`, `created_at`, `updated_at`) VALUES
(3, 1, 'KIrana Store', 'STORE1000', 7769834632, 'Amagrnagar', '12', 5, 'Nagpur', 'Hingna Road', '440016', NULL, NULL, 'Retailer', NULL, NULL, NULL, 0, NULL, NULL, NULL, '2025-10-03 16:17:29', '2025-10-03 16:17:29'),
(5, 2, 'Umesh Store', 'STORE1001', 8877665544, 'Amar nAgar', '14', 34, 'Nagpure City', 'Pratap Nagar', '440015', NULL, NULL, 'Store', '[\"facebook\",\"Linkedin\"]', NULL, NULL, 0, NULL, NULL, NULL, '2025-10-15 16:53:25', '2025-10-15 16:53:25'),
(6, 2, 'Umesh Store', 'STORE1002', 8877665544, 'Amar nAgar', '14', 34, 'Nagpure City', 'Pratap Nagar', '440015', NULL, NULL, 'Store', 'facebook, Linkedin', NULL, NULL, 0, NULL, NULL, NULL, '2025-10-15 16:55:47', '2025-10-15 16:55:47'),
(7, 2, 'Umesh Store', 'STORE1003', 8877665544, 'Amar nAgar', '14', 34, 'Nagpure City', 'Pratap Nagar', '440015', NULL, NULL, 'Store', 'website', NULL, NULL, 0, NULL, NULL, NULL, '2025-10-15 16:56:13', '2025-10-15 16:56:13'),
(8, 2, 'Mate Kirana Store', 'STORE1004', 776983462, 'Amar nagar', '18', 12, 'Nagpur', 'Hingna Road nagpur', '440011', NULL, NULL, 'Retailer', 'Facebook,website', 'E-cart', '421A8TN4588', 0, NULL, NULL, 'mate@gmail.com', '2025-10-17 07:32:16', '2025-10-17 07:32:16'),
(9, 2, 'Mate Kirana Store', 'STORE1005', 776983462, 'Amar nagar', '18', 12, 'Nagpur', 'Hingna Road nagpur', '440011', NULL, NULL, 'Retailer', 'Facebook,website', 'E-cart', '421A8TN4588', 0, '1760686400938-652187942.jpg', NULL, 'mate@gmail.com', '2025-10-17 07:33:21', '2025-10-17 07:33:21');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL DEFAULT 0,
  `subcategory_name` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `phone`, `created_at`, `updated_at`) VALUES
(1, 'ABC Beverages Ltd', NULL, '2025-12-10 11:08:33', '2025-12-10 19:09:01'),
(2, 'Snack Distributors Inc', NULL, '2025-12-10 11:08:33', '2025-12-10 19:09:01'),
(3, 'Office Supplies Co', NULL, '2025-12-11 11:09:13', '2025-12-10 19:09:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL DEFAULT 0,
  `name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` int(11) NOT NULL DEFAULT 1 COMMENT '1- Store Admin,2-Cashier,3-Manager,4-Owner,5-Chain Admin',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `user_id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 1000, 'Admin', 'admin@gmail.com', '$2b$10$ogYlnn2R2nLOWn8sYr/QTeTpaO.3kVHY1KYTkH6k6fRqzt2fB9IyO', 1, '2025-10-03 13:01:32', '2025-10-27 12:02:28'),
(2, 1001, 'Suresh', 'maskareamit@gmail.com', '$2b$10$ogYlnn2R2nLOWn8sYr/QTeTpaO.3kVHY1KYTkH6k6fRqzt2fB9IyO', 2, '2025-10-03 14:40:05', '2026-01-11 17:34:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exchange_items`
--
ALTER TABLE `exchange_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hold_sales`
--
ALTER TABLE `hold_sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hold_code` (`hold_code`);

--
-- Indexes for table `hold_sale_items`
--
ALTER TABLE `hold_sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hold_sale_id` (`hold_sale_id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permissionId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ration_cards`
--
ALTER TABLE `ration_cards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `return_approvals`
--
ALTER TABLE `return_approvals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`roleId`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`);

--
-- Indexes for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cards`
--
ALTER TABLE `cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exchange_items`
--
ALTER TABLE `exchange_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hold_sales`
--
ALTER TABLE `hold_sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `hold_sale_items`
--
ALTER TABLE `hold_sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
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
  MODIFY `permissionId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `ration_cards`
--
ALTER TABLE `ration_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `return_approvals`
--
ALTER TABLE `return_approvals`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `roleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sales_items`
--
ALTER TABLE `sales_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hold_sale_items`
--
ALTER TABLE `hold_sale_items`
  ADD CONSTRAINT `hold_sale_items_ibfk_1` FOREIGN KEY (`hold_sale_id`) REFERENCES `hold_sales` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
