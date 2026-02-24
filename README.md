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

- **RBAC**: Strictly validated roles (Author, Reader).
- **Secure Auth**: Salted hashing with Argon2 and hardened complex password requirements.
- **Article Lifecycle**: Drafts, Published status, and **Global Soft-Delete Protection** (implemented via Prisma extensions).
- **Analytics Engine**: Asynchronous processing of engagement logs using BullMQ.
- **Author Dashboard**: Optimized performance using database-level `groupBy` aggregation.
- **Anti-Abuse**: Redis-based rate limiting to prevent engagement log spam.

## Project Structure

The project files are located in the `backend/` directory. The server features a **Fail-Fast Environment Validation** layer that ensures all required configurations are present on startup.

```bash
cd backend
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Redis (for BullMQ and Rate Limiting)

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

| Variable | Description | Requirement |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required (Min 32 chars) |
| `REDIS_URL` | Redis connection (e.g., redis://localhost:6379) | Required |
| `PORT` | Server port (default: 3000) | Optional |

## Implemented Strategy: Refresh Prevention

**Question**: How would you prevent the same user from refreshing the page and generating 100 ReadLog entries in 10 seconds?

**Implementation**:
The project implements a **Redis-based Sliding Window Marker** strategy:
1. When a user requests an article, a middleware checks for a unique key in Redis: `rate_limit:engagement:{userId/IP}:{articleId}`.
2. If the key exists, the request proceeds, but a `skipLogging` flag is attached to avoid duplicate analytics logging.
3. If the key doesn't exist, it is set with a 60-second expiration (TTL) and the read is logged via the queue.
4. This ensures engagement data remains accurate and the queue/database are protected from spam.

## Design Highlights

- **Prisma Client Extensions**: Used to enforce global filters for soft-deleted articles across the entire application without manual developer intervention.
- **Database Aggregation**: Author views are aggregated using SQL-native `groupBy` rather than in-memory processing, ensuring scalability as article counts grow.
- **Argon2**: Chosen over BCrypt as per modern security recommendations for better resistance against GPU-based attacks.
- **BullMQ**: Ensures high-frequency read logs don't affect the responsiveness of the content delivery layer.
