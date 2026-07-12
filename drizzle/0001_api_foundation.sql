CREATE TABLE `apiIdempotency` (
	`key` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`scope` text NOT NULL,
	`requestHash` text NOT NULL,
	`response` text,
	`statusCode` integer,
	`createdAt` text NOT NULL,
	`expiresAt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `apiIdempotencyUserIdScopeIdx` ON `apiIdempotency` (`userId`,`scope`);--> statement-breakpoint
CREATE INDEX `apiIdempotencyExpiresAtIdx` ON `apiIdempotency` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `job` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`idempotencyKey` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`availableAt` text NOT NULL,
	`startedAt` text,
	`completedAt` text,
	`error` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jobIdempotencyKeyUnique` ON `job` (`idempotencyKey`);--> statement-breakpoint
CREATE INDEX `jobStatusAvailableAtIdx` ON `job` (`status`,`availableAt`);--> statement-breakpoint
CREATE INDEX `jobTypeStatusIdx` ON `job` (`type`,`status`);--> statement-breakpoint
ALTER TABLE `game` ADD `revision` integer DEFAULT 0 NOT NULL;