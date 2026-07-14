DROP INDEX `loadoutGameIdRoundNoIdx`;--> statement-breakpoint
CREATE UNIQUE INDEX `loadoutGameIdRoundNoUnique` ON `loadout` (`gameId`,`roundNo`);