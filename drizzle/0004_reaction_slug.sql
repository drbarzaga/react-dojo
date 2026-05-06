ALTER TABLE "content_feedback"
  ALTER COLUMN "reaction" SET DATA TYPE text
  USING CASE reaction
    WHEN 1 THEN 'terrible'
    WHEN 2 THEN 'not_helpful'
    WHEN 3 THEN 'helpful'
    WHEN 4 THEN 'love_it'
  END;
