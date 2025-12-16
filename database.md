-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: subscription_platform
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Giải trí','Các dịch vụ xem phim, nghe nhạc, streaming và trò chơi trực tuyến.','2025-11-03 03:54:57','2025-11-03 03:54:57'),(2,'Học tập','Nền tảng khóa học trực tuyến, E-learning, ứng dụng học ngôn ngữ.','2025-11-03 03:54:57','2025-11-03 03:54:57'),(3,'Tiện ích & Phần mềm','Các công cụ làm việc, VPN, lưu trữ đám mây, và phần mềm chuyên dụng.','2025-11-03 03:54:57','2025-11-03 03:54:57'),(4,'Giải trí','Các dịch vụ xem phim, nghe nhạc, streaming và trò chơi trực tuyến.','2025-11-03 03:55:08','2025-11-03 03:55:08'),(5,'Học tập','Nền tảng khóa học trực tuyến, E-learning, ứng dụng học ngôn ngữ.','2025-11-03 03:55:08','2025-11-03 03:55:08'),(6,'Tiện ích & Phần mềm','Các công cụ làm việc, VPN, lưu trữ đám mây, và phần mềm chuyên dụng.','2025-11-03 03:55:08','2025-11-03 03:55:08'),(7,'Ẩm thực & Đồ uống','Các gói đăng ký cà phê, cơm trưa, đồ ăn healthy và dịch vụ giao đồ ăn.','2025-11-04 15:45:31','2025-11-04 15:45:31');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `plan_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_plan` (`user_id`,`plan_id`),
  KEY `idx_favorite_user` (`user_id`),
  KEY `idx_favorite_plan` (`plan_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` enum('delivery','payment','promotion','system','subscription') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'system',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notification_user` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'system','Đăng ký thành công!','Chúc mừng bạn đã đăng ký thành công gói Netflix Tiêu chuẩn.',NULL,0,'2025-11-03 03:54:58'),(2,2,'system','Gói FPT Play iZi đã hết hạn','Gói FPT Play iZi của bạn đã hết hạn vào ngày 2025-10-01. Vui lòng gia hạn để tiếp tục sử dụng.',NULL,1,'2025-11-03 03:54:58'),(3,1,'system','Thanh toán đang chờ xử lý','Chúng tôi đang chờ thanh toán của bạn cho gói Netflix Cao cấp.',NULL,0,'2025-11-03 03:54:58'),(4,2,'system','Sắp hết hạn FPT Play Education','Gói FPT Play Education của bạn sẽ hết hạn trong 30 ngày nữa.',NULL,0,'2025-11-03 03:54:58'),(5,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"FPT Play iZi\" của FPT Play thành công. Số tiền: 44000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 11:02:13'),(6,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"Netflix Tiêu chuẩn\" của Netflix Vietnam thành công. Số tiền: 120000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 13:33:17'),(7,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"FPT Play iZi\" của FPT Play thành công. Số tiền: 44000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 13:33:38'),(8,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"Netflix Cao cấp\" của Netflix Vietnam thành công. Số tiền: 260000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 13:35:00'),(9,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"FPT Play Education\" của FPT Play thành công. Số tiền: 500000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/11/2026.',NULL,0,'2025-11-03 14:34:09'),(10,2,'system','Đăng ký thành công','Bạn đã đăng ký gói \"FPT Play iZi\" của FPT Play thành công. Số tiền: 44000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 14:35:34'),(11,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"Netflix Tiêu chuẩn\" của Netflix Vietnam thành công. Số tiền: 120000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 14:38:33'),(12,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"Netflix Cao cấp\" của Netflix Vietnam thành công. Số tiền: 260000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 14:59:19'),(13,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"FPT Play iZi\" của FPT Play thành công. Số tiền: 44000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 14:59:41'),(14,9,'system','Đăng ký thành công','Bạn đã đăng ký gói \"Netflix Tiêu chuẩn\" của Netflix Vietnam thành công. Số tiền: 120000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 16:39:58'),(15,9,'system','Đăng ký thành công','Bạn đã đăng ký gói \"Netflix Cao cấp\" của Netflix Vietnam thành công. Số tiền: 260000.00 VNĐ. Có hiệu lực từ 3/11/2025 đến 3/12/2025.',NULL,0,'2025-11-03 16:47:54'),(16,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"FPT Play Education\" của FPT Play thành công. Số tiền: 500000.00 VNĐ. Có hiệu lực từ 4/11/2025 đến 4/11/2026.',NULL,0,'2025-11-03 17:09:09'),(17,1,'system','Đăng ký thành công!','Bạn đã đăng ký gói \"Gói Cà Phê Sáng (30 ngày)\" của The Coffee House thành công. Số tiền: 599000.00 VNĐ.',NULL,0,'2025-11-04 15:45:31'),(18,9,'system','Đăng ký thành công!','Bạn đã đăng ký gói \"Gói Cơm Trưa \'Healthy\' (5 ngày)\" của Cơm trưa văn phòng FoodHub thành công. Số tiền: 250000.00 VNĐ.',NULL,0,'2025-11-04 15:45:31'),(19,1,'system','Đăng ký thành công!','Bạn đã đăng ký gói \"Gói \'Eat Clean\' 1 Tuần\" của SaladStop! Vietnam thành công. Số tiền: 450000.00 VNĐ.',NULL,0,'2025-11-04 15:45:31'),(20,1,'system','Đăng ký thành công','Bạn đã đăng ký gói \"Gói \'Work from Cafe\' (5 ngày)\" của The Coffee House thành công. Số tiền: 250000.00 VNĐ. Có hiệu lực từ 4/11/2025 đến 11/11/2025.',NULL,0,'2025-11-04 16:19:00');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` enum('VNPay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VNPay',
  `account_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_method_user` (`user_id`),
  CONSTRAINT `payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('VNPay','MoMo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('success','pending','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_subscription` (`subscription_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (11,11,120000.00,'VNPay','success','TXN1762180713650','2025-11-03 14:38:33'),(12,12,260000.00,'MoMo','success','TXN1762181959765','2025-11-03 14:59:19'),(13,13,44000.00,'VNPay','success','TXN1762181981454','2025-11-03 14:59:41'),(14,14,120000.00,'VNPay','success','TXN1762187998484','2025-11-03 16:39:58'),(15,15,260000.00,'VNPay','success','TXN1762188474840','2025-11-03 16:47:54'),(16,16,500000.00,'VNPay','success','TXN1762189748989','2025-11-03 17:09:08'),(17,17,599000.00,'MoMo','success','MM_20251104_FOOD001','2025-11-04 15:45:31'),(18,18,250000.00,'VNPay','success','VNP_20251104_FOOD002','2025-11-04 15:45:31'),(19,19,450000.00,'MoMo','success','MM_20251104_FOOD003','2025-11-04 15:45:31'),(20,20,250000.00,'VNPay','success','TXN1762273140208','2025-11-04 16:19:00');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `features` json DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_unit` enum('ngày','tuần','tháng','năm') COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_value` int NOT NULL,
  `subscriber_count` int DEFAULT '0',
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `imageUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_plan_vendor` (`vendor_id`),
  KEY `idx_plan_category` (`category_id`),
  CONSTRAINT `plans_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plans_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,1,1,'Netflix Tiêu chuẩn','Chất lượng Full HD 1080p, xem trên 2 thiết bị.',NULL,120000.00,'tháng',1,0,0.00,'approved','2025-11-03 03:54:57','https://athgroup.vn/upload/staticpage/thumb_800x0/ath-case-study-bo-nhan-dien-netflix-7png-1709451651.png'),(2,1,1,'Netflix Cao cấp','Chất lượng 4K+HDR, xem trên 4 thiết bị.',NULL,260000.00,'tháng',1,0,0.00,'approved','2025-11-03 03:54:57','https://cdn.pixabay.com/photo/2022/08/24/20/20/netflix-7408710_1280.png'),(3,2,1,'FPT Play iZi','Gói kênh gia đình cơ bản.',NULL,44000.00,'tháng',1,0,0.00,'approved','2025-11-03 03:54:57','https://inkythuatso.com/uploads/thumbnails/800/2021/11/logo-fpt-inkythuatso-1-01-01-14-33-35.jpg'),(4,2,2,'FPT Play Education','Gói nội dung học tập cho trẻ em.',NULL,500000.00,'năm',1,0,0.00,'approved','2025-11-03 03:54:57','https://dropbuy.com.vn/wp-content/uploads/2024/04/Blue-Minimalist-Thank-You-For-Your-Support-Instagram-Post-27-768x768.png'),(5,3,2,'Elsa Pro 1 Năm','Truy cập toàn bộ bài học và tính năng AI.',NULL,999000.00,'năm',1,0,0.00,'approved','2025-11-03 03:54:58',NULL),(6,4,7,'Gói Cà Phê Sáng (30 ngày)','Mỗi ngày 1 ly Cà Phê Đen hoặc Sữa Đá (size M). Áp dụng tại cửa hàng.',NULL,599000.00,'tháng',1,0,0.00,'approved','2025-11-04 15:45:31','https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg'),(7,4,7,'Gói \'Work from Cafe\' (5 ngày)','5 ngày bất kỳ trong tháng, mỗi ngày 1 ly nước (size L) và 1 bánh ngọt.',NULL,250000.00,'tuần',1,0,0.00,'approved','2025-11-04 15:45:31','https://images.unsplash.com/photo-1515378791036-0648a3ef77b2'),(8,5,7,'Gói Cơm Trưa \'Healthy\' (5 ngày)','5 phần cơm trưa healthy (gạo lứt, ức gà, rau củ) giao tận nơi, từ T2-T6.',NULL,250000.00,'tuần',1,0,0.00,'approved','2025-11-04 15:45:31','https://images.unsplash.com/photo-1582575490214-e353d3f2d80d'),(9,5,7,'Gói Cơm Trưa \'Tiết Kiệm\' (20 ngày)','Gói 20 phần cơm trưa văn phòng (cơm, món mặn, xào, canh).',NULL,800000.00,'tháng',1,0,0.00,'approved','2025-11-04 15:45:31','https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg'),(10,6,7,'Gói \'Eat Clean\' 1 Tuần','7 phần salad đặc trưng, giao mỗi ngày 1 phần trong 7 ngày liên tiếp.',NULL,450000.00,'tuần',1,0,0.00,'approved','2025-11-04 15:45:31','https://images.unsplash.com/photo-1512621776951-a57141f2e9c3'),(11,1,2,'Gói Cà phê Premium','Cà phê mỗi sáng',NULL,150000.00,'tháng',1,0,0.00,'pending','2025-11-05 15:28:43','https://example.com/image.jpg');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `plan_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_review_user` (`user_id`),
  KEY `idx_review_plan` (`plan_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `plan_id` bigint NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('pending_payment','active','expired','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending_payment',
  `auto_renew` tinyint(1) DEFAULT '1',
  `paused_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_subscription_user` (`user_id`),
  KEY `idx_subscription_plan` (`plan_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (11,1,1,'2025-11-03','2025-12-03','active',1,NULL,NULL),(12,1,2,'2025-11-03','2025-12-03','active',1,NULL,NULL),(13,1,3,'2025-11-03','2025-12-03','active',1,NULL,NULL),(14,9,1,'2025-11-03','2025-12-03','active',1,NULL,NULL),(15,9,2,'2025-11-03','2025-12-03','active',1,NULL,NULL),(16,1,4,'2025-11-04','2026-11-04','active',1,NULL,NULL),(17,1,6,'2025-11-04','2025-12-04','active',1,NULL,NULL),(18,9,8,'2025-11-04','2025-11-10','active',1,NULL,NULL),(19,1,10,'2025-11-04','2025-11-10','active',1,NULL,NULL),(20,1,7,'2025-11-04','2025-11-11','active',1,NULL,NULL);
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin','vendor') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Nguyễn Văn C','dangq2359@gmail.com','12345678','user','2025-11-03 01:48:47','2025-11-03 16:38:44','0987654321','456 Đường XYZ, Quận 1, TP.HCM','1995-05-20'),(2,'trivo','tri@example.com','hashed_password_123','user','2025-11-03 02:48:11','2025-11-03 02:48:11',NULL,NULL,NULL),(3,'quan','dangq2354@gmail.com','123456','user','2025-11-03 02:53:56','2025-11-03 02:53:56',NULL,NULL,NULL),(5,'Nguyễn Văn An','an.nguyen@gmail.com','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','user','2025-11-03 03:54:57','2025-11-03 03:54:57',NULL,NULL,NULL),(6,'Trần Thị Lan','lan.tran@yahoo.com','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','user','2025-11-03 03:54:57','2025-11-03 03:54:57',NULL,NULL,NULL),(7,'Admin Quản Trị','admin@subscription.vn','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','admin','2025-11-03 03:54:57','2025-11-03 03:54:57',NULL,NULL,NULL),(9,'ta dang quan','quan@gmail.com','123456','user','2025-11-03 16:39:14','2025-11-03 16:39:37','123456','ha noi','1990-01-01'),(10,'quan','alo@gmail.com','123456','vendor','2025-11-04 15:29:19','2025-11-04 15:29:19',NULL,NULL,NULL),(11,'trivo','q1@example.com','hashed_password_123','user','2025-11-17 14:04:08','2025-11-17 14:04:08',NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_analytics`
--

DROP TABLE IF EXISTS `vendor_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_analytics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint NOT NULL,
  `date` date NOT NULL,
  `revenue` decimal(10,2) DEFAULT '0.00',
  `new_subscribers` int DEFAULT '0',
  `cancelled_subscribers` int DEFAULT '0',
  `total_subscribers` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vendor_date` (`vendor_id`,`date`),
  KEY `idx_analytics_vendor` (`vendor_id`),
  CONSTRAINT `vendor_analytics_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_analytics`
--

LOCK TABLES `vendor_analytics` WRITE;
/*!40000 ALTER TABLE `vendor_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','active') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_vendor_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'Netflix Vietnam','billing@netflix.vn','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','02812345678','Quận 1, TP.HCM','Dịch vụ streaming phim và TV show hàng đầu.','active','2025-11-03 03:54:57'),(2,'FPT Play','hotro@fptplay.vn','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','19001590','Tòa nhà FPT, Hà Nội','Dịch vụ truyền hình, thể thao và phim truyện.','active','2025-11-03 03:54:57'),(3,'Elsa Speak','support@elsaspeak.vn','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','0901234567','Quận 3, TP.HCM','Ứng dụng học nói tiếng Anh bằng AI.','pending','2025-11-03 03:54:57'),(4,'The Coffee House','cskh@coffeehouse.vn','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','18006936','Quận 3, TP.HCM','Chuỗi cà phê và không gian làm việc.','active','2025-11-04 15:45:31'),(5,'Cơm trưa văn phòng FoodHub','hotro@foodhub.vn','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','02877712345','Quận 1, TP.HCM','Dịch vụ giao cơm trưa văn phòng theo gói tháng.','active','2025-11-04 15:45:31'),(6,'SaladStop! Vietnam','info@saladstop.vn','$2a$10$Y.luoB/SASTA7E0cMqSNPumgYJ3eUsYMa.Y1M/iOzKVgMqUq1S2le','02838239579','Quận 2, TP.HCM','Chuỗi salad và đồ ăn healthy.','active','2025-11-04 15:45:31');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-15 23:45:39
