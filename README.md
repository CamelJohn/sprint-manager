# sprint-manager

# Sprint & Task Management System — Technical Specification

## 1. Overview

**Name:** Sprintly (placeholder)

**Purpose:** A production-grade project & sprint management backend + admin frontend that models Projects → Sprints → Stories → Tasks → Subtasks and supports planning workflows, role-based access, Kanban boards, real-time updates, and analytics. Designed to run on Docker Compose and built in Node.js + TypeScript.

**Target audience:** engineering teams, PMs, and individual contributors who want a self-hosted, extensible project management system.

---

## 2. Goals & Non-functional Requirements

**Functional goals**

- CRUD for Projects, Sprints, Stories, Tasks, Subtasks
- Move items between phases (Pre-planning → Planning → In Progress → Done)
- Kanban-style board API + ordering
- Role-based access: Admin, Manager, Member, Guest
- Real-time updates via WebSockets (Socket.io)
- Search & filters
- Activity/audit log
- Attachments (optional file uploads)
- CSV import/export for backlog and sprints
- REST + GraphQL optional (REST core + GraphQL gateway)

**Non-functional**

- Scalable via horizontal scaling (stateless app, external Redis for sessions)
- Secure by default (JWT, CSRF protection for web, input validation)
- Well-tested (unit + integration) and documented (OpenAPI/Swagger)
- Observability: structured logs, metrics, health checks
- Runs on Docker Compose for local dev and can be deployed to k8s

---

## 3. Tech Stack

**Backend**

- Node.js 20+ with TypeScript
- Framework: NestJS (recommended)
- ORM: Prisma (Postgres)
- Websockets: Socket.io (or Redis-adapter for multi-instance)
- Background jobs: BullMQ (Redis)
- Auth: JWT + refresh tokens, OAuth2 connectors (optional)

**Database & cache**

- PostgreSQL (primary data store)
- Redis (cache, rate-limiting, BullMQ)

**Frontend (optional)**

- Next.js / React + TypeScript + vite
- State: React Query or SWR
- UI: Tailwind CSS + Headless UI
- Rich drag-and-drop: `react-beautiful-dnd` or `@dnd-kit`

**Dev & infra**

- Docker + Docker Compose
- GitHub Actions for CI
- ESLint, Prettier, Husky pre-commit hooks
- Jest / Supertest for tests

---

## 4. High-level Architecture

```
+-----------+       +-----------+       +--------+
|  Frontend | <----> |  Backend  | <----> | Postgres|
|  Next.js  | REST / | NestJS    | ORM    |         |
+-----------+ WS     +-----------+       +--------+
      |                     |                  ^
      v                     v                  |
   Browser              Redis (cache, bull) ---+
                             |
                             v
                         BullMQ workers
```

- Backend is stateless; uses Redis for sessions, rate-limits, queues, and Socket.io adapter in multi-instance.
- Worker processes handle heavy tasks (notifications, recurring tasks, CSV import).

---

## 5. Data Model (Prisma schema excerpt / Postgres tables)

### Core tables (entities)

- `users`
- `organizations` (for multi-tenant, optional)
- `projects`
- `sprints`
- `stories` (epic-like)
- `tasks`
- `subtasks`
- `comments`
- `attachments`
- `activity_logs`
- `roles` & `memberships`
- `orders` or `positions` table for list ordering (or implement `position` float on each item)

### Example Prisma schema (shortened)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  memberships Membership[]
  comments  Comment[]
}

model Organization {
  id      String  @id @default(cuid())
  name    String
  members Membership[]
}

model Membership {
  id             String   @id @default(cuid())
  user           User     @relation(fields: [userId], references: [id])
  userId         String
  organization   Organization @relation(fields: [orgId], references: [id])
  orgId          String
  role           Role
}

enum Role { ADMIN MANAGER MEMBER GUEST }

model Project {
  id        String   @id @default(cuid())
  org       Organization @relation(fields: [orgId], references: [id])
  orgId     String
  name      String
  description String?
  sprints   Sprint[]
  createdAt DateTime @default(now())
}

model Sprint {
  id         String @id @default(cuid())
  project    Project @relation(fields: [projectId], references: [id])
  projectId  String
  name       String
  startDate  DateTime?
  endDate    DateTime?
  status     String  // PLANNING, ACTIVE, CLOSED
  stories    Story[]
}

