Vehicle Rental System API

- Live API: https://vehicle-rental-system-server-i8l5.onrender.com
- GitHub: https://github.com/hasnathg/vehicle_rental_system_server

## Project Overview

A backend REST API for a **Vehicle Rental Management System** that supports:

- User authentication with JWT
- Role-based access control (Admin & Customer)
- Vehicle inventory management
- Booking management with automatic price calculation
- Business rules for availability, cancellations, and returns

This API is built with a **modular architecture** using controllers, services, and routes.

---

## Features

- **Authentication & Authorization**
- User signup & signin
- JWT-based authentication
- Role-based access control (Admin / Customer)

- **Users**
- Admin: View, update, delete users
- Customer: Update own profile
- Cannot delete users with active bookings

- **Vehicles**
- Admin: Create, update, delete vehicles
- Public: View all vehicles & single vehicle
- Cannot delete vehicles with active bookings

- **Bookings**
- Customer/Admin: Create bookings
- Auto price calculation (daily rate × days)
- Vehicle availability auto-updated
- Customer: Cancel booking (before start date)
- Admin: Mark booking as returned
- Auto-return for expired bookings

- **Validations & Business Rules**
- Role validation (`admin` / `customer`)
- Vehicle type validation
- Price must be positive
- Date range validation
- Availability checks

---

## Technology Stack

- **Node.js**
- **TypeScript**
- **Express.js**
- **PostgreSQL**
- **bcrypt** (password hashing)
- **jsonwebtoken (JWT)** (authentication)

---

## Setup Instructions

- Prerequisites
- Node.js
- PostgreSQL (a cloud DB like Neon)
- npm

- ### Clone the repository

- ```bash

  ```
- git clone https://github.com/hasnathg/vehicle_rental_system_server
- cd vehicle_rental_system_server

- Install dependencies
- npm install

- Configure Environment Variables
- PORT=5000
- CONNECTION_STR=your_postgres_connection_string
- JWT_SECRET=your_super_secret_key
- JWT_EXPIRES_IN=7d

- Run Database Migrations / Initialize Tables
- npm run dev

- How to Use the API
- Step 1: Register a User

- POST /api/v1/auth/signup

- Step 2: Login
- POST /api/v1/auth/signin

- Step 3: Use Token for Protected Routes
- Authorization: Bearer YOUR_TOKEN_HERE

- Step 4: Test Endpoints

- Examples:

- Create vehicle (Admin):
- POST /api/v1/vehicles
- Get all vehicles (Public):
- GET /api/v1/vehicles
- Create booking:
- POST /api/v1/bookings
- Get bookings:
- GET /api/v1/bookings
