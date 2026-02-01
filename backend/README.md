# CampusCash Backend API

Express + MongoDB backend for the CampusCash student finance tracker.

## Features

- 🔐 User authentication (JWT)
- 💰 Transaction management (income/expenses)
- 📊 Statistics and analytics
- 🎯 Category-based tracking
- 🔒 Secure password hashing
- ✅ Input validation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**

- Install MongoDB on your machine
- Start MongoDB: `mongod`
- It will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**

- Go to https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Use it in `.env` file

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb://localhost:27017/campuscash
JWT_SECRET=your-super-secret-key-here
PORT=5000
```

### 4. Run the Server

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

**Register**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Current User**

```http
GET /api/auth/me
Authorization: Bearer <your-token>
```

### Transactions

**Get All Transactions**

```http
GET /api/transactions
Authorization: Bearer <your-token>
```

**Create Transaction**

```http
POST /api/transactions
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "amount": 500,
  "category": "Food & Drinks",
  "type": "expense",
  "note": "Lunch at cafeteria"
}
```

**Update Transaction**

```http
PUT /api/transactions/:id
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "amount": 600,
  "note": "Updated note"
}
```

**Delete Transaction**

```http
DELETE /api/transactions/:id
Authorization: Bearer <your-token>
```

### Statistics

**Get Stats**

```http
GET /api/stats
Authorization: Bearer <your-token>
```

Returns:

```json
{
  "totalIncome": 50000,
  "totalExpenses": 30000,
  "balance": 20000,
  "categoryBreakdown": {
    "Food & Drinks": 10000,
    "Transport": 5000
  },
  "transactionCount": 45
}
```

### User Settings

**Update Budget**

```http
PUT /api/user/budget
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "budget": 60000
}
```

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create transaction (replace TOKEN with your JWT)
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":500,"category":"Food & Drinks","type":"expense","note":"Lunch"}'
```

### Using Postman

1. Import the API endpoints
2. Set Authorization header: `Bearer <your-token>`
3. Test all endpoints

## Project Structure

```
backend/
├── models/
│   ├── User.js           # User schema
│   └── Transaction.js    # Transaction schema
├── server.js             # Main Express app
├── package.json          # Dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `404` - Not Found
- `500` - Server Error

Error response format:

```json
{
  "error": "Error message here"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- CORS enabled for frontend communication
- Input validation on all endpoints
- User can only access their own data

## Next Steps

1. Connect frontend to backend
2. Deploy to production (Heroku, Railway, Render)
3. Add more features (budgets, recurring transactions, etc.)

## Troubleshooting

**MongoDB connection failed:**

- Make sure MongoDB is running
- Check MONGO_URI in .env

**Port already in use:**

- Change PORT in .env
- Or kill process using port 5000

**JWT errors:**

- Make sure JWT_SECRET is set in .env
- Check if token is being sent in Authorization header
