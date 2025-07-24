# 🛡️ Admin API Documentation - Blooms Nursery Backend

## 📋 Table of Contents
1. [Authentication Overview](#authentication-overview)
2. [Admin Routes](#admin-routes)
3. [Authentication Examples](#authentication-examples)
4. [Error Handling](#error-handling)
5. [Frontend Integration Examples](#frontend-integration-examples)

---

## 🔐 Authentication Overview

The admin system uses **JWT (JSON Web Token)** authentication with the following features:
- **Token expires in 1 hour**
- **Only one admin role**: `admin`
- **Protected routes** require `Authorization: Bearer <token>` header
- **Public routes** (GET requests) don't require authentication
- **Write operations** (POST, PUT, PATCH, DELETE) require admin authentication

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin@123`

---

## 🛡️ Admin Routes

### Base URL
```
http://localhost:3000/api/admin
```

### 1. 🔑 Admin Login
**Authenticate admin and get access token**

```http
POST /api/admin/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin@123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "last_login": "2024-01-20T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1h"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Username and password are required"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'
```

---

### 2. ✅ Verify Token
**Check if authentication token is valid**

```http
POST /api/admin/verify-token
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "admin": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    "tokenValid": true
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Token expired"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/admin/verify-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. 👤 Get Admin Profile
**Get current admin user profile information**

```http
GET /api/admin/profile
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "is_active": true,
    "created": "2024-01-01T00:00:00.000Z",
    "updated": "2024-01-20T10:30:00.000Z",
    "last_login": "2024-01-20T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. 🔄 Change Password
**Change admin password**

```http
PUT /api/admin/change-password
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "admin@123",
  "newPassword": "newSecurePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/admin/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin@123","newPassword":"newPassword123"}'
```

---

### 5. 📊 Dashboard Statistics
**Get dashboard statistics for admin panel**

```http
GET /api/admin/dashboard-stats
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "total_products": "150",
    "available_products": "145",
    "out_of_stock_products": "5",
    "total_categories": "8",
    "active_categories": "8",
    "featured_items": "5",
    "total_customers": "250"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/admin/dashboard-stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 6. 🚪 Logout
**Logout admin (client-side token removal)**

```http
POST /api/admin/logout
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/admin/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔐 Authentication Examples

### JavaScript/Frontend Examples

#### 1. Login Function
```javascript
async function adminLogin(username, password) {
    try {
        const response = await fetch('http://localhost:3000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store token in localStorage
            localStorage.setItem('adminToken', data.data.token);
            localStorage.setItem('adminData', JSON.stringify(data.data.admin));
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

// Usage
adminLogin('admin', 'admin@123')
    .then(data => console.log('Login successful:', data))
    .catch(error => console.error('Login failed:', error));
```

#### 2. Authenticated Request Helper
```javascript
async function makeAuthenticatedRequest(url, method = 'GET', data = null) {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const result = await response.json();

    // Handle token expiration
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        throw new Error('Session expired. Please login again.');
    }

    return result;
}
```

#### 3. Dashboard Stats
```javascript
async function getDashboardStats() {
    try {
        const data = await makeAuthenticatedRequest(
            'http://localhost:3000/api/admin/dashboard-stats'
        );
        console.log('Dashboard stats:', data.data);
        return data;
    } catch (error) {
        console.error('Failed to get dashboard stats:', error);
    }
}
```

#### 4. Change Password
```javascript
async function changePassword(currentPassword, newPassword) {
    try {
        const data = await makeAuthenticatedRequest(
            'http://localhost:3000/api/admin/change-password',
            'PUT',
            { currentPassword, newPassword }
        );
        console.log('Password changed successfully');
        return data;
    } catch (error) {
        console.error('Failed to change password:', error);
        throw error;
    }
}
```

#### 5. Token Verification
```javascript
async function verifyToken() {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) return false;

        const response = await fetch('http://localhost:3000/api/admin/verify-token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
}
```

#### 6. Logout Function
```javascript
async function adminLogout() {
    try {
        await makeAuthenticatedRequest(
            'http://localhost:3000/api/admin/logout',
            'POST'
        );
    } catch (error) {
        console.error('Logout request failed:', error);
    } finally {
        // Remove token regardless of API response
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/login.html';
    }
}
```

---

## ⚠️ Error Handling

### Common Error Responses

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Username and password are required"
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Access denied. Token expired. Please login again."
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Admin not found"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Login failed",
  "error": "Database connection error"
}
```

---

## 🛡️ Protected Operations

### Making CRUD Operations as Admin

Once logged in, you can perform write operations on other APIs:

#### Create Product (Example)
```javascript
const token = localStorage.getItem('adminToken');

const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        category: 'Indoor Plants',
        product_name: 'Snake Plant',
        price: 299.99,
        stock: 25,
        image: 'https://example.com/snake-plant.jpg'
    })
});
```

#### Update Product (Example)
```javascript
const response = await fetch('http://localhost:3000/api/products/1', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        stock: 30,
        price: 399.99
    })
});
```

#### Delete Product (Example)
```javascript
const response = await fetch('http://localhost:3000/api/products/1', {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

---

## 🔄 Token Management

### Token Expiration
- Tokens expire after **1 hour**
- Always check for `401` status codes
- Redirect to login when token expires
- Verify token before important operations

### Token Storage
- Store token in `localStorage` for web apps
- Store token securely in mobile apps
- Include token in `Authorization` header as `Bearer <token>`

### Token Refresh
Currently, tokens cannot be refreshed. Users must login again when tokens expire. This is a security feature to ensure active authentication.

---

## 🧪 Testing Examples

### Postman Collection Examples

#### Login Request
```
POST http://localhost:3000/api/admin/login
Headers:
  Content-Type: application/json
Body:
{
  "username": "admin",
  "password": "admin@123"
}
```

#### Protected Request
```
GET http://localhost:3000/api/admin/profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Notes

1. **Security**: Change the default password after first login
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Token Storage**: Never expose tokens in client-side code or URLs
4. **Session Management**: Implement proper logout functionality
5. **Error Handling**: Always handle authentication errors gracefully

---

## 🆘 Support

If you encounter issues:
1. Check if the admin table exists in your database
2. Verify the admin user is created with correct credentials
3. Ensure the server is running on the correct port
4. Check console logs for detailed error messages
5. Verify JWT secret is consistent across requests
