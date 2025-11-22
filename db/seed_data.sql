-- Seed Data Script for BorrowIt
-- This script adds test data without deleting existing records
-- Default password for all users: Abcd@1234
-- Password hash: $2b$10$YQeR6K9ZvJXH5X5X5X5X5OeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK (you'll need to generate this)

-- Password for all users: Abcd@1234
-- Hash generated using bcrypt with 10 salt rounds

-- Create 3 Customers
INSERT INTO "User" (username, email, password, full_name, phone, address, role, status, email_verified, avatar_url, created_at, updated_at)
VALUES 
  (
    'customer1', 
    'customer1@seed.com', 
    '$2b$10$qsuoszOM4nJXu5o284vCS.W9DNUBgs/nVNY5ivMiCBDUxusEmgqTG',
    'John Anderson', 
    '+84901234561', 
    '123 Nguyen Hue, District 1, HCMC',
    'customer',
    'active',
    true,
    'https://ui-avatars.com/api/?name=John+Anderson&background=random&size=200',
    NOW(),
    NOW()
  ),
  (
    'customer2', 
    'customer2@seed.com', 
    '$2b$10$qsuoszOM4nJXu5o284vCS.W9DNUBgs/nVNY5ivMiCBDUxusEmgqTG',
    'Emma Wilson', 
    '+84901234562', 
    '456 Le Loi, District 1, HCMC',
    'customer',
    'active',
    true,
    'https://ui-avatars.com/api/?name=Emma+Wilson&background=random&size=200',
    NOW(),
    NOW()
  ),
  (
    'customer3', 
    'customer3@seed.com', 
    '$2b$10$qsuoszOM4nJXu5o284vCS.W9DNUBgs/nVNY5ivMiCBDUxusEmgqTG',
    'David Miller', 
    '+84901234563', 
    '789 Tran Hung Dao, District 5, HCMC',
    'customer',
    'active',
    true,
    'https://ui-avatars.com/api/?name=David+Miller&background=random&size=200',
    NOW(),
    NOW()
  );

-- Create 3 Sellers
INSERT INTO "User" (username, email, password, full_name, phone, address, role, status, email_verified, avatar_url, created_at, updated_at)
VALUES 
  (
    'seller1', 
    'seller1@seed.com', 
    '$2b$10$qsuoszOM4nJXu5o284vCS.W9DNUBgs/nVNY5ivMiCBDUxusEmgqTG',
    'Michael Tech Store', 
    '+84907654321', 
    '111 Hai Ba Trung, District 3, HCMC',
    'seller',
    'active',
    true,
    'https://ui-avatars.com/api/?name=Michael+Tech&background=random&size=200',
    NOW(),
    NOW()
  ),
  (
    'seller2', 
    'seller2@seed.com', 
    '$2b$10$qsuoszOM4nJXu5o284vCS.W9DNUBgs/nVNY5ivMiCBDUxusEmgqTG',
    'Fashion Haven', 
    '+84907654322', 
    '222 Dong Khoi, District 1, HCMC',
    'seller',
    'active',
    true,
    'https://ui-avatars.com/api/?name=Fashion+Haven&background=random&size=200',
    NOW(),
    NOW()
  ),
  (
    'seller3', 
    'seller3@seed.com', 
    '$2b$10$qsuoszOM4nJXu5o284vCS.W9DNUBgs/nVNY5ivMiCBDUxusEmgqTG',
    'Home Furnishings', 
    '+84907654323', 
    '333 Nguyen Thi Minh Khai, District 3, HCMC',
    'seller',
    'active',
    true,
    'https://ui-avatars.com/api/?name=Home+Furnishings&background=random&size=200',
    NOW(),
    NOW()
  );

-- Create Products for Seller 1 (Electronics)
INSERT INTO "Product" (seller_id, name, description, category, price_per_day, sale_percentage, images, location, condition, created_at, updated_at)
VALUES
  (
    (SELECT user_id FROM "User" WHERE email = 'seller1@seed.com'),
    'MacBook Pro 16" M3',
    'High-performance laptop perfect for video editing, development, and creative work. M3 Max chip with 64GB RAM.',
    'Electronics',
    150000,
    0,
    ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
    'District 1, HCMC',
    'Like New',
    NOW(),
    NOW()
  ),
  (
    (SELECT user_id FROM "User" WHERE email = 'seller1@seed.com'),
    'Sony A7 IV Camera',
    'Professional mirrorless camera with 33MP sensor. Includes 24-70mm lens.',
    'Electronics',
    200000,
    10,
    ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 'https://images.unsplash.com/photo-1606980632916-2ef86a5c93f8?w=800'],
    'District 1, HCMC',
    'Excellent',
    NOW(),
    NOW()
  ),
  (
    (SELECT user_id FROM "User" WHERE email = 'seller1@seed.com'),
    'DJI Mini 3 Pro Drone',
    'Compact drone with 4K camera, perfect for aerial photography and videography.',
    'Electronics',
    120000,
    0,
    ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800'],
    'District 3, HCMC',
    'Good',
    NOW(),
    NOW()
  );

