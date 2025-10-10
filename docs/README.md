# Event Management API Documentation

## 📚 Simple Swagger Documentation

This directory contains the API documentation for the Event Management Backend.

### 🚀 Quick Access

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Access Swagger UI:**
   - **Swagger Documentation**: `http://localhost:5000/api-docs`
   - **API Info**: `http://localhost:5000/api`
   - **Health Check**: `http://localhost:5000/health`

### 📁 Files

- `swagger/swagger.yaml` - Complete API documentation
- `swagger/swagger.json` - JSON version of the documentation
- `API_DOCUMENTATION.md` - Legacy documentation (for reference)

### 🧪 Test Credentials

After running `npm run seed`, you can use:

**Admin User:**
- Email: `admin@eventmanagement.com`
- Password: `Admin123!`

**Regular Users:**
- Email: `john.doe@example.com` / Password: `Password123!`
- Email: `jane.smith@example.com` / Password: `Password123!`

### 🔧 Authentication

The API uses JWT tokens. Include the access token in requests:

```
Authorization: Bearer <access_token>
```

### 📝 Available Endpoints

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/logout` - Logout user
- **GET** `/api/auth/me` - Get user profile
- **GET** `/health` - Health check
- **GET** `/api` - API information

That's it! Simple and clean documentation for your trainees. 🎉