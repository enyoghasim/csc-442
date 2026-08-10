ALTER TABLE "classes" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "lecturer_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "student_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "class_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "class_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "starts_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "ends_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "class_session_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "student_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "status" "attendance_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "checked_in_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classes" ADD CONSTRAINT "classes_lecturer_id_users_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "classes_code_idx" ON "classes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_student_class_idx" ON "enrollments" USING btree ("student_id","class_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_records_session_student_idx" ON "attendance_records" USING btree ("class_session_id","student_id");