CREATE TABLE `aiAgent` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`name` text NOT NULL,
	`memory` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `aiAgentNameIdx` ON `aiAgent` (`name`);--> statement-breakpoint
CREATE TABLE `aiImage` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`prompt` text NOT NULL,
	`url` text NOT NULL,
	`itemId` text,
	`themeId` text
);
--> statement-breakpoint
CREATE INDEX `aiImageItemIdThemeIdUpdatedAtIdx` ON `aiImage` (`itemId`,`themeId`,`updatedAt`);--> statement-breakpoint
CREATE TABLE `aiPlaytestRun` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`aiAgentId` text NOT NULL,
	`config` text NOT NULL,
	`model` text NOT NULL,
	`seed` text NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`finalRound` integer,
	`summaryMarkdown` text,
	`suggestionsMarkdown` text,
	`errorMessage` text
);
--> statement-breakpoint
CREATE INDEX `aiPlaytestRunAgentIdIdx` ON `aiPlaytestRun` (`aiAgentId`);--> statement-breakpoint
CREATE INDEX `aiPlaytestRunStatusIdx` ON `aiPlaytestRun` (`status`);--> statement-breakpoint
CREATE INDEX `aiPlaytestRunCreatedAtIdx` ON `aiPlaytestRun` (`createdAt`);--> statement-breakpoint
CREATE TABLE `aiPlaytestStep` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`runId` text NOT NULL,
	`roundNo` integer NOT NULL,
	`stepNo` integer NOT NULL,
	`observation` text NOT NULL,
	`action` text NOT NULL,
	`result` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `aiPlaytestStepRunIdIdx` ON `aiPlaytestStep` (`runId`);--> statement-breakpoint
CREATE INDEX `aiPlaytestStepRoundNoIdx` ON `aiPlaytestStep` (`runId`,`roundNo`);--> statement-breakpoint
CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`userId` text NOT NULL,
	`data` text NOT NULL,
	`liveMatchId` text,
	`version` integer DEFAULT 3 NOT NULL,
	`gameMode` text DEFAULT 'shopper' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gameLiveMatchIdIdx` ON `game` (`liveMatchId`);--> statement-breakpoint
CREATE INDEX `gameUserIdIdx` ON `game` (`userId`);--> statement-breakpoint
CREATE INDEX `gameCreatedAtIdx` ON `game` (`createdAt`);--> statement-breakpoint
CREATE TABLE `leaderboardEntry` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`userId` text NOT NULL,
	`roundNo` integer NOT NULL,
	`loadoutId` text NOT NULL,
	`type` text NOT NULL,
	`score` integer NOT NULL,
	`version` integer DEFAULT 3 NOT NULL,
	`gameId` text,
	`gameMode` text DEFAULT 'shopper' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `leaderboardUserIdIdx` ON `leaderboardEntry` (`userId`);--> statement-breakpoint
CREATE INDEX `leaderboardTypeRoundNoVersionScoreIdx` ON `leaderboardEntry` (`type`,`roundNo`,`version`,`score`);--> statement-breakpoint
CREATE INDEX `leaderboardTypeVersionGameIdIdx` ON `leaderboardEntry` (`type`,`version`,`gameId`);--> statement-breakpoint
CREATE TABLE `liveMatch` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`data` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `liveMatchParticipation` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`liveMatchId` text NOT NULL,
	`userId` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `liveMatchParticipationUserIdIdx` ON `liveMatchParticipation` (`userId`);--> statement-breakpoint
CREATE INDEX `liveMatchParticipationLiveMatchIdIdx` ON `liveMatchParticipation` (`liveMatchId`);--> statement-breakpoint
CREATE TABLE `loadout` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`userId` text,
	`data` text NOT NULL,
	`gameId` text,
	`roundNo` integer NOT NULL,
	`primaryMatchParticipationId` text,
	`version` integer DEFAULT 3 NOT NULL,
	`gameMode` text DEFAULT 'shopper' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `loadoutPrimaryMatchParticipationIdIdx` ON `loadout` (`primaryMatchParticipationId`);--> statement-breakpoint
CREATE INDEX `loadoutGameIdIdx` ON `loadout` (`gameId`);--> statement-breakpoint
CREATE INDEX `loadoutRoundNoUserIdVersionCreatedAtIdx` ON `loadout` (`roundNo`,`userId`,`version`,`createdAt`);--> statement-breakpoint
CREATE INDEX `loadoutGameIdRoundNoIdx` ON `loadout` (`gameId`,`roundNo`);--> statement-breakpoint
CREATE TABLE `match` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`data` text NOT NULL,
	`liveMatchId` text,
	`gameMode` text DEFAULT 'shopper' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matchParticipation` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text,
	`updatedAt` text,
	`data` text NOT NULL,
	`matchId` text NOT NULL,
	`userId` text,
	`loadoutId` text NOT NULL,
	`sideIdx` integer NOT NULL,
	`stats` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `matchParticipationLoadoutIdIdx` ON `matchParticipation` (`loadoutId`);--> statement-breakpoint
CREATE INDEX `matchParticipationMatchIdIdx` ON `matchParticipation` (`matchId`);--> statement-breakpoint
CREATE INDEX `matchParticipationUserIdIdx` ON `matchParticipation` (`userId`);--> statement-breakpoint
CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`isAdmin` integer,
	`passwordHash` text,
	`themeId` text
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
