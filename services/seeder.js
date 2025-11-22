const sql = require('./db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Abcd@1234';

// Note: This seeder will ADD data without deleting existing records

async function createUsers() {
  console.log('\nCreating users...');
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  
  const customers = [];
  const sellers = [];

  // Create 3 customers
  const customerData = [
    { username: 'customer1', email: 'customer1@seed.com', full_name: 'John Anderson', phone: '+84901234561', address: '123 Nguyen Hue, District 1, HCMC' },
    { username: 'customer2', email: 'customer2@seed.com', full_name: 'Emma Wilson', phone: '+84901234562', address: '456 Le Loi, District 1, HCMC' },
    { username: 'customer3', email: 'customer3@seed.com', full_name: 'David Miller', phone: '+84901234563', address: '789 Tran Hung Dao, District 5, HCMC' },
  ];

  for (const data of customerData) {
    const user = await sql`
      INSERT INTO "User" (
        username, email, password, full_name, phone, address,
        role, status, email_verified, avatar_url
      ) VALUES (
        ${data.username},
        ${data.email},
        ${hashedPassword},
        ${data.full_name},
        ${data.phone},
        ${data.address},
        'customer',
        'active',
        true,
        ${'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.full_name) + '&background=random&size=200'}
      )
      RETURNING *
    `;
    customers.push(user[0]);
    console.log(`✅ Created customer: ${data.username}`);
  }

  // Create 3 sellers
  const sellerData = [
    { username: 'seller1', email: 'seller1@seed.com', full_name: 'Tech Store', phone: '+84901234564', address: '321 Pham Ngu Lao, District 1, HCMC' },
    { username: 'seller2', email: 'seller2@seed.com', full_name: 'Fashion Hub', phone: '+84901234565', address: '654 Vo Van Tan, District 3, HCMC' },
    { username: 'seller3', email: 'seller3@seed.com', full_name: 'Home Essentials', phone: '+84901234566', address: '987 Nguyen Trai, District 5, HCMC' },
  ];

  for (const data of sellerData) {
    const user = await sql`
      INSERT INTO "User" (
        username, email, password, full_name, phone, address,
        role, status, email_verified, avatar_url
      ) VALUES (
        ${data.username},
        ${data.email},
        ${hashedPassword},
        ${data.full_name},
        ${data.phone},
        ${data.address},
        'seller',
        'active',
        true,
        ${'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.full_name) + '&background=random&size=200'}
      )
      RETURNING *
    `;
    sellers.push(user[0]);
    console.log(`✅ Created seller: ${data.username}`);
  }

  return { customers, sellers };
}

async function createProducts(sellers) {
  console.log('\nCreating products...');
  const products = [];

  const productData = [
    // Seller 1 - Tech Store
    {
      seller_id: sellers[0].user_id,
      name: 'MacBook Pro M3',
      description: 'Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for work and creative projects.',
      category: 'Electronics',
      price_per_day: 150000,
      sale_percentage: 10,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'like-new'
    },
    {
      seller_id: sellers[0].user_id,
      name: 'iPhone 15 Pro Max',
      description: 'Brand new iPhone 15 Pro Max 256GB, Titanium Blue. Includes original box and accessories.',
      category: 'Electronics',
      price_per_day: 80000,
      sale_percentage: 15,
      images: ['https://images.unsplash.com/photo-1678652197950-082d6b3f85c7?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'new'
    },
    {
      seller_id: sellers[0].user_id,
      name: 'Sony WH-1000XM5',
      description: 'Premium noise-cancelling wireless headphones with exceptional sound quality.',
      category: 'Electronics',
      price_per_day: 25000,
      sale_percentage: 0,
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'like-new'
    },
    // Seller 2 - Fashion Hub
    {
      seller_id: sellers[1].user_id,
      name: 'Designer Leather Jacket',
      description: 'Genuine leather jacket, premium quality. Perfect for stylish events.',
      category: 'Clothes',
      price_per_day: 50000,
      sale_percentage: 20,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'good'
    },
    {
      seller_id: sellers[1].user_id,
      name: 'Formal Suit Set',
      description: 'Black formal suit, tailored fit. Ideal for weddings and business meetings.',
      category: 'Clothes',
      price_per_day: 70000,
      sale_percentage: 0,
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'like-new'
    },
    {
      seller_id: sellers[1].user_id,
      name: 'Evening Dress',
      description: 'Elegant red evening dress, size M. Perfect for parties and special occasions.',
      category: 'Clothes',
      price_per_day: 60000,
      sale_percentage: 10,
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'new'
    },
    // Seller 3 - Home Essentials
    {
      seller_id: sellers[2].user_id,
      name: 'Modern Coffee Table',
      description: 'Minimalist wooden coffee table, perfect for living room setup.',
      category: 'Furniture',
      price_per_day: 40000,
      sale_percentage: 0,
      images: ['https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'good'
    },
    {
      seller_id: sellers[2].user_id,
      name: 'Office Chair Ergonomic',
      description: 'Comfortable ergonomic office chair with lumbar support. Great for home office.',
      category: 'Furniture',
      price_per_day: 30000,
      sale_percentage: 15,
      images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'like-new'
    },
    {
      seller_id: sellers[2].user_id,
      name: 'Camera Canon EOS R6',
      description: 'Professional mirrorless camera with 24-105mm lens. Perfect for photography events.',
      category: 'Electronics',
      price_per_day: 120000,
      sale_percentage: 5,
      images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'],
      location: 'Ho Chi Minh City',
      condition: 'good'
    },
  ];

  for (const data of productData) {
    const product = await sql`
      INSERT INTO "Product" (
        seller_id, name, description, category, price_per_day,
        sale_percentage, images, location, condition, status
      ) VALUES (
        ${data.seller_id},
        ${data.name},
        ${data.description},
        ${data.category},
        ${data.price_per_day},
        ${data.sale_percentage},
        ${data.images},
        ${data.location},
        ${data.condition},
        'available'
      )
      RETURNING *
    `;
    products.push(product[0]);
    console.log(`✅ Created product: ${data.name}`);
  }

  return products;
}

async function createOrders(customers, products) {
  console.log('\nCreating orders...');
  const orders = [];

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-6)}-${random}`;
  };

  const orderData = [
    // Customer 1 orders
    {
      customer_id: customers[0].user_id,
      product: products[0], // MacBook
      rental_period: '7 days',
      status: 'completed',
      placed_days_ago: 30
    },
    {
      customer_id: customers[0].user_id,
      product: products[3], // Leather Jacket
      rental_period: '3 days',
      status: 'completed',
      placed_days_ago: 15
    },
    // Customer 2 orders
    {
      customer_id: customers[1].user_id,
      product: products[1], // iPhone
      rental_period: '5 days',
      status: 'using',
      placed_days_ago: 3
    },
    {
      customer_id: customers[1].user_id,
      product: products[4], // Formal Suit
      rental_period: '2 days',
      status: 'ordered',
      placed_days_ago: 1
    },
    // Customer 3 orders
    {
      customer_id: customers[2].user_id,
      product: products[6], // Coffee Table
      rental_period: '14 days',
      status: 'shipping',
      placed_days_ago: 5
    },
    {
      customer_id: customers[2].user_id,
      product: products[8], // Camera
      rental_period: '3 days',
      status: 'return',
      placed_days_ago: 20
    },
  ];

  for (const data of orderData) {
    const placedAt = new Date();
    placedAt.setDate(placedAt.getDate() - data.placed_days_ago);

    const basePrice = data.product.price_per_day;
    const saleAmount = basePrice * (data.product.sale_percentage / 100);
    const unitPrice = basePrice - saleAmount;
    const rentalDays = parseInt(data.rental_period);
    const subtotal = unitPrice * rentalDays;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    const timeline = {
      ordered: placedAt.toISOString(),
      shipping: data.status !== 'ordered' ? new Date(placedAt.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
      using: ['using', 'return', 'checking', 'completed'].includes(data.status) ? new Date(placedAt.getTime() + 48 * 60 * 60 * 1000).toISOString() : null,
      return: ['return', 'checking', 'completed'].includes(data.status) ? new Date(placedAt.getTime() + (rentalDays + 2) * 24 * 60 * 60 * 1000).toISOString() : null,
      checking: ['checking', 'completed'].includes(data.status) ? new Date(placedAt.getTime() + (rentalDays + 3) * 24 * 60 * 60 * 1000).toISOString() : null,
      completed: data.status === 'completed' ? new Date(placedAt.getTime() + (rentalDays + 4) * 24 * 60 * 60 * 1000).toISOString() : null,
    };

    const order = await sql`
      INSERT INTO "Order" (
        order_number, customer_id, seller_id, product_id,
        rental_period, quantity, unit_price, status, placed_at,
        subtotal, tax, total_amount, timeline, shipping_address
      ) VALUES (
        ${generateOrderNumber()},
        ${data.customer_id},
        ${data.product.seller_id},
        ${data.product.product_id},
        ${data.rental_period},
        1,
        ${unitPrice},
        ${data.status},
        ${placedAt},
        ${subtotal},
        ${tax},
        ${totalAmount},
        ${sql.json(timeline)},
        ${sql.json({
          name: customers.find(c => c.user_id === data.customer_id).full_name,
          address: customers.find(c => c.user_id === data.customer_id).address,
          phone: customers.find(c => c.user_id === data.customer_id).phone
        })}
      )
      RETURNING *
    `;
    orders.push(order[0]);
    console.log(`✅ Created order: ${order[0].order_number} - ${data.status}`);
  }

  return orders;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    console.log('⚠️  NOTE: This will ADD new data without deleting existing records\n');
    console.log('Default password for all users: Abcd@1234\n');
    
    const { customers, sellers } = await createUsers();
    const products = await createProducts(sellers);
    const orders = await createOrders(customers, products);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${customers.length} customers created`);
    console.log(`   - ${sellers.length} sellers created`);
    console.log(`   - ${products.length} products created`);
    console.log(`   - ${orders.length} orders created`);
    console.log('\n👤 Test Accounts:');
    console.log('   Customers: customer1@seed.com, customer2@seed.com, customer3@seed.com');
    console.log('   Sellers: seller1@seed.com, seller2@seed.com, seller3@seed.com');
    console.log('   Password: Abcd@1234');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
