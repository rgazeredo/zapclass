# Claude Code Instructions

## Project Overview

**ZapClass** is a multi-tenant WhatsApp Business API management platform built with Laravel and React. It enables businesses to manage WhatsApp connections, send messages, manage contacts/groups, run campaigns, and handle billing through a subscription model (SaaS).

## Technology Stack

### Backend
- PHP 8.3 with Laravel 12
- PostgreSQL (production) / SQLite (development)
- Laravel Cashier (Stripe payment processing)
- Inertia.js (Server-side rendering bridge)
- Spatie Activity Log (audit logging)
- Pest (testing framework)

### Frontend
- React 19 with TypeScript
- Vite (module bundler)
- Tailwind CSS 4
- Radix UI components
- React Hook Form + Zod (form validation)
- i18next (internationalization - Portuguese/English)
- TanStack React Table

### Infrastructure
- Docker & Docker Compose
- Nginx (web server)
- PostgreSQL 15 (database)

## Directory Structure

```
zapclass/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/V1/          # API endpoint controllers
│   │   │   ├── Auth/            # Authentication controllers
│   │   │   └── Settings/        # Settings pages
│   │   ├── Middleware/          # Auth, API, logging middleware
│   │   └── Requests/            # Form request validation
│   ├── Models/                  # Eloquent models
│   ├── Services/                # Business logic (UazApiService)
│   ├── Jobs/                    # Queue jobs
│   ├── Listeners/               # Event listeners
│   └── Mail/                    # Mailable classes
├── routes/
│   ├── api.php                  # API routes (v1)
│   ├── web.php                  # Web routes (Inertia)
│   └── auth.php                 # Authentication routes
├── resources/js/
│   ├── pages/                   # React page components
│   ├── components/              # React UI components
│   ├── routes/                  # Wayfinder route definitions
│   ├── hooks/                   # Custom React hooks
│   ├── actions/                 # Server actions
│   ├── types/                   # TypeScript types
│   └── i18n/                    # i18next translations
├── database/
│   ├── migrations/              # Schema migrations
│   ├── factories/               # Model factories
│   └── seeders/                 # Database seeders
├── tests/                       # Test suites (Unit, Feature)
└── docker-compose.yml           # Docker compose config
```

## Development Commands

```bash
# Start development (Laravel server, queue, logs, Vite)
composer dev

# Frontend only
npm run dev

# Build for production
npm run build
npm run build:ssr      # With SSR support

# Testing
composer test          # Run Pest tests
npm run lint           # ESLint
npm run format         # Prettier formatting
npm run types          # TypeScript type checking

# Docker
docker-compose up
docker-compose exec app php artisan <command>
```

## Core Models

| Model | Purpose |
|-------|---------|
| `User` | Platform users with tenant isolation |
| `Tenant` | Organization/company accounts |
| `WhatsAppConnection` | WhatsApp Business API instance connections |
| `Subscription` | Stripe billing subscriptions |
| `SupportTicket` | Customer support tickets |
| `ApiLog` | API request/response logging |
| `Webhook` | Webhook configurations |

## API Structure (v1)

API routes are in `routes/api.php` with prefix `/api/v1/`. Protected by `ApiAuthentication` middleware.

### Endpoints
- **Messages** - Send text, images, audio, video, documents, menus, carousels, reactions
- **Contacts** - Add, remove, block, get contact details
- **Groups** - Create, manage, update participants
- **Communities** - Create and edit community groups
- **Quick Replies** - Create and manage message templates
- **Campaigns** - Create and manage message campaigns
- **Profile** - Update profile name and image
- **Check** - Validate API key

## Key Services

- **UazApiService** (`app/Services/UazApiService.php`) - Main WhatsApp Business API client integration
- **ApiLogger** - Request/response logging

## Middleware

- `ApiAuthentication` - API key validation
- `ApiLoggerMiddleware` - Log all API requests
- `CheckSubscriptionActive` - Verify subscription status
- `TenantScope` - Tenant isolation
- `HandleInertiaRequests` - Inertia data injection

## Key Routes

### Public
- `/` - Landing page
- `/termos-de-uso` - Terms of service
- `/politica-de-privacidade` - Privacy policy

### Authenticated (Inertia/React)
- `/dashboard` - Main dashboard
- `/welcome` - Onboarding
- `/settings/*` - User settings
- `/billing/*` - Billing/subscription management
- `/api/documentation` - API docs
- `/support/tickets` - Support system

### Webhooks
- `POST /webhooks/whatsapp` - WhatsApp incoming webhook
- `POST /webhooks/whatsapp/{webhookCode}` - Proxy webhook

## Patterns & Conventions

### Backend
- Service provider architecture for dependency injection
- Middleware for cross-cutting concerns
- Request validation via dedicated Request classes
- Activity logging for audit trails
- Controllers organized per feature area

### Frontend
- Inertia.js for SSR with Laravel backend
- Type-safe component props with TypeScript
- React Hook Form for form handling
- Wayfinder for auto-generated routes (`resources/js/routes/`)
- Radix UI for accessible components
- i18next for translations (`resources/js/i18n/`)

## Environment Variables

Key variables in `.env`:
- `APP_URL` - Application URL
- `DB_*` - Database configuration
- `STRIPE_*` - Stripe API keys
- `UAZAPI_*` - UazAPI WhatsApp service credentials
- `MAIL_*` - Email configuration

## Testing

Tests are in `tests/` using Pest:
- `tests/Unit/` - Unit tests
- `tests/Feature/` - Feature/integration tests

Run with: `composer test` or `./vendor/bin/pest`

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
