# Backend Documentation - KDS (Kitchen Display System)

## Overview

This document describes the backend architecture and implementation for the KDS (Kitchen Display System) application. The backend is built with NestJS and provides a REST API with WebSocket support for real-time order management in a delivery operation context.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.x | Backend framework |
| TypeORM | 0.3.28 | Object-Relational Mapping |
| SQLite (better-sqlite3) | 12.6.2 | Database engine |
| Socket.IO | - | Real-time communication |
| class-validator | - | DTO validation |
| class-transformer | - | Type transformation |
| TypeScript | ES2023 | Programming language |

---

## Architecture

### Project Structure

```
backend/
├── src/
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Application entry point
│   ├── common/
│   │   └── enums/
│   │       ├── index.ts
│   │       ├── order-state.enum.ts
│   │       └── rider-status.enum.ts
│   ├── database/
│   │   └── database.config.ts     # TypeORM configuration
│   └── modules/
│       ├── orders/
│       │   ├── dto/
│       │   │   ├── index.ts
│       │   │   ├── create-order.dto.ts
│       │   │   ├── create-item.dto.ts
│       │   │   └── update-order-state.dto.ts
│       │   ├── entities/
│       │   │   ├── index.ts
│       │   │   ├── order.entity.ts
│       │   │   └── item.entity.ts
│       │   ├── orders.module.ts
│       │   ├── orders.controller.ts
│       │   ├── orders.service.ts
│       │   └── orders.gateway.ts
│       └── riders/
│           ├── dto/
│           │   ├── index.ts
│           │   └── create-rider.dto.ts
│           ├── entities/
│           │   ├── index.ts
│           │   └── rider.entity.ts
│           ├── riders.module.ts
│           ├── riders.controller.ts
│           └── riders.service.ts
├── kds.db                         # SQLite database file
├── KDS-API.postman_collection.json # API testing collection
└── package.json
```

### Module Architecture

The application follows NestJS modular architecture with two main feature modules:

1. **OrdersModule**: Handles order lifecycle management
2. **RidersModule**: Manages delivery riders

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     orders      │       │     riders      │
├─────────────────┤       ├─────────────────┤
│ id (PK, UUID)   │       │ id (PK, UUID)   │
│ state           │       │ name            │
│ riderId         │       │ status          │
│ createdAt       │       │ currentOrderId  │
│ updatedAt       │       │ createdAt       │
└────────┬────────┘       └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│      items      │
├─────────────────┤
│ id (PK, UUID)   │
│ name            │
│ image           │
│ priceAmount     │
│ priceCurrency   │
│ quantity        │
│ orderId (FK)    │
└─────────────────┘
```

### Tables Description

#### orders
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, AUTO-GENERATED | Unique identifier |
| state | ENUM | NOT NULL | Order status (PENDING, IN_PROGRESS, READY, DELIVERED) |
| riderId | VARCHAR | NULLABLE | Assigned rider ID for delivery |
| createdAt | DATETIME | AUTO-GENERATED | Creation timestamp |
| updatedAt | DATETIME | AUTO-UPDATED | Last modification timestamp |

#### items
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, AUTO-GENERATED | Unique identifier |
| name | VARCHAR | NOT NULL | Product name |
| image | VARCHAR | NULLABLE | Product image URL |
| priceAmount | DECIMAL(10,2) | NOT NULL | Product price |
| priceCurrency | VARCHAR | DEFAULT 'EUR' | Currency code |
| quantity | INTEGER | DEFAULT 1 | Quantity ordered |
| orderId | UUID | FOREIGN KEY | Reference to parent order |

#### riders
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, AUTO-GENERATED | Unique identifier |
| name | VARCHAR | NOT NULL | Rider name |
| status | ENUM | NOT NULL | Rider status (AVAILABLE, WAITING, DELIVERING) |
| currentOrderId | VARCHAR | NULLABLE | Currently assigned order ID |
| createdAt | DATETIME | AUTO-GENERATED | Registration timestamp |

---

## Enumerations

### OrderState
Represents the lifecycle stages of an order:

| Value | Description |
|-------|-------------|
| PENDING | Order received, awaiting preparation |
| IN_PROGRESS | Order is being prepared |
| READY | Order is ready for pickup |
| DELIVERED | Order has been delivered to rider |

### RiderStatus
Represents the availability state of a rider:

| Value | Description |
|-------|-------------|
| AVAILABLE | Rider is available for new assignments |
| WAITING | Rider is registered and waiting for orders |
| DELIVERING | Rider is currently delivering an order |

---

## API Reference

### Base URL
```
http://localhost:3001
```

### Orders Endpoints

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "items": [
    {
      "name": "Product Name",
      "image": "https://example.com/image.jpg",
      "priceAmount": 9.99,
      "priceCurrency": "EUR",
      "quantity": 2
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "state": "PENDING",
  "items": [...],
  "createdAt": "2025-01-30T00:00:00.000Z",
  "updatedAt": "2025-01-30T00:00:00.000Z"
}
```

#### List Orders
```http
GET /orders
```

