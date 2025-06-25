# Database Setup Guide

## Current Setup: SQLite (Development)

Your application is now connected to a **SQLite database** for development.

### ✅ What's Working:

- **Database**: SQLite file at `prisma/dev.db`
- **Schema**: Complete with all quiz tables
- **Data**: "Prompting Basics" quiz imported (10 questions)
- **CLI Tools**: Import/export functionality
- **Web Interface**: Full quiz-taking experience

### 📊 Current Status:

```bash
# Check imported quizzes
npm run quiz:list

# Take the quiz
npm run dev
# Visit: http://localhost:3000
```

## Upgrading to PostgreSQL (Production)

When ready for production, switch to PostgreSQL:

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres

# Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Update .env
DATABASE_URL="postgresql://username:password@localhost:5432/quizzer_db"

# Migrate
npm run db:migrate
npm run quiz:import data/prompting-basics.json
```

### Option 2: Cloud PostgreSQL (Recommended)

Popular free options:

- **Supabase**: Free 500MB + Auth
- **Railway**: Free tier available
- **Neon**: Serverless PostgreSQL
- **Vercel Postgres**: Integrated with Vercel

```bash
# Get connection string from your cloud provider
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Update schema and migrate
npm run db:migrate
npm run quiz:import data/prompting-basics.json
```

## Database Commands

```bash
# View database in browser
npm run db:studio

# Reset database
rm prisma/dev.db
npm run db:migrate

# Import quiz data
npm run quiz:import data/your-quiz.json

# List all quizzes
npm run quiz:list

# Export quiz
npm run quiz:export quiz-id output.json
```

## Schema Overview

The database includes:

- **Users**: Quiz takers
- **Quizzes**: Quiz metadata
- **Questions**: Individual questions
- **Options**: Answer choices
- **Attempts**: User quiz sessions
- **Answers**: User responses

All relationships are properly defined with foreign keys and cascading deletes.
