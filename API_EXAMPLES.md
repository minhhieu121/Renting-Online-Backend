# API Testing Examples

## Quick Start

1. Make sure the server is running on `http://localhost:5000`
2. Use these examples with cURL, Postman, or any HTTP client

## User APIs

### 1. Register a New User

**Seller Account:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "seller_test",
    "email": "seller@test.com",
    "password": "password123",
    "fullName": "Test Seller",
    "phone": "+1234567890",
    "role": "seller"
  }'
```

**Customer Account:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer_test",
    "email": "customer@test.com",
    "password": "password123",
    "fullName": "Test Customer",
    "phone": "+0987654321",
    "role": "customer"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@test.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "seller_test",
      "email": "seller@test.com",
      "fullName": "Test Seller",
      "role": "seller",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get All Users

```bash
curl http://localhost:5000/api/users?page=1&limit=10
```

With filters:
```bash
curl "http://localhost:5000/api/users?role=seller&status=active&page=1&limit=10"
```

### 4. Get User by ID

```bash
curl http://localhost:5000/api/users/1
```

### 5. Update User

```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "phone": "+1111111111",
    "address": "123 New Street, City"
  }'
```

### 6. Delete User

```bash
curl -X DELETE http://localhost:5000/api/users/1
```

---

## Product APIs

### 1. Create a Product

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 1,
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop with RTX 4080",
    "category": "Electronics",
    "pricePerDay": 50.00,
    "salePercentage": 10,
    "images": [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"
    ],
    "location": "Hanoi",
    "condition": "like_new",
    "minRentalDays": 1,
    "maxRentalDays": 30,
    "deposit": 200.00
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "sellerId": 1,
    "name": "Gaming Laptop",
    "pricePerDay": "50.00",
    ...
  }
}
```

### 2. Get All Products

Basic request:
```bash
curl http://localhost:5000/api/products?page=1&limit=10
```

With filters:
```bash
curl "http://localhost:5000/api/products?category=Electronics&status=available&minPrice=10&maxPrice=100&location=Hanoi&page=1&limit=10"
```

Search products:
```bash
curl "http://localhost:5000/api/products?search=laptop&page=1&limit=10"
```

Sort products:
```bash
curl "http://localhost:5000/api/products?sortBy=pricePerDay&order=ASC&page=1&limit=10"
```

### 3. Get Product by ID

```bash
curl http://localhost:5000/api/products/1
```

**Response includes seller information:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gaming Laptop",
    "pricePerDay": "50.00",
    "seller": {
      "id": 1,
      "username": "seller_test",
      "fullName": "Test Seller",
      "rating": "4.80",
      ...
    },
    ...
  }
}
```

### 4. Get Products by Seller

```bash
curl "http://localhost:5000/api/products/seller/1?page=1&limit=10"
```

Filter by status:
```bash
curl "http://localhost:5000/api/products/seller/1?status=available&page=1&limit=10"
```

### 5. Update Product

```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "pricePerDay": 45.00,
    "salePercentage": 15,
    "status": "available"
  }'
```

### 6. Delete Product

```bash
curl -X DELETE http://localhost:5000/api/products/1
```

### 7. Get Product Categories

```bash
curl http://localhost:5000/api/products/categories/list
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Electronics",
    "Clothes",
    "Furniture",
    "Sports",
    "Books",
    "Tools",
    "Vehicles",
    "Other"
  ]
}
```

---

## Complete Workflow Example

### Step 1: Register a Seller
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "techseller",
    "email": "tech@rental.com",
    "password": "secure123",
    "fullName": "Tech Rental Store",
    "phone": "+84912345678",
    "role": "seller"
  }'
```

### Step 2: Login to Get Token
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tech@rental.com",
    "password": "secure123"
  }'
```

### Step 3: Create Products
```bash
# Product 1
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 1,
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with amazing camera",
    "category": "Electronics",
    "pricePerDay": 30.00,
    "images": ["https://example.com/iphone.jpg"],
    "location": "Ho Chi Minh City",
    "condition": "new",
    "deposit": 500.00
  }'

# Product 2
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 1,
    "name": "Sony Camera A7III",
    "description": "Professional camera for rent",
    "category": "Electronics",
    "pricePerDay": 40.00,
    "images": ["https://example.com/camera.jpg"],
    "location": "Hanoi",
    "condition": "like_new",
    "deposit": 800.00
  }'
```

### Step 4: Browse Products
```bash
# Get all available electronics in Hanoi
curl "http://localhost:5000/api/products?category=Electronics&status=available&location=Hanoi"
```

### Step 5: Get Product Details
```bash
curl http://localhost:5000/api/products/1
```

---

## Testing with Different HTTP Clients

### JavaScript (Fetch API)
```javascript
// Register user
fetch('http://localhost:5000/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'customer'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Get products
fetch('http://localhost:5000/api/products?page=1&limit=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python (Requests)
```python
import requests

# Register user
response = requests.post('http://localhost:5000/api/users/register', json={
    'username': 'testuser',
    'email': 'test@example.com',
    'password': 'password123',
    'fullName': 'Test User',
    'role': 'customer'
})
print(response.json())

# Get products
response = requests.get('http://localhost:5000/api/products', params={
    'page': 1,
    'limit': 10,
    'category': 'Electronics'
})
print(response.json())
```

---

## Response Format Reference

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
  "message": "Error description",
  "error": "Detailed error message"
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

---

## Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Sorting
- `sortBy` - Field to sort by (default: created_at)
- `order` - Sort order: ASC or DESC (default: DESC)

### Filtering
- `category` - Filter by category
- `status` - Filter by status
- `role` - Filter by user role
- `search` - Search in name/description
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `location` - Filter by location

