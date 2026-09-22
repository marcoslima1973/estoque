CREATE TABLE `movements` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`product` text NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`before` integer NOT NULL,
	`after` integer NOT NULL,
	`cost_before` real,
	`cost_after` real,
	`reserved_before` integer NOT NULL,
	`reserved_after` integer NOT NULL,
	`reason` text NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`actor` text NOT NULL,
	`created` text NOT NULL,
	`reversal` text,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_reversal` ON `movements` (`owner`,`reversal`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`sku` text NOT NULL,
	`title` text NOT NULL,
	`warehouse` text NOT NULL,
	`shelf` text DEFAULT '' NOT NULL,
	`minimum` integer,
	`quantity` integer DEFAULT 0 NOT NULL,
	`reserved` integer DEFAULT 0 NOT NULL,
	`purchase` integer DEFAULT 0 NOT NULL,
	`transit` integer DEFAULT 0 NOT NULL,
	`cost` real,
	`created` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_location` ON `products` (`owner`,`sku`,`warehouse`,`shelf`);