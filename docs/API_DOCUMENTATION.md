# Event Management Backend API Documentation

## Overview

The Event Management Backend API provides a comprehensive set of endpoints for user authentication, event management, and participant tracking. This API is built with Node.js, Express.js, and MongoDB, implementing JWT-based authentication with role-based access control.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://api.eventmanagement.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are two types of tokens:

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens

### Authentication Flow

1. **Register/Login** → Receive access token + refresh token
2. **API Requests** → Include access token in Authorization header
3. **Token Expiry** → Use refresh token to get new access token
4. **Logout** → Invalidate refresh token

### Authorization Header Format

```
Authorization: Bearer <access_token>
```

## Rate Limiting

Authentication endpoints have rate limiting:
- **Limit**: 100 requests per 15 minutes per IP address
- **Response**: HTTP 429 when limit exceeded

## API Endpoints

### Health & Status

#### GET /health
Check if the server is running and healthy.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api
Get basic API information and available endpoints.

**Response:**
```json
{
  "success": true,
  "message": "Event Management API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "health": "/health"
  }
}
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account with comprehensive profile information.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",         // Optional
  "gender": "male",                     // Optional: male, female, other, prefer-not-to-say
  "phone": "+1234567890",              // Optional
  "bio": "Software developer passionate about technology", // Optional, max 500 chars
  "website": "https://johndoe.com",     // Optional, valid URL
  "socialMedia": {                      // Optional
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe"
  },
  "address": {                          // Optional
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "preferences": {                      // Optional
    "emailNotifications": true,
    "smsNotifications": false,
    "marketingEmails": false,
    "theme": "auto",                   // light, dark, auto
    "language": "en"
  }
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Minimum 6 characters, required
- `firstName`: 2-50 characters, required
- `lastName`: 2-50 characters, required
- `dateOfBirth`: Valid date in the past, optional
- `gender`: One of: male, female, other, prefer-not-to-say, optional
- `phone`: Valid phone format, optional
- `bio`: Maximum 500 characters, optional
- `website`: Valid URL format, optional
- `socialMedia`: Object with valid social media URLs, optional
- `address`: Object with optional fields, optional
- `preferences`: Object with notification and UI preferences, optional

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "role": "user",
      "isBlocked": false,
      "phone": "+1234567890",
      "bio": "Software developer passionate about technology",
      "website": "https://johndoe.com",
      "socialMedia": {
        "linkedin": "https://linkedin.com/in/johndoe",
        "twitter": "https://twitter.com/johndoe",
        "instagram": "https://instagram.com/johndoe"
      },
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "United States"
      },
      "preferences": {
        "emailNotifications": true,
        "smsNotifications": false,
        "marketingEmails": false,
        "theme": "auto",
        "language": "en"
      },
      "lastLoginAt": null,
      "loginCount": 0,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "fullName": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- **400**: Validation error or user already exists
- **429**: Too many requests

#### POST /api/auth/login
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "admin@eventmanagement.com",
  "password": "Admin123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@eventmanagement.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "isBlocked": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- **400**: Validation error
- **401**: Invalid credentials or account blocked
- **429**: Too many requests

#### POST /api/auth/refresh
Get a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- **400**: Validation error
- **401**: Invalid or expired refresh token

#### POST /api/auth/logout
Logout user from current device by invalidating refresh token.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**
- **401**: Unauthorized - Invalid or missing access token


#### GET /api/auth/me
Get the profile information of the currently authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@eventmanagement.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "isBlocked": false,
      "phone": "+1234567890",
      "address": {
        "street": "123 Admin Street",
        "city": "Admin City",
        "state": "Admin State",
        "zipCode": "12345"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- **401**: Unauthorized - Invalid or missing access token
- **404**: User not found

## Data Models

### User Model
```json
{
  "_id": "string",           // Unique user identifier
  "email": "string",         // User's email address (unique)
  "firstName": "string",     // User's first name (2-50 chars)
  "lastName": "string",      // User's last name (2-50 chars)
  "role": "string",          // User role: "admin" or "user"
  "isBlocked": "boolean",    // Whether account is blocked
  "phone": "string",         // Phone number (optional)
  "address": {               // Address object (optional)
    "street": "string",      // Street address (max 100 chars)
    "city": "string",        // City name (max 50 chars)
    "state": "string",       // State/province (max 50 chars)
    "zipCode": "string"      // ZIP/postal code (max 10 chars)
  },
  "createdAt": "string",     // Creation timestamp (ISO 8601)
  "updatedAt": "string"      // Last update timestamp (ISO 8601)
}
```

## Error Handling

All API responses follow a consistent format:

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }  // Response data (if applicable)
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Detailed error information"  // For validation errors
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created (for registration)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## Test Credentials

After running the database seed script, you can use these test accounts:

### Admin Account
- **Email**: `admin@eventmanagement.com`
- **Password**: `Admin123!`
- **Role**: `admin`

### Regular User Accounts
- **Email**: `john.doe@example.com`
- **Password**: `Password123!`
- **Role**: `user`

- **Email**: `jane.smith@example.com`
- **Password**: `Password123!`
- **Role**: `user`

## Example Usage

### Complete Authentication Flow

1. **Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "firstName": "New",
    "lastName": "User",
    "dateOfBirth": "1990-05-15",
    "gender": "other",
    "phone": "+1234567890",
    "bio": "Passionate developer with 5 years of experience",
    "website": "https://newuser.dev",
    "socialMedia": {
      "linkedin": "https://linkedin.com/in/newuser",
      "twitter": "https://twitter.com/newuser"
    },
    "address": {
      "street": "456 Oak Ave",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "United States"
    },
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": false,
      "marketingEmails": false,
      "theme": "dark",
      "language": "en"
    }
  }'
```

2. **Login with existing user:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eventmanagement.com",
    "password": "Admin123!"
  }'
```

3. **Get user profile:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

4. **Refresh token:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

5. **Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token generation and verification
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Secure error responses without sensitive data

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Seed database:**
   ```bash
   npm run seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Swagger Documentation

Interactive API documentation is available in multiple formats:

- **JSON**: `docs/swagger/swagger.json`
- **YAML**: `docs/swagger/swagger.yaml`

You can view the interactive documentation using:
- [Swagger Editor](https://editor.swagger.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

## Support

For API support or questions:
- **Email**: support@eventmanagement.com
- **Documentation**: This file and Swagger specs
- **Version**: 1.0.0
