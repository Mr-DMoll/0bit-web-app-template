# 0bit Template

A full-stack monorepo template by Koveral. Ships with auth, role-based access, super admin and admin dashboards — ready to extend.

## Stack

- **Frontend**: Next.js 16 (App Router) — `apps/web`
- **Backend**: Express + TypeScript — `apps/api`
- **Database**: PostgreSQL via Prisma + Supabase
- **Monorepo**: Turborepo + pnpm workspaces
- **Auth**: JWT + httpOnly cookies

## Roles

| Role          | Access                              |
|---------------|-------------------------------------|
| `SUPER_ADMIN` | Full platform access, manages admins |
| `ADMIN`       | Manages users, platform settings    |
| `USER`        | Custom — add your own dashboard     |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/your-repo
cd your-repo
pnpm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Database (from Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
JWT_SECRET=your-secret-key-here

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Email (Resend)
RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@yourdomain.com

# AI (optional)
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start development

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

> The API automatically creates the database schema and seeds the super admin on first start — no manual migration steps needed.

Default super admin credentials:
- Email: `superadmin@example.com`
- Password: `SuperAdmin123!`

⚠️ **Change this password immediately after first login.**

## Project Structure

```
apps/
├── api/          Express API
│   └── src/
│       ├── modules/
│       │   ├── auth/         Login, invite, verify
│       │   ├── users/        User CRUD
│       │   ├── admin/        Admin dashboard + user management
│       │   ├── super-admin/  Platform stats + admin management
│       │   └── system/       Health check
│       ├── middleware/       Auth, roles, errors
│       └── services/         Mail, SMS, storage
└── web/          Next.js frontend
    └── src/
        ├── features/
        │   └── auth/         Login, set-password, verify pages
        ├── shared/
        │   ├── components/   UI components, layout, sidebar
        │   ├── context/      Auth, Theme
        │   └── config/       Nav config
        └── app/
            ├── (auth)/       Public auth pages
            ├── (dashboard)/  Protected dashboard pages
            └── (marketing)/  Public landing page

packages/
├── database/     Prisma client + schema
├── types/        Shared TypeScript types
└── ...
```

## Customising

### Add a new role

1. Add to `packages/database/prisma/schema.prisma` → `enum Role`
2. Add to `packages/types/src/enums.ts` → `Role`
3. Add nav items to `apps/web/src/shared/config/nav.config.ts`
4. Create dashboard pages in `apps/web/app/(dashboard)/your-role/`
5. Create API module in `apps/api/src/modules/your-module/`

### Change app name

Search and replace `My App` with your project name across:
- `apps/web/src/features/marketing/pages/LandingPage.tsx`
- `packages/database/prisma/seed.ts`
- `README.md`

### Enable self-registration

In the admin settings dashboard, toggle registration mode from `INVITE_ONLY` to `SELF_REGISTER`.

## Deployment

This template is configured for:
- **Frontend**: Vercel
- **API**: Railway
- **Database**: Supabase

Deployed automatically via the Koveral bootstrapper when you create a new project in O-Bit.

---

Built with ❤️ by [Koveral](https://koveral.com)
