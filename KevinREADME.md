# Developer Guide

This guide explains the overall architecture of **Regnskapsloop CRM** and provides additional information on the Prisma schema.

## Project Overview

The application is a multi-tenant CRM built with **Next.js** and **Prisma**. The backend API uses Next.js API routes while the frontend is rendered with the App Router. Authentication is handled via **Clerk**.

## Key Directories

- `src/app` – Next.js pages, API routes and server actions.
- `src/components` – React components and UI building blocks.
- `prisma` – Prisma schema and migrations.
- `public` – Static assets.

## Prisma Schema

The database schema is defined in `prisma/schema.prisma`. It models the main CRM concepts:

- **Workspace** – Represents a tenant. Each workspace has a unique API key so external systems can create leads via the API.
- **User** – Application users. A user can belong to multiple workspaces (many-to-many via `UserWorkspaces`).
- **Business** – Unified model for both leads and customers. This makes it simple to move a lead through the sales pipeline without changing tables. Fields like `status` and `stage` track the lifecycle.
- **Contact** – People at a business. A business can have multiple contacts.
- **Activity** – Calls, meetings, emails and notes. Activities can relate to businesses, contacts, or job applications and record who performed them.
- **Offer** and **OfferItem** – Proposals sent to businesses with line items.
- **Email** – Stored email conversations (subject, sender, recipient, content, etc.).
- **JobApplication** – Tracks recruitment with statuses such as `new`, `interviewed`, or `hired`.
- **Tag** – Categories for businesses. Tag names are unique per workspace.

All models include `workspaceId` to support multi-tenancy. Relations cascade on delete to keep data per workspace isolated.

### Schema Design Goals

The schema unifies leads and customers under the `Business` model so we can track a company through the entire sales pipeline without migrating data between tables. Related entities like `Contact`, `Activity`, and `Offer` reference a `workspaceId` to keep each tenant’s data isolated. Tags provide flexible categorisation while `JobApplication` lets us track recruitment alongside CRM activities. This structure will let us add analytics, email integration, and other modules without major refactoring.

## Development

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill in database and Clerk credentials.
3. Initialize the database: `pnpm prisma generate && pnpm prisma db push`.
4. Start the development server with `pnpm dev` and open `http://localhost:3000`.

## API Example

`src/app/api/leads/route.ts` exposes a POST endpoint to create leads. It expects an API key in the `X-API-Key` header. The request body is validated and a `Business` record is created. If an `orgNumber` is provided, the lead is enriched with data from Brønnøysund Register Centre.

```ts
const apiKey = req.headers.get("X-API-Key");
const workspace = await prisma.workspace.findFirst({ where: { apiKey } });
...
const lead = await prisma.business.create({
  data: {
    name: data.name,
    email: data.email,
    phone: data.phone,
    stage: CustomerStage.lead,
    status: BusinessStatus.active,
    workspaceId: workspace.id,
  },
});