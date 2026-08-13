# Microservices System

A backend **microservices-based system** built using **Node.js, Express.js, MongoDB, NATS JetStream, and Docker**.

The system demonstrates:

* Microservices architecture
* API Gateway pattern
* Secure inter-service messaging
* Asynchronous event-driven communication
* Reliable message delivery using NATS JetStream
* JWT-based authentication
* Password hashing
* Dockerized services
* Environment-based configuration
* Clean separation of responsibilities

---

## Architecture

```text
                         Client
                           |
                           v
                  API Gateway :5000
                           |
                           | HTTP
                           v
                  User Service :5001
                     /           \
                    /             \
                   v               v
              MongoDB          NATS JetStream
                                    |
                                    | user.created
                                    v
                         Notification Service
```

### Communication Model

The **API Gateway → User Service** communication uses HTTP.

The **User Service → Notification Service** communication does **NOT** use REST APIs or WebSockets.

Instead, services communicate asynchronously through **NATS JetStream**.

```text
Client
  |
  | HTTP
  v
API Gateway
  |
  | HTTP
  v
User Service
  |
  | Publish: user.created
  v
NATS JetStream
  |
  | Subscribe / Consume
  v
Notification Service
```

This keeps the User Service and Notification Service loosely coupled.

---

# Services

## 1. API Gateway

Runs on port `5000`.

Responsibilities:

* Acts as the single entry point for clients
* Routes user-related HTTP requests to the User Service
* Keeps internal service communication hidden from clients
* Uses Axios for HTTP communication with the User Service

---

## 2. User Service

Runs on port `5001`.

Responsibilities:

* Create users
* Retrieve users
* Validate request data
* Prevent duplicate email addresses
* Hash passwords using `bcryptjs`
* Authenticate users using JWT
* Store users in MongoDB
* Publish `user.created` events through NATS JetStream

---

## 3. Notification Service

The Notification Service processes asynchronous events from NATS JetStream.

Responsibilities:

* Connect securely to NATS
* Access the `USERS` JetStream stream
* Consume `user.created` events
* Process notification events
* Acknowledge successfully processed messages

Example log:

```text
📩 User created event received:
{
  id: "...",
  name: "Final Test User",
  email: "finaltest20260813_01@example.com"
}

✅ Message acknowledged
```

---

## 4. MongoDB

MongoDB is used as the persistent database for the User Service.

The database runs inside Docker and uses a persistent Docker volume:

```text
mongodb_data
```

---

## 5. NATS JetStream

NATS is used as the message broker between the User Service and Notification Service.

JetStream provides reliable event delivery and message persistence.

The system uses:

```text
Stream: USERS
Subject: user.created
```

The Notification Service acknowledges successfully processed messages.

This provides a foundation for reliable asynchronous communication.

---

# Technologies Used

* Node.js
* Express.js
* MongoDB
* Mongoose
* NATS
* NATS JetStream
* bcryptjs
* JSON Web Token (JWT)
* Axios
* JavaScript
* Docker
* Docker Compose
* Git
* GitHub

---

# API Documentation

## API Gateway Health Check

```http
GET /
```

URL:

```text
http://localhost:5000/
```

Expected response:

```json
{
  "message": "API Gateway is running"
}
```

---

## Get All Users

```http
GET /api/users
```

URL:

```text
http://localhost:5000/api/users
```

---

## Create User

```http
POST /api/users
```

URL:

```text
http://localhost:5000/api/users
```

Request body:

```json
{
  "name": "Anshika",
  "email": "anshika@example.com",
  "password": "Test@123456"
}
```

The password is hashed using `bcryptjs` before being stored in MongoDB.

---

## User Login

```http
POST /api/users/login
```

URL:

```text
http://localhost:5000/api/users/login
```

Request body:

```json
{
  "email": "anshika@example.com",
  "password": "Test@123456"
}
```

Successful response contains a JWT:

```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "<user-id>",
    "name": "Anshika",
    "email": "anshika@example.com"
  }
}
```

The JWT is signed using a secret stored in an environment variable.

---

# NATS Event

When a user is successfully created, the User Service publishes:

```text
user.created
```

Example payload:

```json
{
  "id": "user-id",
  "name": "Anshika",
  "email": "anshika@example.com"
}
```

The event is published to NATS JetStream.

The Notification Service consumes the event and acknowledges it after successful processing.

---

# Communication Flow

## Synchronous Communication

```text
Client
   |
   | HTTP
   v
API Gateway
   |
   | HTTP
   v
User Service
   |
   v
MongoDB
```

## Asynchronous Communication

```text
User Service
     |
     | user.created
     v
NATS JetStream
     |
     | consume + acknowledge
     v
Notification Service
```

The User Service does not directly call the Notification Service.

Therefore, the two services remain loosely coupled.

---

# Security

The system implements multiple security measures.

### Password Security

Passwords are hashed using:

```text
bcryptjs
```

Plain-text passwords are not stored in MongoDB.

### JWT Authentication

User login generates a signed JWT.

The JWT secret and expiration configuration are stored in environment variables.

Example:

```env
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1h
```

Actual secrets must never be committed to GitHub.

### Secure NATS Authentication

NATS uses username/password authentication.

Credentials are provided through environment variables rather than being hardcoded in application code.

Example:

