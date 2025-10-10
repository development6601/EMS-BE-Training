# Event Management Backend API

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration.

3. **Start MongoDB:**
   - Local: Make sure MongoDB is running on `mongodb://localhost:27017`
   - Atlas: Update `MONGODB_URI` in `.env` file

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

### 📚 API Documentation

Once the server is running, you can access:

- **Swagger UI**: `http://localhost:5000/api-docs` - Interactive API documentation
- **API Info**: `http://localhost:5000/api` - Basic API information
- **Health Check**: `http://localhost:5000/health` - Server status

### API Endpoints

#### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/me` - Get current user profile

### Test Credentials (After Seeding)

**Admin User:**
- Email: `admin@eventmanagement.com`
- Password: `Admin123!`

**Regular Users:**
- Email: `john.doe@example.com` / Password: `Password123!`
- Email: `jane.smith@example.com` / Password: `Password123!`

### Example API Calls

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eventmanagement.com",
    "password": "Admin123!"
  }'
```

#### Get Profile (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Development

- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Validation schemas
├── app.js           # Express app setup
└── server.js        # Server entry point
```

### Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### Next Steps

This completes Phase 1 of the Event Management Backend. The authentication system is now ready for your frontend trainees to integrate with.

**Phase 1 Features Implemented:**
✅ User registration and login
✅ JWT access and refresh tokens
✅ Role-based authentication (admin/user)
✅ Password hashing and validation
✅ Rate limiting and security middleware
✅ Error handling and logging
✅ Database seeding with test users

**Ready for Frontend Integration:**
- All authentication endpoints are functional
- Token management is properly implemented
- User roles are supported
- Comprehensive error handling
- Security best practices applied
