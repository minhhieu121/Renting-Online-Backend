# BorrowIt Backend API

Backend server for BorrowIt - A rental platform where users can rent products.

## Tech Stack

- **Node.js** with **Express.js**
- **PostgreSQL** (Supabase)
- **Sequelize** ORM
- **JWT** for authentication
- **Bcrypt** for password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured with your database credentials:

```env
PORT=5000
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.aohpptiayglrcvyelsns
DB_PASSWORD=@Aa0123456789
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
```

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Database Models

### User Model

Fields:
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Hashed)
- `fullName` (String)
- `phone` (String)
- `avatar` (Text URL)
- `address` (Text)
- `role` (Enum: 'customer', 'seller', 'admin')
- `status` (Enum: 'active', 'suspended', 'banned')
- `rating` (Decimal 0-5)
- `totalOrders` (Integer)
- `emailVerified` (Boolean)
- `lastLoginAt` (Date)

### Product Model

Fields:
- `id` (Integer, Primary Key)
- `sellerId` (Integer, Foreign Key to User)
- `name` (String)
- `description` (Text)
- `category` (Enum: 'Electronics', 'Clothes', 'Furniture', 'Sports', 'Books', 'Tools', 'Vehicles', 'Other')
- `pricePerDay` (Decimal)
- `salePercentage` (Integer 0-100)
- `images` (Array of URLs)
- `location` (String)
- `status` (Enum: 'available', 'rented', 'unavailable')
- `condition` (Enum: 'new', 'like_new', 'good', 'fair', 'poor')
- `rating` (Decimal 0-5)
- `totalReviews` (Integer)
- `totalRentals` (Integer)
- `minRentalDays` (Integer)
- `maxRentalDays` (Integer)
- `deposit` (Decimal)

## API Endpoints

### User APIs

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "customer"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get All Users
```http
GET /api/users?page=1&limit=10&role=customer&search=john
```

Query Parameters:
- `page` (default: 1)
- `limit` (default: 10)
- `role` (optional: customer, seller, admin)
- `status` (optional: active, suspended, banned)
- `search` (optional: search by username, email, or fullName)

#### Get User by ID
```http
GET /api/users/:id
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "+9876543210",
  "address": "123 Main St"
}
```

#### Delete User
```http
DELETE /api/users/:id
```

### Product APIs

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "sellerId": 1,
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "category": "Electronics",
  "pricePerDay": 50.00,
  "salePercentage": 10,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "location": "New York",
  "condition": "like_new",
  "minRentalDays": 1,
  "maxRentalDays": 30,
  "deposit": 200.00
}
```

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=Electronics&minPrice=10&maxPrice=100
```

Query Parameters:
- `page` (default: 1)
- `limit` (default: 10)
- `category` (optional)
- `status` (optional: available, rented, unavailable)
- `minPrice` (optional)
- `maxPrice` (optional)
- `location` (optional)
- `search` (optional: search by name or description)
- `sortBy` (default: created_at)
- `order` (default: DESC)

#### Get Product by ID
```http
GET /api/products/:id
```

#### Get Products by Seller
```http
GET /api/products/seller/:sellerId?page=1&limit=10
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "pricePerDay": 45.00,
  "status": "available"
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

#### Get Categories
```http
GET /api/products/categories/list
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "products": [ ... ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

## Testing the API

You can test the API using:

1. **cURL**
2. **Postman**
3. **Thunder Client** (VS Code extension)
4. **Insomnia**

### Example cURL Request

```bash
# Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "seller"
  }'

# Create a product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 1,
    "name": "Test Product",
    "description": "This is a test product",
    "category": "Electronics",
    "pricePerDay": 25.00,
    "location": "Hanoi",
    "condition": "good"
  }'
```

## Project Structure

```
be/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── userController.js    # User business logic
│   └── productController.js # Product business logic
├── models/
│   ├── User.js             # User model
│   ├── Product.js          # Product model
│   └── index.js            # Models export
├── routes/
│   ├── userRoutes.js       # User API routes
│   └── productRoutes.js    # Product API routes
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── server.js               # Entry point
└── README.md               # This file
```

## Features

✅ User authentication (register/login)  
✅ Password hashing with bcrypt  
✅ JWT token generation  
✅ User roles (customer, seller, admin)  
✅ Product CRUD operations  
✅ Product filtering and search  
✅ Pagination support  
✅ Seller-product relationship  
✅ Input validation  
✅ Error handling  

## Next Steps

To extend the API, consider adding:

- [ ] Order management
- [ ] Review and rating system
- [ ] Payment integration
- [ ] Image upload functionality
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Admin dashboard APIs
- [ ] Real-time notifications
- [ ] Booking/reservation system
- [ ] Report system

## License

MIT

