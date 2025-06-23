<h1 align="center">Real CRM: Customer Relationship Management for Accountants</h1>

<p align="center">
  <img width="1200" alt="Real CRM Dashboard" src="https://github.com/Codehagen/real-crm/blob/main/public/logo-login.png">
</p>

<p align="center">
  A modern, comprehensive CRM solution built specifically for accountants and accounting firms to manage clients, leads, and business relationships efficiently.
</p>

<p align="center">
  <a href="https://github.com/codehagen/real-crm/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/codehagen/real-crm?label=license&logo=github&color=f80&logoColor=fff" alt="License" />
  </a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#directory-structure"><strong>Directory Structure</strong></a>
</p>
<br/>

## Introduction

Real CRM is a specialized customer relationship management system designed for accounting professionals. Built with modern web technologies, it helps accountants manage their client relationships, track leads, handle communications, and streamline their business development processes.

Our CRM provides essential tools for accounting firms:
- **Client Management** - Comprehensive client profiles with contact information and business details
- **Lead Tracking** - Manage potential clients through your sales pipeline
- **Activity Management** - Track meetings, calls, emails, and notes
- **Offer Management** - Create and track proposals for accounting services
- **Job Application Tracking** - Manage recruitment processes
- **Email Integration** - Centralized email management
- **Multi-workspace Support** - Handle multiple accounting firms or departments

## Features

### Core CRM Functionality
- **Business Management**: Comprehensive client and prospect management with Norwegian business registry (Brønnøysund) integration
- **Contact Management**: Multiple contacts per business with role-based organization
- **Lead Pipeline**: Track prospects from initial contact to customer conversion
- **Activity Tracking**: Log calls, meetings, emails, and notes with timeline views
- **Offer Management**: Create, send, and track accounting service proposals

### Accounting-Specific Features
- **Norwegian Business Integration**: Automatic company data enrichment from Brønnøysund Register Centre
- **Multi-workspace Support**: Perfect for accounting firms with multiple offices or departments
- **Client Lifecycle Management**: Track clients from lead to long-term customer
- **Industry-specific Tags**: Categorize clients by industry, service type, or custom criteria

### User Experience
- **Modern Dashboard**: Clean, intuitive interface designed for daily use
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Easy on the eyes during long work sessions
- **Real-time Updates**: Collaborative features for team environments

## Installation

Get started with Real CRM:

```bash
# Clone the repository
git clone <repository-url>
cd real-crm

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and authentication settings

# Set up the database
pnpm prisma generate
pnpm prisma db push

# Start the development server
pnpm dev
```

Visit `http://localhost:3000` to access your CRM.

## Tech Stack

### Frontend & Framework
- **[Next.js 15](https://nextjs.org/)** – React framework with App Router and Server Components
- **[React 18](https://reactjs.org/)** – Modern React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** – Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework

### UI Components & Design
- **[Radix UI](https://www.radix-ui.com/)** – Accessible UI component primitives
- **[Lucide React](https://lucide.dev/)** – Beautiful icon library
- **[Framer Motion](https://www.framer.com/motion/)** – Smooth animations
- **[Recharts](https://recharts.org/)** – Responsive charts for analytics

### Database & Backend
- **[Prisma](https://www.prisma.io/)** – Type-safe database toolkit
- **[PostgreSQL](https://www.postgresql.org/)** – Robust relational database
- **[Clerk](https://clerk.com/)** – Authentication and user management

### Development Tools
- **[ESLint](https://eslint.org/)** – Code linting
- **[Prettier](https://prettier.io/)** – Code formatting
- **[PNPM](https://pnpm.io/)** – Fast, disk space efficient package manager

## Directory Structure

Real CRM follows a clean and organized structure:

```
.
├── src/                           # Main application source
│   ├── app/                       # Next.js App Router pages
│   │   ├── dashboard/             # Main CRM dashboard
│   │   ├── customers/             # Customer management pages
│   │   ├── leads/                 # Lead management pages
│   │   ├── applications/          # Job application tracking
│   │   ├── settings/              # Application settings
│   │   ├── api/                   # API routes
│   │   ├── actions/               # Server actions
│   │   └── generated/             # Generated Prisma client
│   ├── components/                # React components
│   │   ├── ui/                    # Base UI components (buttons, forms, etc.)
│   │   ├── customer/              # Customer-specific components
│   │   ├── lead/                  # Lead management components
│   │   ├── application/           # Job application components
│   │   ├── settings/              # Settings components
│   │   ├── sidebar/               # Navigation components
│   │   └── sections/              # Page sections
│   ├── lib/                       # Utility functions and configurations
│   ├── hooks/                     # Custom React hooks
│   └── assets/                    # Static assets
├── prisma/                        # Database schema and migrations
│   ├── schema.prisma              # Database schema definition
│   ├── seed.ts                    # Database seeding script
│   └── migrations/                # Database migration files
├── public/                        # Static files
└── package.json                   # Project dependencies and scripts
```

## Database Schema

The CRM uses a comprehensive database schema designed for accounting firms:

- **Business**: Unified model for both leads and customers
- **Contact**: Multiple contacts per business
- **Activity**: Track all interactions (calls, meetings, emails, notes)
- **Offer**: Sales proposals and service quotes
- **Tag**: Categorization system for businesses
- **Email**: Integrated email management
- **JobApplication**: Recruitment tracking
- **Workspace**: Multi-tenant support
- **User**: User management and permissions

## Getting Started

1. **Set up your workspace** - Create your accounting firm's workspace
2. **Import your contacts** - Add existing clients and prospects
3. **Configure integrations** - Connect email and other services
4. **Train your team** - Invite team members and set permissions
5. **Start tracking** - Begin logging activities and managing leads

## Contributing

We welcome contributions to Real CRM! Here's how you can help:

- [Open an issue](https://github.com/codehagen/real-crm/issues) to report bugs or request features
- [Submit a pull request](https://github.com/codehagen/real-crm/pulls) to contribute code improvements
- Help improve documentation and user guides

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a pull request

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details.

---

**Real CRM** - Empowering accountants with modern client relationship management.
