# Full-Stack Practical Coding Challenges

เวอร์ชัน: 2025-08-22 08:11

โปรเจกต์นี้ประกอบด้วย 3 งานหลัก:
1. **Data Processing & Rendering** - ตารางข้อมูลประสิทธิภาพสูง (50,000+ records)
2. **Tree & Hierarchy Rendering** - Org Chart/File Explorer แบบ lazy loading
3. **Realtime Dashboard** - Dashboard แสดงข้อมูลหุ้นแบบ real-time

## 🚀 ข้อกำหนดระบบ

- Node.js >= 18.0.0
- npm หรือ yarn

## 📦 การติดตั้ง

```bash
# ติดตั้ง dependencies ทั้งหมด
npm install

# หรือติดตั้งแยกส่วน
cd backend && npm install
cd ../frontend && npm install
```

## 🏃‍♂️ การรัน

```bash
# รันทั้ง backend และ frontend พร้อมกัน
npm run dev

# รันแยกส่วน
npm run dev:backend  # Backend ที่ port 3001
npm run dev:frontend # Frontend ที่ port 3000
```

## 🌱 การสร้างข้อมูลทดสอบ

```bash
# สร้างข้อมูลทดสอบ (50,000 users, 500,000 orders, 10,000 products)
npm run seed

# หรือสร้างข้อมูลขนาดเล็กสำหรับทดสอบ
cd backend && npm run seed -- --users=1000 --orders=5000 --products=100
```

## 🧪 การทดสอบ

```bash
# รัน tests ทั้งหมด
npm test

# รัน tests แยกส่วน
npm run test:backend
npm run test:frontend

# รัน tests พร้อม coverage
npm run test:coverage
```

## 🏗️ การ Build

```bash
# Build ทั้งหมด
npm run build

# Build แยกส่วน
npm run build:backend
npm run build:frontend
```

## 🔍 การ Lint

```bash
# Lint ทั้งหมด
npm run lint

# Lint แยกส่วน
npm run lint:backend
npm run lint:frontend

# Fix linting errors
npm run lint:fix
```

## 📁 โครงสร้างโปรเจกต์

```
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Seed scripts
│   │   └── __tests__/       # Backend tests
│   └── package.json
├── frontend/                # React/TypeScript SPA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── test/            # Frontend tests
│   └── package.json
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── CHALLENGES.md       # Challenge details
│   ├── postman-collection.json
│   └── openapi.yaml
├── .github/workflows/       # CI/CD
└── package.json            # Root package.json
```

## 📚 API Documentation

- **Backend API**: http://localhost:3001/api
- **Frontend**: http://localhost:3000
- **Health Check**: http://localhost:3001/health
- **WebSocket**: ws://localhost:3001/ws/quotes
- **API Collection**: `docs/postman-collection.json`
- **OpenAPI Spec**: `docs/openapi.yaml`

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_TITLE=Full-Stack Coding Challenges
```

## 🎯 ฟีเจอร์หลัก

### Challenge 1: Data Processing & Rendering
- ✅ Server-side pagination (50,000+ records)
- ✅ Real-time search (debounced 250ms)
- ✅ Multi-column sorting
- ✅ Aggregate calculations
- ✅ Responsive UI with loading states

### Challenge 2: Tree & Hierarchy Rendering
- ✅ Lazy loading nodes
- ✅ Search with auto-expansion
- ✅ Path breadcrumbs
- ✅ Keyboard navigation
- 🔄 Coming soon...

### Challenge 3: Real-time Dashboard
- ✅ WebSocket real-time updates
- ✅ Live price charts
- ✅ Price change indicators
- ✅ Reconnection strategy
- ✅ Performance optimization

## ⚡ Performance Metrics

- **50,000 users**: < 500ms initial load
- **Pagination**: < 300ms page changes
- **Search**: < 250ms debounced response
- **WebSocket**: 10-50 updates/second
- **Memory**: < 50MB for 10,000 rendered nodes

## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- WebSocket (native)
- Jest testing
- In-memory data store

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- Vitest testing

## 📖 เอกสารเพิ่มเติม

- [API Documentation](docs/API.md)
- [Challenge Details](docs/CHALLENGES.md)
- [Postman Collection](docs/postman-collection.json)
- [OpenAPI Specification](docs/openapi.yaml)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