```env
NATS_USER=microservice
NATS_PASSWORD=your_nats_password_here
```

### Environment Variables

Sensitive configuration is kept outside the source code.

The `.env` file is excluded through `.gitignore`.

A safe template is provided as:

```text
.env.example
```

---

# Reliability

NATS JetStream is used instead of basic fire-and-forget messaging.

The Notification Service:

1. Connects to NATS
2. Accesses the `USERS` stream
3. Creates/finds its consumer
4. Receives `user.created` events
5. Processes the event
6. Acknowledges the message

Example:

```text
User Service
     |
     v
NATS JetStream
     |
     v
Notification Consumer
     |
     v
Message Processing
     |
     v
ACK
```

This provides reliable asynchronous event processing.

---

# Docker

The complete application can be run using Docker Compose.

Docker Compose manages:

* API Gateway
* User Service
* Notification Service
* MongoDB
* NATS JetStream

## Docker Services

| Service              |     Port | Purpose            |
| -------------------- | -------: | ------------------ |
| API Gateway          |     5000 | Client entry point |
| User Service         |     5001 | User management    |
| MongoDB              |    27017 | Database           |
| NATS                 |     4222 | Message broker     |
| NATS Monitoring      |     8222 | NATS monitoring    |
| Notification Service | Internal | Event processing   |

---

# Environment Variables

## User Service

```env
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/microservices
NATS_URL=nats://nats:4222
NATS_USER=microservice
NATS_PASSWORD=your_nats_password_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
```

## Notification Service

```env
NATS_URL=nats://nats:4222
NATS_USER=microservice
NATS_PASSWORD=your_nats_password_here
```

## API Gateway

```env
PORT=5000
USER_SERVICE_URL=http://user-service:5001
```

> These values are examples only. Never commit actual passwords, JWT secrets, or other credentials to GitHub.

---

# How to Run

## Prerequisites

Install:

* Docker Desktop
* Git

---

## Clone Repository

```bash
git clone https://github.com/AnshikaaJoshi/microservices-system.git
```

Navigate to the project:

```bash
cd microservices-system
```

---

## Environment Configuration

Create a local `.env` file if required by the services.

Use `.env.example` as a reference.

Do not commit the actual `.env` file.

---

## Start Services

Build and start the complete system:

```bash
docker compose up -d --build
```

Check running containers:

```bash
docker compose ps
```

Expected services:

```text
api-gateway
user-service
notification-service
mongodb
nats
```

---

# View Logs

View all logs:

```bash
docker compose logs
```

User Service:

```bash
docker compose logs user-service
```

Notification Service:

```bash
docker compose logs notification-service
```

API Gateway:

```bash
docker compose logs api-gateway
```

NATS:

```bash
docker compose logs nats
```

---

# Stop the Application

Stop and remove containers:

```bash
docker compose down
```

Stop containers without removing them:

```bash
docker compose stop
```

Start existing containers:

```bash
docker compose start
```

---

# Testing

The following functionality has been tested:

* User creation
* Get all users
* User login
* JWT generation
* Password hashing
* Duplicate email validation
* Required field validation
* MongoDB connection
* API Gateway routing
* NATS authentication
* NATS connection
* NATS JetStream connection
* `USERS` stream
* `user.created` event publishing
* Notification Service event consumption
* Message acknowledgement
* Docker Compose configuration
* Dockerized MongoDB
* Dockerized NATS
* Dockerized User Service
* Dockerized Notification Service
* Dockerized API Gateway
* End-to-end event communication

---

# End-to-End Flow

When a client creates a new user:

```text
1. Client sends POST /api/users
             |
             v
2. API Gateway receives request
             |
             v
3. API Gateway forwards request
   to User Service
             |
             v
4. User Service validates data
             |
             v
5. Password is hashed using bcrypt
             |
             v
6. User is stored in MongoDB
             |
             v
7. User Service publishes
   "user.created" event
             |
             v
8. NATS JetStream stores the event
             |
             v
9. Notification Service consumes
   the event
             |
             v
10. Notification Service processes
    and acknowledges the message
```

---

# Project Structure

```text
microservices-system/
│
├── api-gateway/
│   ├── src/
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
│
├── user-service/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── nats.js
│   │   ├── controllers/
│   │   │   └── user.controller.js
│   │   ├── models/
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   └── user.service.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
│
├── notification-service/
│   ├── src/
│   │   ├── config/
│   │   │   └── nats.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
│
├── docs/
│
├── docker-compose.yml
├── nats-server.conf
├── .env.example
├── .gitignore
└── README.md
```

---

# Design Principles

The project follows these principles:

* Separation of concerns
* Loose coupling between services
* Asynchronous event-driven communication
* Secure inter-service communication
* Environment-based configuration
* Persistent data storage
* Reliable event processing
* Containerized deployment
* Maintainable project structure

---

# Future Improvements

Possible future improvements include:

* Role-based authorization
* Email notification provider integration
* Swagger/OpenAPI documentation
* Centralized error handling
* Dead-letter queue
* Advanced retry policies
* Rate limiting
* Centralized logging
* Distributed tracing
* Automated integration tests
* CI/CD pipeline
* Kubernetes deployment
* Service health monitoring

---

# Author

**Anshika Joshi**

GitHub:

https://github.com/AnshikaaJoshi
