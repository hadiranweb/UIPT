ALTER TABLE `saved_analyses` ADD `engineVersion` varchar(64) DEFAULT 'onsour-rts-v1.0.0' NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_analyses` ADD `numericMode` varchar(32) DEFAULT 'fixed-q32' NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_analyses` ADD `governanceVersion` varchar(32) DEFAULT 'v1' NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_analyses` ADD `schemaVersion` varchar(32) DEFAULT 'v1' NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_analyses` ADD `snapshotHash` varchar(128) DEFAULT 'sha256-genesis' NOT NULL;--> statement-breakpoint
ALTER TABLE `saved_analyses` ADD `stateRoot` varchar(128) DEFAULT '0x00000000' NOT NULL;