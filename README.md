# Microservices System

A backend microservices system built using **Node.js, Express.js, MongoDB, NATS, and Docker**.

The project demonstrates a microservices architecture where services communicate through an **API Gateway** and use **NATS for event-driven communication**.

---

## Architecture

```text
                         Client
                           |
                           v
                    API Gateway :5000
                           |
                           v
                    User Service :5001
                       /        \
                      /          \
                     v            v
                MongoDB          NATS
                                  |
                                  v
                       Notification Service
```

---

## Services

### 1. API Gateway

- Runs on port `5000`
- Acts as the entry point for client requests
- Forwards user-related requests to the User Service
- Uses Axios for service-to-service HTTP communication

### 2. User Service

- Runs on port `5001`
- Creates users
- Retrieves users
- Validates user data
- Checks for duplicate email addresses
- Hashes passwords using `bcryptjs`
- Stores users in MongoDB
- Publishes `user.created` events to NATS

### 3. Notification Service

- Connects to NATS
- Subscribes to user-related events
- Receives `user.created` events
- Processes notification events

### 4. MongoDB

- Stores User Service data
- Runs as a Docker container
- Uses a persistent Docker volume

### 5. NATS

- Acts as the message broker
- Enables asynchronous event-driven communication
- Used for communication between User Service and Notification Service

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- NATS
- bcryptjs
- Axios
- JavaScript
- REST API
- Docker
- Docker Compose
- Git
- GitHub

---

## API Endpoints

### Health Check

```http
GET /
```

API Gateway:

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

### Get All Users

```http
GET /api/users
```

URL:

```text
http://localhost:5000/api/users
```

---

### Create User

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

The password is hashed before being stored in MongoDB.

---

## NATS Event

When a new user is successfully created, the User Service publishes:

```text
user.created
```

Example event payload:

```json
{
  "id": "user-id",
  "name": "Anshika",
  "email": "anshika@example.com"
}
```

The Notification Service subscribes to the `user.created` event.

---

## Communication Flow

### Synchronous Communication

```text
Client
   |
   v
API Gateway
   |
   v
User Service
   |
   v
MongoDB
```

### Event-Driven Communication

```text
User Service
     |
     | user.created
     v
    NATS
     |
     v
Notification Service
```

This architecture keeps the User Service and Notification Service **loosely coupled**.

The User Service does not need to directly call the Notification Service.

---

# Docker

The complete application can be run using Docker Compose.

Docker Compose manages:

- API Gateway
- User Service
- Notification Service
- MongoDB
- NATS

## Docker Services

| Service | Port | Purpose |
|---|---:|---|
| API Gateway | 5000 | Client entry point |
| User Service | 5001 | User management |
| MongoDB | 27017 | Database |
| NATS | 4222 | Message broker |
| NATS Monitoring | 8222 | NATS monitoring |
| Notification Service | Internal | Event processing |

---

## Environment Variables

### User Service

```env
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/microservices
NATS_URL=nats://nats:4222
```

### Notification Service

```env
NATS_URL=nats://nats:4222
```

### API Gateway

```env
PORT=5000
USER_SERVICE_URL=http://user-service:5001
```

> When running the services directly on the host instead of Docker, `localhost` can be used for MongoDB and NATS where appropriate.

**Never commit `.env` files or secret credentials to GitHub.**

---

# How to Run

## Prerequisites

Make sure the following are installed:

- Docker Desktop
- Git

---

## Run with Docker Compose

Clone the repository:

```bash
git clone https://github.com/AnshikaaJoshi/microservices-system
```

Navigate to the project directory:

```bash
cd microservices-system
```

Start all services:

```bash
docker compose up -d
```

Check the running containers:

```bash
docker compose ps
```

All five services should be running:

```text
api-gateway
user-service
notification-service
mongodb
nats
```

---

## View Logs

View logs for all services:

```bash
docker compose logs
```

View User Service logs:

```bash
docker compose logs user-service
```

View Notification Service logs:

```bash
docker compose logs notification-service
```

View API Gateway logs:

```bash
docker compose logs api-gateway
```

---

## Stop the Application

To stop all containers:

```bash
docker compose down
```

To stop containers without removing them:

```bash
docker compose stop
```

To start the existing containers again:

```bash
docker compose start
```

---

# Testing

The following functionality has been tested successfully:

- User creation
- Get all users
- API Gateway routing
- MongoDB connection
- Duplicate email validation
- Required field validation
- Password hashing
- NATS connection
- `user.created` event publishing
- Notification Service connection
- Notification Service event subscription
- Docker Compose configuration
- MongoDB Docker container
- NATS Docker container
- User Service Docker container
- Notification Service Docker container
- API Gateway Docker container
- End-to-end communication between services

---

# Example End-to-End Flow

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
4. User Service validates user data
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
8. NATS receives the event
             |
             v
9. Notification Service receives
   the event
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
├── .gitignore
└── README.md
```

---

# Security Considerations

- Passwords are hashed using `bcryptjs`
- Passwords are not returned in API responses
- Duplicate email addresses are rejected
- `.env` files are excluded from Git
- Secret credentials should not be committed to GitHub

---

# Future Improvements

The following features can be added in future versions:

- JWT authentication
- Role-based authorization
- Email notifications
- Swagger/OpenAPI documentation
- Health-check endpoints
- Centralized error handling
- Message retry mechanism
- Dead-letter queue
- API Gateway service discovery
- Rate limiting
- Logging and monitoring
- Automated tests
- CI/CD pipeline
- Kubernetes deployment

---

# Author

**Anshika Joshi**
