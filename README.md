# LogMonitor - Real-time Log Monitoring Application

A comprehensive log monitoring application built with React, Redux Toolkit, Node.js, Express, and Elasticsearch integration.

## Features

### Frontend
- **React with Vite** for fast development
- **Redux Toolkit** for state management
- **JWT Authentication** with role-based access control
- **Real-time Dashboard** with analytics and charts
- **Log Search & Filtering** with advanced filtering options
- **Responsive Design** with Tailwind CSS
- **Role-based UI** (Admin, User, Viewer roles)

### Backend
- **Node.js with Express** REST API
- **JWT Authentication** with bcrypt password hashing
- **Role-based Authorization** middleware
- **Elasticsearch Integration** (ready for production)
- **Log Ingestion API** for receiving logs from various sources
- **Analytics Endpoints** for dashboard metrics

## User Roles

- **Admin**: Full access to all features, user management
- **User**: Can view logs, analytics, and settings
- **Viewer**: Read-only access to logs and dashboard

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

### Default Credentials

- **Admin**: `admin@logmonitor.com` / `admin123`
- **User**: `user@logmonitor.com` / `user123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Logs
- `GET /api/logs` - Fetch all logs
- `GET /api/logs/search` - Search logs with filters
- `POST /api/logs` - Ingest new log entry

### Analytics
- `GET /api/analytics` - Get dashboard analytics

### Users (Admin only)
- `GET /api/users` - Get all users

## Production Deployment

### Elasticsearch Setup
1. Install and configure Elasticsearch
2. Update `ELASTICSEARCH_URL` in server/.env
3. Replace in-memory storage with Elasticsearch queries

### Environment Variables
```bash
JWT_SECRET=your-super-secret-jwt-key
ELASTICSEARCH_URL=http://localhost:9200
NODE_ENV=production
```

## Technology Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, JWT, bcrypt
- **Database**: Elasticsearch (production), In-memory (development)
- **Build Tool**: Vite
- **Type Safety**: TypeScript

## Architecture

The application follows a clean architecture with:
- Modular Redux slices for state management
- Role-based access control throughout
- Responsive component design
- RESTful API design
- JWT-based authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request