model Story {
  id         String @id @default(cuid())
  sprint     Sprint? @relation(fields: [sprintId], references: [id])
  sprintId   String?
  project    Project @relation(fields: [projectId], references: [id])
  projectId  String
  title      String
  description String?
  priority   Int
  tasks      Task[]
  order      Float   @default(0)
}

model Task {
  id         String @id @default(cuid())
  story      Story?  @relation(fields: [storyId], references: [id])
  storyId    String?
  title      String
  description String?
  assignee   User?   @relation(fields: [assigneeId], references: [id])
  assigneeId String?
  status     String  // TODO: enum - TODO: TODO
  estimate   Int?    // story points or hours
  position   Float   @default(0)
  subtasks   Subtask[]
  comments   Comment[]
  createdAt  DateTime @default(now())
}

model Subtask {
  id        String @id @default(cuid())
  task      Task   @relation(fields: [taskId], references: [id])
  taskId    String
  title     String
  done      Boolean @default(false)
}

model Comment {
  id        String @id @default(cuid())
  author    User   @relation(fields: [authorId], references: [id])
  authorId  String
  body      String
  parentTask Task? @relation(fields: [taskId], references: [id])
  taskId    String?
  createdAt DateTime @default(now())
}
```

**Ordering:** use `position` (float) so inserts between items are easy. Rebalance occasionally.

---

## 6. API Design (REST endpoints)

> Base path: `/api/v1`

### Auth

- `POST /auth/register` — body: `{ email, password, name, orgName? }` → 201 { user, accessToken, refreshToken }
- `POST /auth/login` — `{ email, password }` → `{ accessToken, refreshToken }`
- `POST /auth/refresh` — `{ refreshToken }` → new tokens
- `POST /auth/logout` — invalidate refresh token

### Users

- `GET /users/me` — current user profile
- `GET /users/:id` — user profile (RBAC)

### Organizations

- `GET /orgs` — list (admin)
- `POST /orgs` — create
- `GET /orgs/:id/members` — list members
- `POST /orgs/:id/members` — invite user
- `PATCH /orgs/:id/members/:memberId` — change role

### Projects

- `GET /projects` — list (supports filters: orgId, memberId)
- `POST /projects` — create project
- `GET /projects/:id` — project details (includes sprints list)
- `PATCH /projects/:id`
- `DELETE /projects/:id`

### Sprints

- `GET /projects/:projectId/sprints`
- `POST /projects/:projectId/sprints`
- `GET /sprints/:id`
- `PATCH /sprints/:id`
- `POST /sprints/:id/close` — run close logic (move incomplete stories)

### Stories

- `GET /projects/:projectId/stories` — backlog + query params: `sprintId`, `search`, `status`, `assignee`
- `POST /projects/:projectId/stories`
- `PATCH /stories/:id` — move to another sprint by setting sprintId
- `DELETE /stories/:id`
- `POST /stories/:id/reorder` — body `{ beforeId?, afterId? }` or new position float

### Tasks

- `GET /stories/:storyId/tasks`
- `POST /stories/:storyId/tasks`
- `PATCH /tasks/:id` — update status, assignee, position
- `POST /tasks/:id/move` — change story or sprint
- `DELETE /tasks/:id`

### Subtasks

- `POST /tasks/:taskId/subtasks`
- `PATCH /subtasks/:id`
- `DELETE /subtasks/:id`

### Comments

- `POST /tasks/:taskId/comments`
- `GET /tasks/:taskId/comments`

### Board / Kanban

- `GET /projects/:id/board` — returns columns and ordered cards
- `POST /projects/:id/board/reorder` — batch reorder operation (optimistic updates)

### Activity / Audit

- `GET /projects/:id/activity` — paginated logs

### Admin & Bulk

- `POST /projects/:id/import/csv` — import backlog
- `GET /projects/:id/export/csv`

---

## 7. Real-time & Notifications

**Socket.io channels**

- Namespace: `/ws`
- Auth: JWT in connection query header
- Rooms: `org:{orgId}`, `project:{projectId}`, `sprint:{sprintId}`

**Events**

- `task:created`, `task:updated`, `task:deleted`
- `story:reordered`, `story:moved`
- `comment:created`
- `presence:change` (optionally)

**Notifications**

- Push notifications for mentions, assigned tasks (via email or websockets)
- Notification worker using BullMQ for email digests

---

## 8. Background Jobs

- CSV import (parse, validate, create tasks)
- Email digests & alerts
- Rebalancing positions
- Scheduled sprint close operations (e.g., nightly)
- Activity pruning / archive

Use BullMQ with workers running as a separate process in Docker Compose.

---

## 9. Security

- Input validation with `class-validator` or `zod`
- Rate limiting (per-IP and per-API-key) via Redis
- Password hashing using Argon2 or bcrypt
- Use Refresh tokens stored in DB with rotate/revoke strategy
- RBAC checks middleware for endpoints
- Protect file uploads (scan / set limits)

---

## 10. Observability & Monitoring

- Health endpoints: `/healthz`, `/readyz`
- Prometheus metrics endpoint (easy-metrics) and Grafana dashboard
- Structured JSON logs (winston/pino)
- Error tracking: Sentry integration

---

## 11. Testing Strategy

- Unit tests: services, utils (Jest)
- Integration tests: API endpoints using Supertest + test Postgres (docker-compose test or sqlite in-memory for fast runs)
- E2E tests: Playwright for frontend flows (optional)
- CI pipeline: run lint, tests, build, and publish image

---

## 12. Docker Compose (dev) — example

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sprintly_dev
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  redis:
    image: redis:7
    ports:
      - '6379:6379'

  backend:
    build: .
    command: npm run start:dev
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/sprintly_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: supersecret
    ports:
      - '4000:4000'
    depends_on:
      - db
      - redis

  worker:
    build: .
    command: npm run worker
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/sprintly_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  db-data:
```

