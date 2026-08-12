# Microservices System

A backend microservices project built using Node.js, Express.js, MongoDB and NATS.

## Architecture

```text
Client
   |
   v
API Gateway :5000
   |
   v
User Service :5001
   |
   +-------> MongoDB
   |
   +-------> NATS
                |
                v
       Notification Service
Services
API Gateway
Entry point for client requests
Runs on port 5000
Forwards requests to User Service
User Service
Runs on port 5001
Creates users
Retrieves users
Validates user data
Checks duplicate emails
Hashes passwords using bcrypt
Stores users in MongoDB
Publishes user.created events to NATS
Notification Service
Connects to NATS
Subscribes to user.created
Receives user creation events
Processes notification events
Technologies Used
Node.js
Express.js
MongoDB
Mongoose
NATS
bcryptjs
JavaScript
REST API
Git & GitHub
API Endpoints
Get All Users
GET /api/users
Create User
POST /api/users

Request body:

{
  "name": "Anshika",
  "email": "anshika@example.com",
  "password": "Test@123456"
}
NATS Event

When a user is created, User Service publishes:

user.created

Example event:

{
  "id": "user-id",
  "name": "Anshika",
  "email": "anshika@example.com"
}

Notification Service subscribes to this event.

Communication Flow
Client
   ↓
API Gateway
   ↓
User Service
   ↓
MongoDB

User Service
   ↓
NATS
   ↓
Notification Service

This event-driven approach keeps the User Service and Notification Service loosely coupled.

Environment Variables
User Service
PORT=5001
MONGODB_URI=your_mongodb_connection_string
NATS_URL=nats://localhost:4222
Notification Service
NATS_URL=nats://localhost:4222

Never commit .env files or secret credentials to GitHub.

How to Run
1. Start MongoDB

Make sure MongoDB is running.

2. Start NATS

Make sure NATS is running on:

localhost:4222
3. Start User Service
cd user-service
npm install
node src/server.js
4. Start Notification Service
cd notification-service
npm install
node src/server.js
5. Start API Gateway
cd api-gateway
npm install
node src/server.js
Testing

The following functionality has been tested:

User creation
Get all users
MongoDB connection
Duplicate email validation
Password hashing
NATS connection
user.created event publishing
Notification Service subscription
End-to-end communication between services
Project Structure
microservices-system/
│
├── api-gateway/
├── user-service/
├── notification-service/
├── docs/
├── .gitignore
└── README.md
Future Improvements
JWT Authentication
Email notifications
Docker Compose
Swagger API documentation
Health-check endpoints
Message retry mechanism
Centralized error handling
Author

Anshika Joshi


```powershell
git add README.md
git commit -m "Add README documentation"
git push
