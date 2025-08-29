# SerenityAI Backend API

A comprehensive backend API for the SerenityAI mental health platform, built with Node.js, Express, and MySQL.

## 🚀 Features

- **User Authentication** - JWT-based authentication with bcrypt password hashing
- **Assessment System** - Comprehensive mental health assessments with scoring and recommendations
- **Healing Sessions** - Track sound and light therapy sessions
- **Advanced Chat System** - AI-powered chat with crisis detection, emotional analysis, and session management
- **Mood Tracking** - Daily mood logging and analytics
- **Waitlist Management** - Email collection for early access
- **Security** - Rate limiting, CORS, helmet, input validation
- **Database** - MySQL with Sequelize ORM

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory (or copy `env.example` to `.env`):
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_NAME=serenityai
   DB_USER=root
   DB_PASS=your_password

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000

   # JWT Secret (generate a strong secret for production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Security
   BCRYPT_ROUNDS=12
   SESSION_SECRET=your-session-secret-key
   ```

4. **Set up the database**
   ```sql
   CREATE DATABASE serenityai;
   ```

5. **Seed the database with assessment questions**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Test the backend**
   ```bash
   npm test
   ```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

#### GET `/api/auth/profile`
Get user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Assessment Endpoints

#### GET `/api/assessment/questions`
Get all assessment questions.

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "How often do you feel anxious or worried?",
      "category": "anxiety",
      "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
      "weight": 1
    }
  ]
}
```

#### POST `/api/assessment/submit`
Submit assessment answers (requires authentication).

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "answer": 3
    }
  ]
}
```

### Chat Endpoints

#### POST `/api/chat/send`
Send a chat message and receive AI response.

**Request Body:**
```json
{
  "message": "I'm feeling anxious today",
  "chatType": "ai",
  "sessionId": "optional_session_id",
  "emotionalData": {
    "currentMood": "anxious",
    "stressLevel": 0.7
  },
  "crisisLevel": 0.2
}
```

**Response:**
```json
{
  "success": true,
  "response": "I understand anxiety can feel overwhelming...",
  "sessionId": "session_1234567890",
  "userMessage": { /* message object */ },
  "aiMessage": { /* message object */ }
}
```

#### GET `/api/chat/history`
Get chat history for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session_1234567890",
      "messages": [
        {
          "id": 1,
          "text": "Hello",
          "sender": "user",
          "time": "14:30"
        }
      ],
      "startTime": "2024-01-01T14:30:00Z",
      "lastMessage": "2024-01-01T14:35:00Z"
    }
  ]
}
```

#### GET `/api/chat/session/:sessionId`
Get messages for a specific chat session.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Healing Endpoints

#### POST `/api/healing/start`
Start a healing session.

**Request Body:**
```json
{
  "type": "sound",
  "frequency": "528Hz",
  "duration": 10,
  "moodBefore": 5
}
```

#### POST `/api/healing/end`
End a healing session.

**Request Body:**
```json
{
  "sessionId": "session_id",
  "moodAfter": 7
}
```

### Waitlist Endpoints

#### POST `/api/waitlist`
Join the waitlist.

**Request Body:**
```json
{
  "email": "user@example.com",
  "source": "website"
}
```

### Therapy Endpoints

#### POST `/api/therapy/start`
Start a therapy session.

**Request Body:**
```json
{
  "therapyType": "sound_light",
  "frequencies": ["528Hz", "432Hz"],
  "lightColor": "blue",
  "duration": 15
}
```

## 🔧 Development

### Running Tests
```bash
# Test basic API functionality
npm test

# Test authentication and assessment
npm run test:auth
```

### Database Setup
```bash
# Run database setup
npm run setup

# Seed with assessment questions
npm run seed
```

### Environment Variables
Make sure to set up all required environment variables in your `.env` file. See the installation section for the complete list.

## 🚨 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Prevents abuse with configurable limits
- **CORS Protection** - Configurable cross-origin requests
- **Input Validation** - Express-validator for request validation
- **Helmet** - Security headers for Express
- **SQL Injection Protection** - Sequelize ORM with parameterized queries

## 📊 Database Schema

The backend uses MySQL with the following main tables:

- **Users** - User accounts and authentication
- **AssessmentQuestions** - Mental health assessment questions
- **AssessmentResponses** - User assessment answers and scores
- **ChatMessages** - Chat conversation history
- **HealingSessions** - Sound and light therapy sessions
- **TherapySessions** - Therapy session tracking
- **MoodEntries** - Daily mood tracking
- **WaitlistSignups** - Email collection for early access

## 🔄 API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use a production database
6. Configure proper logging
7. Set up monitoring and health checks

## 📝 License

This project is licensed under the ISC License. 