# Quizzer - Interactive Quiz Application

A modern, full-stack quiz application built with Next.js, TypeScript, and Prisma.

## Features

- 📝 Interactive quiz taking with single/multiple choice questions
- 📊 Progress tracking and detailed results
- 🏆 Leaderboards and user rankings
- 🔄 Quiz retake functionality
- 📈 Usage analytics for stakeholders
- 🔐 User authentication and profiles
- 🎯 Responsive UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Testing**: Vitest, Testing Library, Playwright, Stryker Mutator
- **Code Quality**: ESLint, Prettier, Husky
- **Security**: ESLint Security Plugin

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials.

4. Generate Prisma client:

   ```bash
   npm run db:generate
   ```

5. Run database migrations:

   ```bash
   npm run db:migrate
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run test:mutation` - Run mutation tests (test quality check)
- `npm run quality:check` - Run all quality checks
- `npm run typecheck` - Type checking
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # UI components
│   ├── ui/          # Reusable UI components
│   ├── quiz/        # Quiz-specific components
│   └── layout/      # Layout components
├── lib/             # Business logic layer
│   ├── services/    # Business services
│   ├── repositories/ # Data access layer
│   ├── types/       # TypeScript types
│   └── utils/       # Utilities
├── database/        # Prisma schema & migrations
└── __tests__/       # Test suites
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
