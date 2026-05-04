CREATE TABLE "content_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"content_id" text NOT NULL,
	"reaction" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "feedback_content_idx" ON "content_feedback" USING btree ("content_type","content_id");