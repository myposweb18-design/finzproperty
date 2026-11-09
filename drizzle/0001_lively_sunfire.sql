CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`name` varchar(180) NOT NULL,
	`company` varchar(180) NOT NULL,
	`location` varchar(180) NOT NULL,
	`avatar` text NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`phone` varchar(40) NOT NULL,
	`listings` int NOT NULL DEFAULT 0,
	`bio` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `developments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`name` varchar(180) NOT NULL,
	`developer` varchar(180) NOT NULL,
	`location` varchar(180) NOT NULL,
	`status` varchar(120) NOT NULL,
	`fromPrice` bigint NOT NULL,
	`units` varchar(180) NOT NULL,
	`image` text NOT NULL,
	`accent` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `developments_id` PRIMARY KEY(`id`),
	CONSTRAINT `developments_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`userId` int,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40),
	`message` text NOT NULL,
	`viewingDate` varchar(60),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favourites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favourites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(220) NOT NULL,
	`title` varchar(220) NOT NULL,
	`intent` enum('buy','rent') NOT NULL,
	`kind` enum('House','Apartment','Land','Commercial') NOT NULL,
	`location` varchar(220) NOT NULL,
	`district` varchar(120) NOT NULL,
	`city` varchar(120) NOT NULL,
	`price` bigint NOT NULL,
	`bedrooms` int NOT NULL DEFAULT 0,
	`bathrooms` int NOT NULL DEFAULT 0,
	`landSize` varchar(80),
	`floorArea` varchar(80),
	`image` text NOT NULL,
	`gallery` text NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`verified` boolean NOT NULL DEFAULT false,
	`tag` varchar(80),
	`agentId` int NOT NULL,
	`description` text NOT NULL,
	`amenities` text NOT NULL,
	`posted` varchar(80) NOT NULL,
	`status` enum('active','pending','sold') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `savedSearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`query` text NOT NULL,
	`frequency` varchar(32) NOT NULL DEFAULT 'instant',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedSearches_id` PRIMARY KEY(`id`)
);
