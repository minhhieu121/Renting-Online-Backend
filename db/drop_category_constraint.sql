-- Drop the category check constraint from Product table
-- This will allow any category value to be inserted

ALTER TABLE "Product" 
DROP CONSTRAINT IF EXISTS "Product_category_check";

-- Optional: Add it back with updated values if needed
-- ALTER TABLE "Product"
-- ADD CONSTRAINT "Product_category_check" 
-- CHECK (category IN ('Electronics', 'Clothes', 'Furniture', 'Sports', 'Books', 'Tools', 'Vehicles', 'Other'));
