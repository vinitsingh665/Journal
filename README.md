# Trading Journal

A comprehensive web application for traders to log, analyze, and review their trades.

## Features

- **Dashboard**: Get a high-level overview of your trading performance.
- **Journal**: Log individual trades, including execution details, setups, and notes.
- **Analytics**: Deep dive into your trading metrics and statistics.
- **Calendar**: View your trades and performance on a calendar layout.
- **Risk Management**: Calculate position sizes and plan multiple trades.
## Tech Stack

- Next.js (App Router)
- React
- Prisma (Database ORM)
- Turborepo
- pnpm

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up your environment variables (see `.env.example`).
4. Run database migrations:
   ```bash
   pnpm db:push
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Structure

- `apps/web`: The main Next.js web application.
- `packages/database`: Prisma schema and database configuration.
