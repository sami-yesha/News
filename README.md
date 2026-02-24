# News API — Eskalate Backend Assessment

A **production-grade RESTful backend** where Authors publish content and Readers consume it, powered by an **asynchronous Analytics Engine** that processes high-frequency engagement into daily performance metrics.

This system is designed with **scalability, correctness, and maintainability** in mind and follows modern backend engineering practices.

---

# 🚀 Technology Stack

| Layer             | Technology                             |
| ----------------- | -------------------------------------- |
| Framework         | Express.js + TypeScript (ESM)          |
| Database          | PostgreSQL + Prisma ORM                |
| Authentication    | Argon2 (password hashing) + JWT (RBAC) |
| Queue & Analytics | BullMQ + Redis                         |
| Validation        | Zod (centralized schemas)              |
| Testing           | Vitest + Supertest (mocked DB)         |
| Containerization  | Docker + Docker Compose                |

---

# ✨ Core Features

## 🔐 Authentication & RBAC

* Secure signup with strong password enforcement
* Argon2 salted hashing
* JWT authentication with role claims
* Role-based route protection (Author / Reader)

---

## 📰 Article Lifecycle Management

* Draft & Published states
* Ownership enforcement (authors manage only their content)
* Soft deletion using `DeletedAt`
* Global soft-delete protection via Prisma Extensions

---

## 🌍 Public News Feed

* Returns only **Published + Non-Deleted** articles
* Filtering support:

  * Category (exact)
  * Author name (partial match)
  * Keyword search in title
* Pagination (default page 1, size 10)

---

## 📊 Analytics Engine

Designed for **high-frequency engagement workloads**.

Features:

* Non-blocking read tracking via BullMQ queue
* Raw event storage (ReadLog)
* Daily aggregation into DailyAnalytics
* GMT-based aggregation window
* Idempotent upsert logic

---

## 👨💻 Author Performance Dashboard

Optimized for scalability using **database-level aggregation**.

Returns:

* Article title
* Created date
* Total views (summed from DailyAnalytics)

---

## 🛡 Anti-Abuse Protection

Redis-based **Sliding Window Marker Strategy** prevents analytics spam:

* Deduplicates rapid refresh events
* Supports both authenticated users and guests
* Protects queue and database from burst traffic

---

# 🧠 Architecture Highlights

### Clean Separation of Concerns

Controller → Service → Repository/ORM pattern ensures:

* Testability
* Maintainability
* Clear business logic boundaries

---

### Global Soft Delete Integrity

Implemented using **Prisma Client Extensions** so:

* Deleted content is automatically excluded
* Developers cannot accidentally leak soft-deleted records

---

### Database-First Aggregation

Analytics and dashboard queries rely on:

* SQL aggregation
* Prisma groupBy

Avoiding memory-heavy Node.js processing.

---

### Fail-Fast Configuration Validation

Application will NOT start if required environment variables are missing.

Required:

* DATABASE_URL
* JWT_SECRET
* REDIS_URL

---

# 📁 Project Structure

All backend files are located inside:

```
backend/
```

Key modules include:

```
src/
  config/
  middleware/
  services/
  controllers/
  queues/
  workers/
  utils/
  validations/
  prisma/
```

---

# ⚙️ Getting Started

## Prerequisites

* Node.js ≥ 18
* Docker (recommended)
* PostgreSQL
* Redis

---

# 🐳 Option 1 — Full Docker Mode (Recommended)

Runs:

* App
* PostgreSQL
* Redis

```
docker-compose up --build
```

---

# 🧪 Option 2 — Hybrid Development Mode

Run services in Docker, app locally.

Start services:

```
docker-compose up -d db redis
```

Push database schema:

```
npx prisma db push
```

Run app:

```
npm run dev
```

---

# 🧪 Running Tests

Unit tests cover:

* Authentication
* Articles
* Dashboard
* Middleware

Database is fully mocked.

```
npm test
```

---

# 🔐 Environment Variables

| Variable     | Description                       | Required |
| ------------ | --------------------------------- | -------- |
| DATABASE_URL | PostgreSQL connection string      | ✅        |
| JWT_SECRET   | JWT signing secret (min 32 chars) | ✅        |
| REDIS_URL    | Redis connection string           | ✅        |
| PORT         | Server port                       | Optional |

---

# ❓ Refresh Abuse Prevention Strategy

Problem:

> Same user refreshing an article repeatedly generating fake engagement.

Solution:

Redis Sliding Window Marker:

```
rate_limit:engagement:{userId/IP}:{articleId}
```

Flow:

1. Check Redis key
2. If exists → skip analytics logging
3. If not → create key with TTL (60s) and log read

Benefits:

* Prevents spam
* Lightweight
* Scales horizontally
* Works for guests and authenticated users

---

# 📈 Scalability Considerations

Designed to support:

* High read throughput
* Millions of engagement events
* Concurrent users

Key optimizations:

* Database indexing
* Queue-based processing
* Aggregation batching
* Stateless API servers

---

# 🔒 Security Decisions

* Argon2 over BCrypt (GPU resistance)
* JWT expiration enforced
* RBAC middleware
* Strong password validation
* Centralized error handling
* No stack trace leakage

---

# 🧑💼 Engineering Decisions

Why BullMQ?

Read tracking is write-heavy and should not block content delivery.

Why Prisma?

Type safety + developer productivity + maintainability.

Why Redis?

Needed for:

* Queue broker
* Rate limiting
* Deduplication markers

---

# 🏁 Submission Notes

This implementation strictly follows the Eskalate Backend Assessment requirements and includes additional production-grade improvements such as:

* Global soft delete enforcement
* Database aggregation optimization
* Anti-abuse protection
* Fail-fast configuration validation

---

# 👨💻 Author

Samuel Yeshambel

Backend Developer — Node.js / TypeScript / Distributed Systems