Returns all orders except those with state `DELIVERED`, ordered by creation date (ascending).

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "state": "PENDING",
    "items": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Get Order by ID
```http
GET /orders/:id
```

**Response:** `200 OK` | `404 Not Found`

#### Update Order State
```http
PATCH /orders/:id/state
Content-Type: application/json

{
  "state": "IN_PROGRESS"
}
```

**Response:** `200 OK`

#### Pickup Order
```http
POST /orders/:id/pickup
Content-Type: application/json

{
  "riderId": "rider-uuid"
}
```

Marks the order as `DELIVERED` and assigns the rider ID.

**Response:** `200 OK`

---

### Riders Endpoints

#### Create Rider
```http
POST /riders
Content-Type: application/json

{
  "name": "Rider Name"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Rider Name",
  "status": "WAITING",
  "currentOrderId": null,
  "createdAt": "..."
}
```

#### List Riders
```http
GET /riders
```

Returns all riders with status `WAITING`, ordered by creation date.

**Response:** `200 OK`

#### Get Rider by ID
```http
GET /riders/:id
```

**Response:** `200 OK` | `404 Not Found`

#### Assign Order to Rider
```http
POST /riders/:id/assign
Content-Type: application/json

{
  "orderId": "order-uuid"
}
```

Updates rider status to `DELIVERING` and sets `currentOrderId`.

**Response:** `200 OK`

---

## WebSocket Events

The application uses Socket.IO for real-time communication.

### Connection
```javascript
const socket = io('http://localhost:3001');
```

### Events Emitted by Server

| Event | Payload | Description |
|-------|---------|-------------|
| `order:new` | Order object | Emitted when a new order is created |
| `order:updated` | Order object | Emitted when an order state changes |
| `order:picked` | Order object | Emitted when a rider picks up an order |

### Example Client Implementation
```javascript
socket.on('order:new', (order) => {
  console.log('New order received:', order);
});

socket.on('order:updated', (order) => {
  console.log('Order updated:', order);
});

socket.on('order:picked', (order) => {
  console.log('Order picked up:', order);
});
```

---

## Business Logic

### Order Lifecycle Flow

```
┌─────────┐     ┌─────────────┐     ┌───────┐     ┌───────────┐
│ PENDING │ --> │ IN_PROGRESS │ --> │ READY │ --> │ DELIVERED │
└─────────┘     └─────────────┘     └───────┘     └───────────┘
    │                 │                  │              │
    │                 │                  │              │
    ▼                 ▼                  ▼              ▼
 Order           Staff begins       Order is        Rider
 received        preparation        ready           picks up
```

### Key Business Rules

1. **Order Creation**: All orders start with state `PENDING`
2. **State Transitions**: Orders can only move forward in the lifecycle
3. **Pickup Process**: When an order is picked up, it transitions to `DELIVERED` and is assigned a `riderId`
4. **Order Visibility**: The `GET /orders` endpoint excludes `DELIVERED` orders to keep the display clean
5. **Rider Assignment**: Riders change from `WAITING` to `DELIVERING` when assigned an order

---

## Configuration

### Server Configuration (main.ts)

| Setting | Value | Description |
|---------|-------|-------------|
| Port | 3001 | HTTP server port |
| CORS Origins | localhost:3000, 127.0.0.1:3000 | Allowed frontend origins |
| Validation | Global ValidationPipe | Automatic DTO validation |

### Database Configuration (database.config.ts)

| Setting | Value |
|---------|-------|
| Type | better-sqlite3 |
| Database File | kds.db |
| Synchronize | true (auto-migrate) |
| Entities | Order, Item, Rider |

---

## Running the Backend

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation
```bash
cd backend
pnpm install
```

### Development
```bash
pnpm start:dev
```

### Production
```bash
pnpm build
pnpm start:prod
```

---

## API Testing

A Postman collection is included in the project: `KDS-API.postman_collection.json`

Import this collection into Postman to test all endpoints with pre-configured requests and example payloads.

---

## Technical Decisions

### SQLite Selection
SQLite was chosen for simplicity and rapid development. It requires no external database server and provides file-based persistence suitable for development and demonstration purposes. For production, migration to PostgreSQL is recommended.

### TypeORM Usage
TypeORM was selected for its excellent integration with NestJS and TypeScript, providing type-safe database operations and automatic schema synchronization during development.

### WebSocket Implementation
Socket.IO was implemented to enable real-time updates in the frontend without polling. This ensures immediate reflection of order state changes across all connected clients.

### Modular Architecture
The codebase is organized into feature modules (Orders, Riders) following NestJS best practices, ensuring maintainability and scalability as the application grows.

---

## Future Improvements

1. **Authentication**: Implement JWT-based authentication for staff access
2. **Database Migration**: Move to PostgreSQL for production deployment
3. **Order History**: Add endpoint for viewing delivered orders history
4. **Metrics Dashboard**: Implement analytics for order processing times
5. **Notification System**: Add push notifications for new orders
6. **Rate Limiting**: Implement API rate limiting for security
7. **Unit Tests**: Add comprehensive test coverage
8. **Docker Support**: Containerize the application for deployment
