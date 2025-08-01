# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real CRM is a comprehensive CRM solution specifically designed for Norwegian accountants and accounting firms. It integrates with the Norwegian business registry (Brønnøysund/BRREG) to provide up-to-date company information and supports multi-workspace functionality for managing multiple clients.

## Tech Stack

- **Next.js 15.3.3** with App Router and React Server Components
- **React 18.3.1** with TypeScript
- **Prisma ORM** with PostgreSQL database
- **Clerk** for authentication
- **Tailwind CSS v4** with Radix UI components (shadcn/ui)
- **pnpm** as the package manager

## Common Development Commands

```bash
# Development
pnpm dev              # Start development server with Turbo mode

# Building and Production
pnpm build            # Generate Prisma client and build for production
pnpm start            # Start production server

# Database Management
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:seed      # Seed database with initial data
npx prisma migrate dev    # Create and apply migrations
npx prisma studio         # Open Prisma Studio GUI

# Code Quality
pnpm lint             # Run ESLint

# BRREG Data Import
pnpm import:brreg         # Import BRREG data (default)
pnpm import:brreg:full    # Import full BRREG dataset
pnpm import:brreg:sample  # Import sample data (100 records)
```

## Architecture Overview

### Directory Structure

- `/src/app/` - Next.js App Router pages and API routes
  - `actions/` - Server actions for business logic (customers, leads, tasks, etc.)
  - `api/` - REST API endpoints (leads, lead-insights)
  - Route folders for each page (dashboard, customers, leads, tasks, etc.)
- `/src/components/` - React components organized by feature
  - `ui/` - Reusable UI components from shadcn/ui
  - Feature components (lead/, customer/, task/, brreg/)
- `/src/lib/` - Utility functions and services
  - `services/` - Business logic services
- `/prisma/` - Database schema and migrations
- `/scripts/` - Data import scripts (BRREG integration)

### Key Architectural Patterns

1. **Server Actions**: Primary pattern for data mutations located in `/src/app/actions/`
2. **Multi-tenancy**: Workspace-based isolation throughout the application
3. **Soft Deletes**: Cascade soft deletes implemented in database schema
4. **Norwegian Business Integration**: BRREG data integrated via hybrid approach (bulk import + API)

### Database Schema

Key models:
- `Business` - Unified model for leads and customers
- `BrregBusiness` - Norwegian business registry data
- `Workspace` - Multi-tenant workspace support
- `Contact`, `Activity`, `Offer`, `Email`, `Task` - CRM features
- `User` - User management linked to Clerk authentication

### Authentication & Authorization

- Clerk authentication with middleware protecting routes
- Public routes: `/`, `/sign-in/*`, `/api/leads/*`
- Workspace-based access control throughout the application

## Norwegian-Specific Features

1. **BRREG Integration**
   - Import scripts in `/scripts/import-brreg.ts`
   - Hybrid approach: bulk CSV import + real-time API updates
   - Organization forms: AS, ENK, ANS, etc.
   - NACE industry codes

2. **Location Data**
   - Postal code to city mapping
   - Municipality (kommune) filtering
   - Norwegian address formatting

3. **Business Data Fields**
   - Organization number (orgnr)
   - VAT registration (MVA)
   - Company types specific to Norway
   - Industry classifications (NACE codes)

## Development Guidelines

1. **TypeScript**: Use strict typing, avoid `any`
2. **Server Components**: Prefer RSC over client components when possible
3. **Data Fetching**: Use server actions for mutations, server components for queries
4. **UI Components**: Use existing shadcn/ui components from `/src/components/ui/`
5. **Styling**: Use Tailwind CSS classes, follow existing patterns
6. **Database**: Always include workspace filtering in queries
7. **Environment Variables**: Required vars include `DATABASE_URL`, `DIRECT_URL`, and Clerk keys

## Testing Strategy

Currently no automated tests are configured. When implementing features:
- Manually test workspace isolation
- Verify BRREG data integrity
- Test authentication flows
- Ensure proper error handling

## Important Notes

- Build errors from TypeScript and ESLint are currently ignored (see next.config.mjs)
- BRREG data updates should be scheduled regularly to maintain accuracy
- The application is optimized for Norwegian accounting firms and their workflows
- Multi-workspace architecture requires careful consideration in all queries and mutations