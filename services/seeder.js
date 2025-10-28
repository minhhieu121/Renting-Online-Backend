import dotenv from 'dotenv';
import { sequelize, syncDatabase } from '../models/index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const sampleUsers = [
  {
    username: 'admin_user',
    email: 'admin@borrowit.com',
    password: 'admin123',
    fullName: 'Admin User',
    phone: '+1234567890',
    role: 'admin',
    status: 'active',
    rating: 5.0,
    totalOrders: 0,
    emailVerified: true
  },
  {
    username: 'john_seller',
    email: 'john@borrowit.com',
    password: 'password123',
    fullName: 'John Seller',
    phone: '+1234567891',
    address: '123 Main St, New York, NY',
    role: 'seller',
    status: 'active',
    rating: 4.8,
    totalOrders: 150,
    emailVerified: true,
    avatar: 'https://ui-avatars.com/api/?name=John+Seller&background=random'
  },
  {
    username: 'sarah_seller',
    email: 'sarah@borrowit.com',
    password: 'password123',
    fullName: 'Sarah Johnson',
    phone: '+1234567892',
    address: '456 Oak Ave, Los Angeles, CA',
    role: 'seller',
    status: 'active',
    rating: 4.9,
    totalOrders: 200,
    emailVerified: true,
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random'
  },
  {
    username: 'mike_customer',
    email: 'mike@example.com',
    password: 'password123',
    fullName: 'Mike Customer',
    phone: '+1234567893',
    address: '789 Pine St, Chicago, IL',
    role: 'customer',
    status: 'active',
    rating: 4.5,
    totalOrders: 25,
    emailVerified: true,
    avatar: 'https://ui-avatars.com/api/?name=Mike+Customer&background=random'
  }
];

