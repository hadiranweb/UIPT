ALTER TABLE `saved_analyses` ADD `epoch` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_analyses` ADD `adaptationMetric` varchar(64) DEFAULT '0' NOT NULL;