-- Migration to remove min_rental_days, max_rental_days, and deposit columns from Product table
-- Run this SQL script on your database to update the schema

-- Remove the columns if they exist
ALTER TABLE "Product" 
DROP COLUMN IF EXISTS min_rental_days,
DROP COLUMN IF EXISTS max_rental_days,
DROP COLUMN IF EXISTS deposit;

-- Verify the changes
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'Product';
