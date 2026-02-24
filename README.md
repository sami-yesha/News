# News API - Eskalate Backend Assessment

A production-ready RESTful API for authors to manage content and readers to consume it, featuring a robust Analytics Engine for engagement tracking.

## Technology Stack

- **Framework**: Express.js with TypeScript (ESM)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Argon2 for hashing and JWT for role-based access control.
- **Analytics Engine**: BullMQ with Redis for asynchronous ReadLog creation and Daily Analytics aggregation.
- **Validation**: Zod for centralized schema validation.
- **Testing**: Vitest and Supertest.

## Features

- **RBAC**: strictly validated roles (Author, Reader).
- **Secure Auth**: Complex password requirements and salted hashing.
- **Article Lifecycle**: Drafts, Published status, and Soft Deletion.
- **Analytics Engine**: Asynchronous processing of engagement logs to avoid blocking content delivery.
- **Dashboard**: Aggregated performance metrics for authors.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Redis (for BullMQ)

### Running the Project

You have two options for running the project:

#### Option 1: Full Docker Mode (Easiest)
This runs the App, Database, and Redis all inside Docker.
```bash
docker-compose up --build
```

#### Option 2: Hybrid Mode (Best for Development)
Run only the services (Postgres, Redis) in Docker, and run the App locally.
1. **Start Services**:
   ```bash
   docker-compose up -d db redis
   ```
2. **Push Schema**:
   ```bash
   npx prisma db push
   ```
3. **Start App**:
   ```bash
   npm run dev
   ```

## Running Tests

The project includes unit tests for all HTTP endpoints and core authentication logic using **Vitest** and **Supertest** with a fully mocked Prisma client. No database or Redis connection is required to run tests.

```bash
npm test
```

## Troubleshooting Connectivity
If you see `Can't reach database server at localhost:5432`:
1. Ensure the Docker containers are running: `docker ps`.
2. check that `DATABASE_URL` in your `.env` points to `localhost` (not `db`) when running locally.
3. If running purely inside Docker, `DATABASE_URL` should point to `db:5432`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `REDIS_URL` | Redis connection string (e.g., redis://localhost:6379) |
| `PORT` | Server port (default: 3000) |

## Bonus: Refresh Prevention Strategy

**Question**: How would you prevent the same user from refreshing the page and generating 100 ReadLog entries in 10 seconds?

**Proposed Solutions**:

1. **Redis Cache-aside Marker**:
   - For every article view, check if a key `read:{userId}:{articleId}` exists in Redis.
   - If it exists, skip logging. If not, log the read and set the key with a TTL (e.g., 5 minutes).
   - For guests, use `read:{IP}:{articleId}`.

2. **Rate Limiting Middleware**:
   - Use `express-rate-limit` to restrict calls to `GET /articles/:id` from the same user/IP.

3. **Debounced Job Queue**:
   - Before adding a job to BullMQ, check if a similar job is already pending for the same user-article pair in a short time frame.

## Design Choices

- **ESM (ECMAScript Modules)**: Used for modern JavaScript features and better tree-shaking support.
- **Argon2**: Chosen over BCrypt as per modern security recommendations for better resistance against GPU-based attacks.
- **Prisma**: Provides type-safe database queries and easy-to-read schema definitions.
- **BullMQ**: Ensures high-frequency read logs don't affect the responsiveness of the article detail view.