-- Create Products for Seller 2 (Clothes)
INSERT INTO "Product" (seller_id, name, description, category, price_per_day, sale_percentage, images, location, condition, created_at, updated_at)
VALUES
  (
    (SELECT user_id FROM "User" WHERE email = 'seller2@seed.com'),
    'Designer Evening Gown',
    'Elegant black evening gown perfect for formal events, galas, and special occasions.',
    'Clothes',
    50000,
    15,
    ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
    'District 1, HCMC',
    'Like New',
    NOW(),
    NOW()
  ),
  (
    (SELECT user_id FROM "User" WHERE email = 'seller2@seed.com'),
    'Men''s Tuxedo Suit',
    'Classic black tuxedo with bow tie. Perfect fit for weddings and formal events.',
    'Clothes',
    40000,
    0,
    ARRAY['https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800'],
    'District 1, HCMC',
    'Excellent',
    NOW(),
    NOW()
  ),
  (
    (SELECT user_id FROM "User" WHERE email = 'seller2@seed.com'),
    'Traditional Ao Dai',
    'Beautiful Vietnamese traditional dress in red with golden embroidery.',
    'Clothes',
    30000,
    20,
    ARRAY['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800'],
    'District 3, HCMC',
    'Like New',
    NOW(),
    NOW()
  );

-- Create Products for Seller 3 (Furniture)
INSERT INTO "Product" (seller_id, name, description, category, price_per_day, sale_percentage, images, location, condition, created_at, updated_at)
VALUES
  (
    (SELECT user_id FROM "User" WHERE email = 'seller3@seed.com'),
    'Modern Sofa Set',
    'Comfortable 3-seater sofa with matching armchair. Perfect for events or temporary housing.',
    'Furniture',
    80000,
    0,
    ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800'],
    'District 3, HCMC',
    'Good',
    NOW(),
    NOW()
  ),
  (
    (SELECT user_id FROM "User" WHERE email = 'seller3@seed.com'),
    'Dining Table Set',
    'Wooden dining table with 6 chairs. Elegant design suitable for parties and gatherings.',
    'Furniture',
    60000,
    5,
    ARRAY['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'],
    'District 5, HCMC',
    'Excellent',
    NOW(),
    NOW()
  ),
  (
    (SELECT user_id FROM "User" WHERE email = 'seller3@seed.com'),
    'King Size Bed Frame',
    'Luxury king size bed frame with headboard. Modern minimalist design.',
    'Furniture',
    70000,
    0,
    ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
    'District 7, HCMC',
    'Like New',
    NOW(),
    NOW()
  );