const sampleProducts = [
  {
    name: 'MacBook Pro 16-inch',
    description: 'High-performance laptop perfect for development and creative work. M2 Pro chip, 16GB RAM, 512GB SSD.',
    category: 'Electronics',
    pricePerDay: 50.00,
    salePercentage: 10,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
    ],
    location: 'New York',
    status: 'available',
    condition: 'like_new',
    rating: 4.8,
    totalReviews: 45,
    totalRentals: 52,
    minRentalDays: 1,
    maxRentalDays: 30,
    deposit: 500.00
  },
  {
    name: 'Canon EOS R5 Camera',
    description: 'Professional mirrorless camera with 45MP sensor. Perfect for photography and videography.',
    category: 'Electronics',
    pricePerDay: 75.00,
    salePercentage: 0,
    images: [
      'https://images.unsplash.com/photo-1606980621729-8f8e0e7c98e8?w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
    ],
    location: 'New York',
    status: 'available',
    condition: 'like_new',
    rating: 4.9,
    totalReviews: 32,
    totalRentals: 38,
    minRentalDays: 2,
    maxRentalDays: 14,
    deposit: 1000.00
  },
  {
    name: 'Gaming PC Setup',
    description: 'High-end gaming PC with RTX 4080, i9 processor, 32GB RAM. Includes monitor, keyboard, and mouse.',
    category: 'Electronics',
    pricePerDay: 60.00,
    salePercentage: 15,
    images: [
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'
    ],
    location: 'Los Angeles',
    status: 'available',
    condition: 'good',
    rating: 4.7,
    totalReviews: 28,
    totalRentals: 35,
    minRentalDays: 3,
    maxRentalDays: 30,
    deposit: 800.00
  },
  {
    name: 'Designer Leather Jacket',
    description: 'Premium leather jacket from a luxury brand. Size M, black color, barely worn.',
    category: 'Clothes',
    pricePerDay: 25.00,
    salePercentage: 20,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800'
    ],
    location: 'Los Angeles',
    status: 'available',
    condition: 'like_new',
    rating: 4.6,
    totalReviews: 18,
    totalRentals: 22,
    minRentalDays: 1,
    maxRentalDays: 7,
    deposit: 100.00
  },
  {
    name: 'Camping Tent (6-Person)',
    description: 'Spacious family camping tent with waterproof material. Easy to set up, includes carrying bag.',
    category: 'Sports',
    pricePerDay: 20.00,
    salePercentage: 0,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
    ],
    location: 'New York',
    status: 'available',
    condition: 'good',
    rating: 4.5,
    totalReviews: 42,
    totalRentals: 67,
    minRentalDays: 2,
    maxRentalDays: 14,
    deposit: 50.00
  },
  {
    name: 'Mountain Bike',
    description: 'Trek mountain bike with 29" wheels, hydraulic disc brakes, and front suspension.',
    category: 'Sports',
    pricePerDay: 30.00,
    salePercentage: 10,
    images: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800'
    ],
    location: 'Los Angeles',
    status: 'available',
    condition: 'good',
    rating: 4.7,
    totalReviews: 35,
    totalRentals: 48,
    minRentalDays: 1,
    maxRentalDays: 7,
    deposit: 150.00
  },
  {
    name: 'Modern Sofa Set',
    description: '3-seater sofa with matching armchair. Contemporary design, grey fabric, very comfortable.',
    category: 'Furniture',
    pricePerDay: 40.00,
    salePercentage: 0,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800'
    ],
    location: 'New York',
    status: 'available',
    condition: 'like_new',
    rating: 4.8,
    totalReviews: 22,
    totalRentals: 28,
    minRentalDays: 7,
    maxRentalDays: 90,
    deposit: 200.00
  },
  {
    name: 'Power Drill Set',
    description: 'Professional cordless drill with 2 batteries and complete accessory kit. DeWalt brand.',
    category: 'Tools',
    pricePerDay: 15.00,
    salePercentage: 0,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
    ],
    location: 'Los Angeles',
    status: 'available',
    condition: 'good',
    rating: 4.6,
    totalReviews: 38,
    totalRentals: 52,
    minRentalDays: 1,
    maxRentalDays: 14,
    deposit: 75.00
  },
  {
    name: 'Wedding Dress',
    description: 'Elegant white wedding dress, size 8, with beautiful lace details. Professionally cleaned.',
    category: 'Clothes',
    pricePerDay: 80.00,
    salePercentage: 0,
    images: [
      'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=800',
      'https://images.unsplash.com/photo-1594552072238-6e99bb1b9a91?w=800'
    ],
    location: 'New York',
    status: 'available',
    condition: 'like_new',
    rating: 5.0,
    totalReviews: 12,
    totalRentals: 12,
    minRentalDays: 1,
    maxRentalDays: 3,
    deposit: 300.00
  },
  {
    name: 'DJI Drone with 4K Camera',
    description: 'Professional drone with 4K camera, gimbal stabilization, and obstacle avoidance. Includes extra batteries.',
    category: 'Electronics',
    pricePerDay: 45.00,
    salePercentage: 5,
    images: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
      'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800'
    ],
    location: 'Los Angeles',
    status: 'available',
    condition: 'like_new',
    rating: 4.9,
    totalReviews: 27,
    totalRentals: 31,
    minRentalDays: 1,
    maxRentalDays: 7,
    deposit: 600.00
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database (drop existing tables and recreate)
    await syncDatabase({ force: true });
    console.log('✅ Database tables created');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.bulkCreate(sampleUsers, {
      individualHooks: true // This ensures password hashing hooks run
    });
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get seller IDs (excluding admin and customers)
    const sellers = createdUsers.filter(user => user.role === 'seller');

    // Create products
    console.log('📦 Creating products...');
    const productsWithSellers = sampleProducts.map((product, index) => ({
      ...product,
      sellerId: sellers[index % sellers.length].id // Distribute products among sellers
    }));

    const createdProducts = await Product.bulkCreate(productsWithSellers);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Products: ${createdProducts.length}\n`);
    
    console.log('👤 Sample Login Credentials:');
    console.log('   Admin: admin@borrowit.com / admin123');
    console.log('   Seller: john@borrowit.com / password123');
    console.log('   Customer: mike@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();

