const ordersData = [
  {
    orderId: 2,
    orderNumber: "ORD-3002",
    customerId: 2,
    buyerName: "John Doe",
    productId: 2,
    productName: "Skinny Jeans",
    productImage: "https://example.com/jeans.jpg",
    productSize: "L",
    productColor: "Blue",
    rentalPeriod: "7 days",
    quantity: 1,
    unitPrice: 240,
    status: "Shipping",
    placedDate: "2025-07-08T00:00:00Z",
    subtotal: 240,
    tax: 24,
    totalAmount: 264,
    shippingAddress: {
      zip: "10001",
      city: "New York",
      state: "NY",
      address: "858 Fashion Street"
    },
    timeline: [
      { title: "Order Placed", date: "2025-07-08 00:00:00", completed: true },
      { title: "Shipping", date: "2025-07-09 00:00:00", completed: true },
      { title: "Received", date: "2025-07-10 00:00:00", completed: true },
      { title: "Returned", date: "2025-07-13 00:00:00", completed: false }
    ],
    receivingInfo: { date: "2025-07-10 00:00:00", title: "Received", completed: true },
    returnInfo: { date: "2025-07-13 00:00:00", title: "Returned", completed: false },
    notes: null
  },
  {
    orderId: 3,
    orderNumber: "ORD-3003",
    customerId: 5,
    buyerName: "Michael Johnson",
    productId: 2,
    productName: "Skinny Jeans",
    productImage: "https://example.com/jeans.jpg",
    productSize: "L",
    productColor: "Blue",
    rentalPeriod: "7 days",
    quantity: 1,
    unitPrice: 240,
    status: "Returned",
    placedDate: "2025-04-18T00:00:00Z",
    subtotal: 240,
    tax: 24,
    totalAmount: 264,
    shippingAddress: {
      zip: "10001",
      city: "New York",
      state: "NY",
      address: "382 Fashion Street"
    },
    timeline: [
      { title: "Order Placed", date: "2025-04-18 00:00:00", completed: true },
      { title: "Shipping", date: "2025-04-19 00:00:00", completed: true },
      { title: "Received", date: "2025-04-20 00:00:00", completed: true },
      { title: "Returned", date: "2025-04-23 00:00:00", completed: false }
    ],
    receivingInfo: { date: "2025-04-20 00:00:00", title: "Received", completed: true },
    returnInfo: { date: "2025-04-23 00:00:00", title: "Returned", completed: false },
    notes: null
  },
  {
    orderId: 4,
    orderNumber: "ORD-3004",
    customerId: 6,
    buyerName: "Emma Davis",
    productId: 3,
    productName: "Designer Coat",
    productImage: "https://example.com/coat.jpg",
    productSize: "XL",
    productColor: "Grey",
    rentalPeriod: "5 days",
    quantity: 1,
    unitPrice: 300,
    status: "Ordered",
    placedDate: "2025-10-17T00:00:00Z",
    subtotal: 300,
    tax: 30,
    totalAmount: 330,
    shippingAddress: {
      zip: "10001",
      city: "New York",
      state: "NY",
      address: "578 Fashion Street"
    },
    timeline: [
      { title: "Order Placed", date: "2025-10-17 00:00:00", completed: true },
      { title: "Shipping", date: "2025-10-18 00:00:00", completed: true },
      { title: "Received", date: "2025-10-19 00:00:00", completed: true },
      { title: "Returned", date: "2025-10-22 00:00:00", completed: false }
    ],
    receivingInfo: { date: "2025-10-19 00:00:00", title: "Received", completed: true },
    returnInfo: { date: "2025-10-22 00:00:00", title: "Returned", completed: false },
    notes: null
  },
  {
    orderId: 28,
    orderNumber: "ORD-3001",
    customerId: 28,
    buyerName: "Michael Johnson",
    productId: 3,
    productName: "Leather Jacket",
    productImage: "https://example.com/jacket.jpg",
    productSize: "L",
    productColor: "Black",
    rentalPeriod: "5 days",
    quantity: 1,
    unitPrice: 250,
    status: "Shipping",
    placedDate: "2025-04-04T00:00:00Z",
    subtotal: 250,
    tax: 25,
    totalAmount: 275,
    shippingAddress: {
      zip: "10001",
      city: "New York",
      state: "NY",
      address: "688 Fashion Street"
    },
    timeline: [
      { title: "Order Placed", date: "2025-04-04 00:00:00", completed: true },
      { title: "Shipping", date: "2025-04-05 00:00:00", completed: true },
      { title: "Received", date: "2025-04-06 00:00:00", completed: true },
      { title: "Returned", date: "2025-04-09 00:00:00", completed: false }
    ],
    receivingInfo: { date: "2025-04-06 00:00:00", title: "Received", completed: true },
    returnInfo: { date: "2025-04-09 00:00:00", title: "Returned", completed: false },
    notes: null
  }
];

module.exports = ordersData;