**Notes:** In production, don't mount source, build a production image, and put Postgres/Redis in managed services or k8s.

---

## 13. Environment variables (example `.env.example`)

```
DATABASE_URL=postgres://postgres:postgres@db:5432/sprintly_dev
REDIS_URL=redis://redis:6379
PORT=4000
JWT_SECRET=replace_me
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
NODE_ENV=development
```

---

## 14. CI/CD (GitHub Actions) — minimal workflow

- `lint` (ESLint + Prettier)
- `test` (Jest)
- `build` (TypeScript compile + Docker build)
- `deploy` (manual to staging, then to prod)

Provide a `ci.yml` in `.github/workflows` that runs tests on PR.

---

## 15. Developer Experience & CLI

- `npm run dev` — runs with ts-node-dev
- `npm run build` — tsc
- `npm run migrate` — prisma migrate
- `npm run worker` — start worker
- `make` targets: `make up`, `make down`, `make test`

---

## 16. Roadmap / Optional Features

1. GraphQL gateway
2. OAuth login (Google, GitHub)
3. Webhooks for external integrations (GitHub, Slack)
4. Time tracking & estimates reporting
5. Mobile-friendly PWA client
6. Import from Jira/Trello/GitHub Projects

---

## 17. Example User Flows

1. **Create project & sprint**: Admin creates org → project → sprint → invite members → add stories → convert stories to tasks
2. **Planning session**: Manager opens board → drags stories into sprint columns → reorders → assigns
3. **Daily use**: Developer marks task `in_progress` → logs time → comments → moves to `done`
4. **Sprint close**: Scheduler runs `POST /sprints/:id/close` → moves incomplete stories back to backlog and records sprint metrics

---

## 18. Deliverables (what you'll implement)

- Backend service (NestJS) with full REST API and auth
- Prisma schema + migrations
- Docker Compose for local dev
- Simple Next.js admin dashboard (optional) covering core flows: board, story/task CRUD
- Tests (unit + integration)
- README with run instructions

---

## 19. Time estimates (rough, per feature)

- Core backend scaffolding & auth: 1-2 days
- Data modeling & migrations: 0.5-1 day
- CRUD endpoints + basic tests: 1-2 days
- Websocket events & simple client integration: 1 day
- Worker & CSV import: 1 day
- Frontend (MVP board): 2-4 days
- Polish, tests, CI: 1-2 days

---

## 20. Appendix: Implementation tips & gotchas

- Use optimistic updates on the frontend for drag-and-drop operations and send batch reorder operations to backend.
- For ordering, prefer fractional positions (e.g., position = (prev.position + next.position)/2) and run a batch reindex when positions become too small.
- Keep business logic inside services (not controllers) to enable unit testing.
- Consider soft deletes vs hard deletes for auditability.
- Use DB transactions when moving multiple items (e.g., moving a story and its tasks between sprints).

---

_End of spec._
