CREATE TABLE `listingReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`userId` int,
	`reason` varchar(160) NOT NULL,
	`details` text,
	`email` varchar(320),
	`status` enum('pending','resolved') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `listingReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`consentedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `portalRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` enum('contact','project','valuation','wanted','service','mortgage','event') NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40),
	`message` text NOT NULL,
	`propertyId` int,
	`developmentId` int,
	`status` enum('pending','reviewed','closed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portalRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seedVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seedKey` varchar(120) NOT NULL,
	`version` varchar(40) NOT NULL,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seedVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `seedVersions_seedKey_unique` UNIQUE(`seedKey`)
);
--> statement-breakpoint
ALTER TABLE `properties` MODIFY COLUMN `kind` enum('House','Apartment','Land','Commercial','Bungalow','Villa','Studio','Annex','Hostel','Room') NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` ADD `isDemo` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `developments` ADD `isDemo` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `subtype` varchar(100);--> statement-breakpoint
ALTER TABLE `properties` ADD `shortTerm` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `urgent` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `ready` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `offPlan` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `tourUrl` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `developmentId` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `isDemo` boolean DEFAULT false NOT NULL;