-- Add email_verified column to user table
ALTER TABLE `user` ADD COLUMN `email_verified` boolean NOT NULL DEFAULT false;
--> statement-breakpoint
-- Create email_verification_token table
CREATE TABLE `email_verification_token` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `email_verification_token_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `email_verification_token` ADD CONSTRAINT `email_verification_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;

