# Workspace

## Overview

**StudyMind** — An AI-powered study platform that transforms course materials into an intelligent, structured knowledge base. Students create subjects, upload lecture notes/PDFs/videos, and the platform automatically generates summaries, flashcards, quizzes, knowledge maps, and provides an AI chat tutor.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, React Query, @xyflow/react, framer-motion, recharts

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── studymind/          # React + Vite frontend (previewPath: /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Features

1. **Subject Creation** — AI generates description, key concepts, knowledge structure from syllabus
2. **Upload Pipeline** — Accepts text/URL, processes into summaries, flashcards, knowledge nodes
3. **Knowledge Base / Visual Map** — Interactive graph (react-flow) of concept nodes and relationships
4. **AI Chat Tutor** — Grounded in uploaded materials, cites sources, generates practice problems
5. **Flashcards** — Auto-generated with flip animations, difficulty levels
6. **Quizzes** — Auto-generated multiple choice with scoring and feedback
7. **Conflict Detection** — Detects contradictions across uploads, offers resolution paths
8. **Version History** — Subject snapshots with rollback capability
9. **Teams** — Shared subjects, role-based permissions, invite codes
10. **Credits** — Tiered subscription model with credit-based AI usage

## Database Schema (lib/db/src/schema/)

- `users` — User accounts with subscription tiers
- `subjects` — Study subjects with AI descriptions and stats
- `uploads` — Uploaded materials (text, URL, etc.) with processing status
- `knowledge_nodes` — Concept nodes in the knowledge graph
- `knowledge_edges` — Relationships between knowledge nodes
- `flashcards` — Auto-generated flashcards
- `quizzes` — Generated quizzes with questions JSON
- `chat_messages` — Chat tutor conversation history
- `conflicts` — Detected contradictions in subject material
- `subject_versions` — Version snapshots for rollback
- `teams` — Study groups with invite codes
- `team_members` — Team membership with roles
- `notifications` — User notifications

## API Routes (artifacts/api-server/src/routes/)

All routes prefixed with `/api`

- `GET /users/me` — Current user
- `GET /users/me/credits` — Credit balance
- `GET/POST /subjects` — List/create subjects
- `GET/PATCH/DELETE /subjects/:id` — Subject CRUD
- `GET/POST /subjects/:id/uploads` — Upload management
- `POST /subjects/:id/uploads/:id/process` — Trigger AI processing
- `GET /subjects/:id/knowledge-nodes` — Knowledge graph (nodes + edges)
- `POST /subjects/:id/knowledge-nodes` — Create node
- `GET/POST /subjects/:id/flashcards` — Flashcards
- `GET/POST /subjects/:id/quizzes` — Quizzes
- `POST /subjects/:id/quizzes/:id/submit` — Submit quiz answers
- `GET/POST /subjects/:id/chat` — AI chat tutor
- `GET /subjects/:id/conflicts` — Detected conflicts
- `POST /subjects/:id/conflicts/:id/resolve` — Resolve conflict
- `GET /subjects/:id/versions` — Version history
- `POST /subjects/:id/versions/:id/restore` — Restore version
- `GET/POST /teams` — Teams CRUD
- `GET/POST /teams/:id/members` — Team members
- `GET /notifications` — User notifications

## Demo User

ID: `demo-user-1` (Alex Johnson, intermediate tier, 850 credits)
No auth required — all requests use this demo user automatically.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push schema changes to database
