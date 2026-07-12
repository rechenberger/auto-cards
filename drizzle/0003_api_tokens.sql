CREATE TABLE `apiToken` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`tokenHash` text NOT NULL,
	`prefix` text NOT NULL,
	`scopes` text NOT NULL,
	`createdAt` text NOT NULL,
	`expiresAt` text,
	`lastUsedAt` text,
	`revokedAt` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apiTokenHashUnique` ON `apiToken` (`tokenHash`);--> statement-breakpoint
CREATE INDEX `apiTokenUserIdCreatedAtIdx` ON `apiToken` (`userId`,`createdAt`);