-- Create Orders
-- Order 1: Completed order (MacBook rental by customer1)
INSERT INTO "Order" (customer_id, seller_id, product_id, order_number, rental_period, quantity, unit_price, subtotal, total_amount, status, placed_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer1@seed.com'),
  (SELECT user_id FROM "User" WHERE email = 'seller1@seed.com'),
  (SELECT product_id FROM "Product" WHERE name = 'MacBook Pro 16" M3' LIMIT 1),
  'ORD-' || LPAD((FLOOR(RANDOM() * 1000000))::TEXT, 6, '0'),
  '7 days',
  1,
  (SELECT price_per_day * (1 - sale_percentage / 100.0) FROM "Product" WHERE name = 'MacBook Pro 16" M3' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 7 FROM "Product" WHERE name = 'MacBook Pro 16" M3' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 7 FROM "Product" WHERE name = 'MacBook Pro 16" M3' LIMIT 1),
  'completed',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '10 days'
);

-- Order 2: Currently using (Camera rental by customer2)
INSERT INTO "Order" (customer_id, seller_id, product_id, order_number, rental_period, quantity, unit_price, subtotal, total_amount, status, placed_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer2@seed.com'),
  (SELECT user_id FROM "User" WHERE email = 'seller1@seed.com'),
  (SELECT product_id FROM "Product" WHERE name = 'Sony A7 IV Camera' LIMIT 1),
  'ORD-' || LPAD((FLOOR(RANDOM() * 1000000))::TEXT, 6, '0'),
  '14 days',
  1,
  (SELECT price_per_day * (1 - sale_percentage / 100.0) FROM "Product" WHERE name = 'Sony A7 IV Camera' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 14 FROM "Product" WHERE name = 'Sony A7 IV Camera' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 14 FROM "Product" WHERE name = 'Sony A7 IV Camera' LIMIT 1),
  'using',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Order 3: Ordered but not started (Evening Gown by customer3)
INSERT INTO "Order" (customer_id, seller_id, product_id, order_number, rental_period, quantity, unit_price, subtotal, total_amount, status, placed_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer3@seed.com'),
  (SELECT user_id FROM "User" WHERE email = 'seller2@seed.com'),
  (SELECT product_id FROM "Product" WHERE name = 'Designer Evening Gown' LIMIT 1),
  'ORD-' || LPAD((FLOOR(RANDOM() * 1000000))::TEXT, 6, '0'),
  '3 days',
  1,
  (SELECT price_per_day * (1 - sale_percentage / 100.0) FROM "Product" WHERE name = 'Designer Evening Gown' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 3 FROM "Product" WHERE name = 'Designer Evening Gown' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 3 FROM "Product" WHERE name = 'Designer Evening Gown' LIMIT 1),
  'ordered',
  NOW(),
  NOW(),
  NOW()
);

-- Order 4: Shipping (Sofa by customer1)
INSERT INTO "Order" (customer_id, seller_id, product_id, order_number, rental_period, quantity, unit_price, subtotal, total_amount, status, placed_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer1@seed.com'),
  (SELECT user_id FROM "User" WHERE email = 'seller3@seed.com'),
  (SELECT product_id FROM "Product" WHERE name = 'Modern Sofa Set' LIMIT 1),
  'ORD-' || LPAD((FLOOR(RANDOM() * 1000000))::TEXT, 6, '0'),
  '30 days',
  1,
  (SELECT price_per_day * (1 - sale_percentage / 100.0) FROM "Product" WHERE name = 'Modern Sofa Set' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 30 FROM "Product" WHERE name = 'Modern Sofa Set' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 30 FROM "Product" WHERE name = 'Modern Sofa Set' LIMIT 1),
  'shipping',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW()
);

-- Order 5: Return in progress (Tuxedo by customer2)
INSERT INTO "Order" (customer_id, seller_id, product_id, order_number, rental_period, quantity, unit_price, subtotal, total_amount, status, placed_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer2@seed.com'),
  (SELECT user_id FROM "User" WHERE email = 'seller2@seed.com'),
  (SELECT product_id FROM "Product" WHERE name = 'Men''s Tuxedo Suit' LIMIT 1),
  'ORD-' || LPAD((FLOOR(RANDOM() * 1000000))::TEXT, 6, '0'),
  '2 days',
  1,
  (SELECT price_per_day * (1 - sale_percentage / 100.0) FROM "Product" WHERE name = 'Men''s Tuxedo Suit' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 2 FROM "Product" WHERE name = 'Men''s Tuxedo Suit' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 2 FROM "Product" WHERE name = 'Men''s Tuxedo Suit' LIMIT 1),
  'return',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  NOW()
);

-- Order 6: Checking (Drone by customer3)
INSERT INTO "Order" (customer_id, seller_id, product_id, order_number, rental_period, quantity, unit_price, subtotal, total_amount, status, placed_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer3@seed.com'),
  (SELECT user_id FROM "User" WHERE email = 'seller1@seed.com'),
  (SELECT product_id FROM "Product" WHERE name = 'DJI Mini 3 Pro Drone' LIMIT 1),
  'ORD-' || LPAD((FLOOR(RANDOM() * 1000000))::TEXT, 6, '0'),
  '5 days',
  1,
  (SELECT price_per_day * (1 - sale_percentage / 100.0) FROM "Product" WHERE name = 'DJI Mini 3 Pro Drone' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 5 FROM "Product" WHERE name = 'DJI Mini 3 Pro Drone' LIMIT 1),
  (SELECT price_per_day * (1 - sale_percentage / 100.0) * 5 FROM "Product" WHERE name = 'DJI Mini 3 Pro Drone' LIMIT 1),
  'checking',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '1 day'
);

-- Create Reviews
-- Review 1: Excellent review for MacBook (Order 1 - completed)
INSERT INTO "Review" (reviewer_id, order_id, product_id, satisfaction, satisfaction_score, experience, highlights, improvements, photos, photos_count, submitted_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer1@seed.com'),
  (SELECT order_id FROM "Order" WHERE order_number LIKE 'ORD-%' AND customer_id = (SELECT user_id FROM "User" WHERE email = 'customer1@seed.com') AND product_id = (SELECT product_id FROM "Product" WHERE name = 'MacBook Pro 16" M3' LIMIT 1) LIMIT 1),
  (SELECT product_id FROM "Product" WHERE name = 'MacBook Pro 16" M3' LIMIT 1),
  'Excellent',
  5.0,
  '{"quality": 5, "communication": 5, "value": 5, "condition": 5}'::jsonb,
  'Amazing performance! The M3 chip is incredibly fast. Perfect condition and the seller was very responsive.',
  'Maybe include a carrying case next time.',
  '[]'::jsonb,
  0,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days'
);

-- Review 2: Good review for Camera (assume it was returned and reviewed)
INSERT INTO "Review" (reviewer_id, order_id, product_id, satisfaction, satisfaction_score, experience, highlights, improvements, photos, photos_count, submitted_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer2@seed.com'),
  (SELECT order_id FROM "Order" WHERE order_number LIKE 'ORD-%' AND customer_id = (SELECT user_id FROM "User" WHERE email = 'customer2@seed.com') AND product_id = (SELECT product_id FROM "Product" WHERE name = 'Sony A7 IV Camera' LIMIT 1) LIMIT 1),
  (SELECT product_id FROM "Product" WHERE name = 'Sony A7 IV Camera' LIMIT 1),
  'Good',
  4.0,
  '{"quality": 4, "communication": 5, "value": 4, "condition": 4}'::jsonb,
  'Great camera for professional work. The lens quality is excellent and captured amazing shots.',
  'The battery life could be better, maybe provide an extra battery.',
  '[]'::jsonb,
  0,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Review 3: Excellent review for Evening Gown
INSERT INTO "Review" (reviewer_id, order_id, product_id, satisfaction, satisfaction_score, experience, highlights, improvements, photos, photos_count, submitted_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer3@seed.com'),
  (SELECT order_id FROM "Order" WHERE order_number LIKE 'ORD-%' AND customer_id = (SELECT user_id FROM "User" WHERE email = 'customer3@seed.com') AND product_id = (SELECT product_id FROM "Product" WHERE name = 'Designer Evening Gown' LIMIT 1) LIMIT 1),
  (SELECT product_id FROM "Product" WHERE name = 'Designer Evening Gown' LIMIT 1),
  'Excellent',
  5.0,
  '{"quality": 5, "communication": 5, "value": 5, "condition": 5}'::jsonb,
  'Absolutely stunning dress! Fit perfectly and received so many compliments at the gala. The fabric quality is top-notch.',
  'None, everything was perfect!',
  '[]'::jsonb,
  0,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Review 4: Average review for Tuxedo
INSERT INTO "Review" (reviewer_id, order_id, product_id, satisfaction, satisfaction_score, experience, highlights, improvements, photos, photos_count, submitted_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer2@seed.com'),
  (SELECT order_id FROM "Order" WHERE order_number LIKE 'ORD-%' AND customer_id = (SELECT user_id FROM "User" WHERE email = 'customer2@seed.com') AND product_id = (SELECT product_id FROM "Product" WHERE name = 'Men''s Tuxedo Suit' LIMIT 1) LIMIT 1),
  (SELECT product_id FROM "Product" WHERE name = 'Men''s Tuxedo Suit' LIMIT 1),
  'Average',
  3.0,
  '{"quality": 3, "communication": 4, "value": 3, "condition": 3}'::jsonb,
  'The tuxedo was decent for the event. Fit was okay.',
  'The bow tie was a bit worn. Could use some cleaning or replacement.',
  '[]'::jsonb,
  0,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Review 5: Good review for Drone
INSERT INTO "Review" (reviewer_id, order_id, product_id, satisfaction, satisfaction_score, experience, highlights, improvements, photos, photos_count, submitted_at, created_at, updated_at)
VALUES (
  (SELECT user_id FROM "User" WHERE email = 'customer3@seed.com'),
  (SELECT order_id FROM "Order" WHERE order_number LIKE 'ORD-%' AND customer_id = (SELECT user_id FROM "User" WHERE email = 'customer3@seed.com') AND product_id = (SELECT product_id FROM "Product" WHERE name = 'DJI Mini 3 Pro Drone' LIMIT 1) LIMIT 1),
  (SELECT product_id FROM "Product" WHERE name = 'DJI Mini 3 Pro Drone' LIMIT 1),
  'Good',
  4.5,
  '{"quality": 5, "communication": 4, "value": 4, "condition": 5}'::jsonb,
  'Fantastic drone for aerial photography! Easy to fly and the 4K camera produces crisp footage. Came with all accessories.',
  'Instructions could be clearer for first-time users.',
  '[]'::jsonb,
  0,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Update Product ratings based on reviews
UPDATE "Product" SET 
  rating = 5.0,
  total_reviews = 1,
  total_rentals = 1
WHERE name = 'MacBook Pro 16" M3';

UPDATE "Product" SET 
  rating = 4.0,
  total_reviews = 1,
  total_rentals = 1
WHERE name = 'Sony A7 IV Camera';

UPDATE "Product" SET 
  rating = 5.0,
  total_reviews = 1,
  total_rentals = 1
WHERE name = 'Designer Evening Gown';

UPDATE "Product" SET 
  rating = 3.0,
  total_reviews = 1,
  total_rentals = 1
WHERE name = 'Men''s Tuxedo Suit';

UPDATE "Product" SET 
  rating = 4.5,
  total_reviews = 1,
  total_rentals = 1
WHERE name = 'DJI Mini 3 Pro Drone';

-- Summary
SELECT 
  '✅ Seed data insertion completed!' as message,
  'Test accounts created:' as accounts,
  'Customers: customer1@seed.com, customer2@seed.com, customer3@seed.com' as customers,
  'Sellers: seller1@seed.com, seller2@seed.com, seller3@seed.com' as sellers,
  'Password: Abcd@1234' as password,
  '5 reviews added with ratings from 3.0 to 5.0' as reviews;
