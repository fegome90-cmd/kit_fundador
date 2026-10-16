CREATE SCHEMA "lego_app";
--> statement-breakpoint
CREATE TABLE "lego_app"."notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
