-- Drop all CHECK constraints from User and Product tables

-- Drop User table constraints
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_role_check";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_status_check";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_rating_check";

-- Drop Product table constraints
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_category_check";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_price_per_day_check";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_sale_percentage_check";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_status_check";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_condition_check";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_rating_check";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_deposit_check";

-- Verify constraints are dropped
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid IN ('"User"'::regclass, '"Product"'::regclass)
    AND contype = 'c';  -- 'c' means CHECK constraint
