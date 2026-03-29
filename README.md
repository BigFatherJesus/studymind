# StudyMind

  An AI-powered study platform that transforms course materials into structured knowledge bases.

  ## Features
  - Subject creation with AI-generated descriptions and key concepts
  - Upload pipeline (text, URLs, PDFs) with automatic summarization
  - Interactive knowledge graph of concepts and relationships
  - Flashcard generation and quiz creation
  - AI chat tutor grounded in your uploaded materials
  - Conflict detection and resolution
  - Version history with rollback
  - Team collaboration with role-based permissions
  - Credit-based AI usage with tiered subscriptions

  ## Stack
  - **Frontend**: React + Vite, Tailwind CSS, React Query, @xyflow/react, framer-motion
  - **Backend**: Express 5 + TypeScript
  - **Database**: PostgreSQL + Drizzle ORM
  - **Monorepo**: pnpm workspaces

  ## Getting Started
  ```bash
  pnpm install
  pnpm --filter @workspace/db run push
  pnpm --filter @workspace/api-server run dev
  pnpm --filter @workspace/studymind run dev
  ```
  