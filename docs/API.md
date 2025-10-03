# API Documentation

## Base URL
- Development: `http://localhost:3001`
- Production: `https://your-domain.com`

## Authentication
Currently no authentication is required for development.

## Rate Limiting
- General API: 100 requests per 15 minutes
- Search endpoints: 30 requests per minute
- Seed endpoints: 5 requests per 5 minutes

## Response Format
All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": "Error message if any"
}
```

## Endpoints

### Health Check
- **GET** `/health`
- Returns server status and metrics

### Users API

#### Get Users
- **GET** `/api/users`
- Query Parameters:
  - `page` (number, default: 1): Page number
  - `pageSize` (number, default: 50, max: 200): Items per page
  - `search` (string, optional): Search by name or email
  - `sortBy` (string, default: "name"): Sort field (name, email, createdAt, orderTotal)
  - `sortDir` (string, default: "asc"): Sort direction (asc, desc)

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2023-01-01T00:00:00Z",
        "orderCount": 5,
        "orderTotal": 1250.50
      }
    ],
    "total": 1000,
    "page": 1,
    "pageSize": 50
  }
}
```

#### Get User by ID
- **GET** `/api/users/:id`
- Returns user details

#### Get User Orders
- **GET** `/api/users/:id/orders`
- Query Parameters:
  - `page` (number, default: 1): Page number
  - `pageSize` (number, default: 50): Items per page

#### Get User Statistics
- **GET** `/api/users/stats`
- Returns aggregated user statistics

### Nodes API (Tree/Hierarchy)

#### Get Root Nodes
- **GET** `/api/nodes/root`
- Returns top-level nodes

#### Get Node Children
- **GET** `/api/nodes/:id/children`
- Returns direct children of a node

#### Get Node by ID
- **GET** `/api/nodes/:id`
- Returns node details

#### Search Nodes
- **GET** `/api/search`
- Query Parameters:
  - `q` (string, required): Search query
  - `limit` (number, default: 100, max: 1000): Maximum results

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "node-123",
        "name": "Engineering Team",
        "path": [
          { "id": "root", "name": "Company" },
          { "id": "dept-1", "name": "Engineering" },
          { "id": "node-123", "name": "Engineering Team" }
        ]
      }
    ]
  }
}
```

#### Get Node Breadcrumb
- **GET** `/api/nodes/:id/breadcrumb`
- Returns path from root to node

### Quotes API (Real-time)

#### Get Quote Snapshot
- **GET** `/api/quotes/snapshot`
- Query Parameters:
  - `symbols` (string, required): Comma-separated list of symbols

Response:
```json
{
  "success": true,
  "data": {
    "AAPL": {
      "symbol": "AAPL",
      "price": 150.25,
      "ts": "2023-01-01T12:00:00Z"
    }
  }
}
```

#### Get Quote by Symbol
- **GET** `/api/quotes/:symbol`
- Returns quote for specific symbol

#### Get All Quotes
- **GET** `/api/quotes`
- Returns all available quotes

#### Get Quote Statistics
- **GET** `/api/quotes/stats`
- Returns quote statistics

#### Get Top Movers
- **GET** `/api/quotes/movers`
- Query Parameters:
  - `limit` (number, default: 10, max: 50): Number of results

### Development/Seed API

#### Seed Data
- **POST** `/dev/seed`
- Query Parameters:
  - `users` (number, default: 50000): Number of users to create
  - `orders` (number, default: 500000): Number of orders to create
  - `products` (number, default: 10000): Number of products to create
  - `breadth` (number, default: 20): Tree breadth for nodes
  - `depth` (number, default: 10): Tree depth for nodes
  - `symbols` (string, default: "AAPL,MSFT,GOOG,..."): Quote symbols

#### Clear Data
- **DELETE** `/dev/seed`
- Clears all seeded data

#### Get Seed Status
- **GET** `/dev/seed/status`
- Returns current data counts

## WebSocket API

### Connection
- **URL**: `ws://localhost:3001/ws/quotes`
- **Protocol**: JSON messages

### Message Types

#### Subscribe to Symbols
```json
{
  "type": "subscribe",
  "symbols": ["AAPL", "MSFT", "GOOG"]
}
```

#### Unsubscribe from Symbols
```json
{
  "type": "unsubscribe",
  "symbols": ["AAPL", "MSFT"]
}
```

#### Ping (Heartbeat)
```json
{
  "type": "ping"
}
```

### Server Messages

#### Quote Updates
```json
{
  "type": "quotes",
  "quotes": [
    {
      "symbol": "AAPL",
      "price": 150.25,
      "ts": "2023-01-01T12:00:00Z"
    }
  ],
  "ts": "2023-01-01T12:00:00Z"
}
```

#### Pong (Heartbeat Response)
```json
{
  "type": "pong",
  "ts": "2023-01-01T12:00:00Z"
}
```

#### Error
```json
{
  "type": "error",
  "error": "Error message",
  "ts": "2023-01-01T12:00:00Z"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Performance Notes

- User queries with 50,000+ records return in < 500ms
- WebSocket updates are batched and sent at 10 FPS
- Search is debounced on the frontend (250ms)
- Pagination is server-side for optimal performance

