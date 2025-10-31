# E-Store Backend Service

A modern, scalable NestJS backend for an e-commerce platform specializing in phones and accessories.

## 🚀 Features

### Core Modules
- **Authentication**: JWT + OAuth 2.0 (Google, Facebook)
- **User Management**: CRUD with RBAC, soft deletes, advanced filtering
- **Products**: Full catalog management with categories, search, and recommendations
- **Categories**: Nested tree structure with closure table
- **Orders**: Multi-item orders with discount calculations
- **Discounts**: Multiple discount types with flexible rules
- **WebSocket**: Real-time order updates and notifications

### Technical Highlights
- 🔒 **Security**: JWT auth, helmet, rate limiting, RBAC
- 📚 **Documentation**: Swagger/OpenAPI auto-generated docs
- 🧪 **Testing**: Jest unit tests with >80% coverage goal
- 🗄️ **Database**: PostgreSQL with TypeORM, migrations support
- ⚡ **Real-time**: WebSocket with JWT authentication
- 🎯 **Type Safety**: Strict TypeScript configuration

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

## 🛠️ Installation

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
```

## 🚀 Running

```bash
# Development
npm run start:dev

# Production
npm run build && npm run start:prod
```

## 📖 API Documentation

Visit http://localhost:3000/api/docs after starting the application.

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage
```

## 📂 Structure

```
src/
├── auth/          # Authentication & authorization
├── users/         # User management
├── products/      # Product catalog
├── categories/    # Product categories
├── orders/        # Order processing
├── discounts/     # Discount management
├── websocket/     # Real-time communication
└── common/        # Shared resources
```

## 📝 License

MIT
