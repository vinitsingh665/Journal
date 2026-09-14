<div align="center">
  <a href="https://traderlabs.in">
    <img src="apps/web/public/logo.png" alt="TraderLabs Logo" width="150" />
  </a>
  <h1>Trading Journal</h1>
  <p><strong>Website:</strong> <a href="https://traderlabs.in">traderlabs.in</a></p>
</div>

A comprehensive, full-stack web application designed for traders to log, analyze, review, and optimize their trades. Built with modern web technologies, this journal provides an intuitive interface with powerful analytics and AI-driven insights.

---

## ✨ Features

- **📊 Interactive Dashboard**: Get a high-level overview of your trading performance, including profit/loss (P&L), win rate, and total trades.
- **📝 Detailed Journaling**: Log individual trades with precision. Record entry/exit points, execution details, specific setups, and personal notes.
- **📈 Advanced Analytics**: Deep dive into your trading metrics. Visualize your data using interactive charts to identify trends and patterns in your trading behavior.
- **📅 Trading Calendar**: View your trades, daily P&L, and performance on a calendar layout for easy historical tracking.
- **⚖️ Risk Management**: Calculate position sizes dynamically and plan multiple trades while strictly adhering to your risk parameters.
- **🤖 AI Assistant**: Integrated AI capabilities (powered by Groq) to help analyze trades and provide smart insights.
- **🌍 Internationalization (i18n)**: Multi-language support to cater to traders globally.
- **📄 Export to PDF**: Easily export your trading reports and charts to PDF for record-keeping.

## 🛠️ Tech Stack

This project is built using a modern, scalable monorepo architecture with **Turborepo**.

### Core
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

### Backend & Database
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (or your preferred SQL database supported by Prisma)
- **Authentication**: JWT via `jose`, Google Auth, and `bcryptjs`
- **Email Services**: [Resend](https://resend.com/)

### Tooling & Libraries
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Monorepo Management**: [Turborepo](https://turbo.build/)
- **Validation**: [Zod](https://zod.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/) & `react-chartjs-2`
- **AI Integration**: Groq SDK

## 📁 Project Structure

The repository is structured as a monorepo using Turborepo:

```text
trading-journal/
├── apps/
│   └── web/                 # Main Next.js application
├── packages/
│   ├── database/            # Prisma schema, migrations, and db client
│   ├── trading-engine/      # Shared trading logic and calculations
│   └── typescript-config/   # Shared tsconfig settings
└── turbo.json               # Turborepo configuration
```

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- `pnpm` (v11+)
- A SQL database (e.g., PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vinitsingh665/Journal.git
   cd Journal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Make sure to configure your database URL, auth secrets, and API keys (like Groq and Resend).*

4. **Initialize the Database**
   Run Prisma migrations to set up your database schema:
   ```bash
   pnpm db:push
   ```
   *(Optional)* If you have seed data:
   ```bash
   pnpm db:seed
   ```

5. **Start the Development Server**
   Launch all applications and packages in development mode:
   ```bash
   pnpm dev
   ```

   The web app will be available at [http://localhost:3000](http://localhost:3000).

## 📜 Scripts

Available scripts in the root `package.json`:

- `pnpm dev`: Starts the development servers.
- `pnpm build`: Builds all apps and packages for production.
- `pnpm lint`: Lints the codebase.
- `pnpm typecheck`: Runs TypeScript type checking.
- `pnpm db:generate`: Generates the Prisma client.
- `pnpm db:push`: Pushes schema changes to the database.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Happy Trading! 📈*
