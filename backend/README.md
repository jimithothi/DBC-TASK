# Inventory Management API

A RESTful API for inventory management built with Node.js, Express, TypeScript, and MongoDB.

## Table of Contents
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [API Usage](#api-usage)
  - [Authentication](#authentication)
  - [Product Management](#product-management)
- [Environment Variables](#environment-variables)

---

## Features
- User registration and login with JWT authentication
- CRUD operations for products (with image upload)
- Pagination and filtering for product listing
- Secure password hashing
- Rate limiting and input validation

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```
   *(The code currently uses a hardcoded MongoDB URI. For production, update `src/index.ts` to use `process.env.MONGODB_URI`.)*

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   - For production:
     ```bash
     npm start
     ```
   - For development (with hot reload):
     ```bash
     npm run dev
     ```

6. **API will be available at:**
   - `http://localhost:3000/`

---

## API Usage

### Authentication

#### Register
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - `201 Created`
  ```json
  { "message": "User registered successfully." }
  ```

#### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - `200 OK`
  ```json
  {
    "message": "Login successful.",
    "token": "<JWT_TOKEN>"
  }
  ```

---

### Product Management

> **All product endpoints require a valid JWT token in the `Authorization` header:**
> `Authorization: Bearer <JWT_TOKEN>`

#### Create Product
- **Endpoint:** `POST /api/products`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Body (form-data):**
  - `name` (string, required)
  - `description` (string, optional)
  - `quantity` (integer, required)
  - `price` (float, required)
  - `category` (string, required)
  - `image` (file, required)
- **Response:**
  - `201 Created`
  ```json
  {
    "_id": "...",
    "name": "Sample Product",
    "description": "A sample product",
    "quantity": 10,
    "price": 99.99,
    "category": "Electronics",
    "image": "uploads/1234567890.png",
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

#### Get All Products
- **Endpoint:** `GET /api/products`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters (optional):**
  - `name` (string)
  - `category` (string)
  - `stockStatus` (`in_stock` | `out_of_stock`)
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
- **Response:**
  - `200 OK`
  ```json
  {
    "products": [ ... ],
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
  ```

#### Get Product By ID
- **Endpoint:** `GET /api/products/:id`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Response:**
  - `200 OK` (product object) or `404 Not Found`

#### Update Product
- **Endpoint:** `PUT /api/products/:id`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Body (form-data):**
  - Any updatable fields: `name`, `description`, `quantity`, `price`, `category`, `image`
- **Response:**
  - `200 OK` (updated product object) or `404 Not Found`

#### Delete Product
- **Endpoint:** `DELETE /api/products/:id`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Response:**
  - `200 OK`
  ```json
  { "message": "Product deleted successfully." }
  ```

---

## Environment Variables

| Variable      | Description                        |
|---------------|------------------------------------|
| PORT          | Port for the server (default: 3000)|
| MONGODB_URI   | MongoDB connection string          |
| JWT_SECRET    | Secret key for JWT signing         |

---

## Example Requests

See [`request.http`](./request.http) for ready-to-use API request examples (for use with VSCode REST Client or similar tools).
