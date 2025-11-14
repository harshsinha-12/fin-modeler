# FinModeler - AI-Assisted Financial Modeling for Startups

**Production-grade MVP for a B2B SaaS financial modeling platform**

FinModeler is a web application designed for early-stage startup founders and finance leads who need robust, forward-looking financial models without being Excel experts. It provides structured, guided financial modeling with AI assistance, scenario planning, and investor-ready outputs.

## 🎯 Product Vision

**Target Users:** Pre-seed to Series A founders, fractional CFOs, finance leads

**Core Value Proposition:**
- Build 12-36 month financial projections in minutes, not days
- Model multiple scenarios (Base, Optimistic, Pessimistic)
- Get AI-powered insights and recommendations
- Export investor-ready outputs (Excel, CSV, PDF)
- Multi-tenant SaaS with proper workspace isolation

**Designed to justify a $1M valuation** with a clear path to product-market fit and revenue generation.

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** (Strict mode)
- **React** (Server & Client Components)
- **Tailwind CSS** (Utility-first styling)
- **shadcn/ui** (Component library)
- **Lucide React** (Icons)
- **Recharts** (Data visualization)

### Backend
- **Next.js API Routes** (TypeScript)
- **PostgreSQL** (Primary database)
- **Prisma ORM** (Type-safe database access)
- **NextAuth.js** (Authentication)

### Infrastructure
- Multi-tenant architecture from day one
- Role-based access control (Owner, Editor, Viewer)
- Audit logging for all major actions
- Clean separation of domain logic from framework code

---

## 📁 Project Structure

```
fin-modeler/
├── app/                          # Next.js 14 App Router
│   ├── (marketing)/              # Public marketing pages
│   │   └── page.tsx             # Landing page
│   ├── (app)/                   # Authenticated app area
│   │   ├── dashboard/           # Main dashboard
│   │   ├── companies/           # Company management
│   │   ├── scenarios/           # Scenario comparison
│   │   └── layout.tsx           # App shell with sidebar
│   ├── api/                     # API routes
│   │   ├── companies/           # Company CRUD
│   │   ├── assumptions/         # Assumption sets
│   │   ├── scenarios/           # Scenario management
│   │   ├── projections/         # Run financial projections
│   │   ├── exports/             # Excel/CSV/PDF exports
│   │   ├── assistant/           # AI assistant
│   │   ├── workspaces/          # Workspace management
│   │   └── activity/            # Audit logs
│   ├── auth/                    # Auth pages
│   │   └── signin/
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── layout/                  # Layout components
│       ├── app-sidebar.tsx
│       └── app-header.tsx
├── lib/
│   ├── financeEngine/           # Core financial logic (PURE)
│   │   ├── index.ts            # Main projection engine
│   │   ├── calculations.ts     # Pure calculation functions
│   │   ├── utils.ts            # Date/number utilities
│   │   └── sanityCheck.ts      # Validation & benchmarks
│   ├── auth/                    # Auth utilities
│   │   ├── auth-helpers.ts     # Permission checks
│   │   └── session.ts          # Session management
│   ├── db/
│   │   └── prisma.ts           # Prisma client singleton
│   ├── validation/
│   │   └── schemas.ts          # Zod validation schemas
│   ├── export/
│   │   └── excel.ts            # Excel/CSV generation
│   ├── pdf/
│   │   └── generator.ts        # PDF generation (stub)
│   ├── ai/
│   │   └── assistant.ts        # AI assistant (stub)
│   ├── audit/
│   │   └── logger.ts           # Audit logging
│   ├── types.ts                # TypeScript domain types
│   └── utils.ts                # General utilities
├── prisma/
│   └── schema.prisma           # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🗄️ Database Schema

### Core Entities

**Multi-Tenancy:**
- `Workspace` - Team workspaces
- `WorkspaceMember` - User-workspace associations with roles

**Auth:**
- `User` - User accounts
- `Account` - OAuth/email providers
- `Session` - Active sessions

**Financial Modeling:**
- `CompanyProfile` - Company details (stage, sector, starting metrics)
- `AssumptionSet` - Revenue model, costs, assumptions
- `HiringPlanItem` - Hiring schedule by role
- `Scenario` - Named scenarios with overrides (Base, Optimistic, etc.)
- `Projection` - Monthly projection results

**Analytics:**
- `AuditLog` - Activity tracking

See `prisma/schema.prisma` for complete schema definition.

---

## 🧮 Financial Engine

### Architecture

The financial engine is a **pure TypeScript module** with zero framework dependencies, located in `lib/financeEngine/`.

### Core Function

```typescript
function runScenario(input: FinancialModelInput): FinancialModelOutput
```

**Inputs:**
- Company profile (starting cash, MRR, headcount)
- Assumption set (revenue model, costs, growth rates)
- Hiring plan (roles, salaries, start dates)
- Scenario overrides (adjust assumptions per scenario)

**Outputs:**
- Array of monthly projections (MRR, revenue, costs, cash, runway, headcount)
- Summary metrics (peak burn, zero cash month, MRR growth, etc.)

### Key Calculations

1. **Customer Growth**
   - New customers per month
   - Churn calculation
   - Net active customers

2. **Revenue**
   - MRR from active customers × ARPU
   - Expansion revenue (upsells, cross-sells)
   - Total monthly revenue

3. **Costs**
   - COGS (based on gross margin)
   - Salary costs (from hiring plan)
   - Fixed costs (office, tools, infra)
   - Variable costs (% of revenue)

4. **Cash Flow**
   - Net burn = Total OpEx - Revenue
   - Ending cash = Starting cash - Net burn
   - Runway = Cash / Monthly burn

### Scenario Overrides

Scenarios can override base assumptions:
- Customer growth multiplier
- ARPU adjustments
- Churn rate changes
- Cost multipliers
- Hiring delays

### Sanity Checks

Built-in validation flags unrealistic assumptions:
- LTV:CAC ratio < 3:1
- Churn > 15% monthly
- CAC payback > 24 months
- Runway < 6 months

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd fin-modeler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/finmodeler"
   NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
   NEXTAUTH_URL="http://localhost:3000"

   # Optional: OAuth
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""

   # Optional: Email
   EMAIL_SERVER_HOST=""
   EMAIL_SERVER_PORT=""
   EMAIL_SERVER_USER=""
   EMAIL_SERVER_PASSWORD=""
   EMAIL_FROM="noreply@finmodeler.com"
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to `http://localhost:3000`

---

## 📡 API Documentation

### Authentication

All `/api/*` routes (except auth endpoints) require authentication via NextAuth session.

### Workspace Scoping

Every request must include or derive a `workspaceId`. The API enforces:
- Users can only access workspaces they're members of
- OWNER can manage everything
- EDITOR can edit models and run projections
- VIEWER can view and export only

### Key Endpoints

#### Companies

```
GET    /api/companies?workspaceId={id}
POST   /api/companies
GET    /api/companies/{companyId}
PATCH  /api/companies/{companyId}
```

#### Assumptions

```
POST   /api/assumptions
       Body: { companyId, ...assumptions, hiringPlan: [...] }
```

#### Scenarios

```
GET    /api/scenarios?assumptionSetId={id}
POST   /api/scenarios
       Body: { assumptionSetId, name, overrides: {...} }
```

#### Projections

```
POST   /api/projections/run
       Body: { scenarioId }
       Returns: { projections: [...], summary: {...} }
```

#### Exports

```
POST   /api/exports/{format}
       format: "excel" | "csv" | "pdf"
       Body: { scenarioId }
       Returns: File download
```

#### AI Assistant

```
POST   /api/assistant
       Body: { companyId, scenarioId?, question }
       Returns: { answer, suggestions?, relatedMetrics? }
```

#### Workspaces

```
GET    /api/workspaces
POST   /api/workspaces
       Body: { name, slug, defaultCurrency? }
```

#### Activity

```
GET    /api/activity?workspaceId={id}&limit={n}
```

---

## 🎨 UI/UX Design Principles

### Layout
- Left sidebar navigation (64px icons + labels)
- Top header with workspace switcher and notifications
- Main content area with padding and proper spacing

### Components
- shadcn/ui for consistency
- Tailwind utility classes (no arbitrary values)
- Responsive: Desktop-first, but functional on laptops

### Color Scheme
- Primary: Blue (`hsl(221.2 83.2% 53.3%)`)
- Muted backgrounds for visual hierarchy
- Semantic colors for metrics (green=up, red=down, orange=warning)

### Empty States
- Every list/table has an empty state
- CTAs to guide users to next action

### Loading States
- Skeleton loaders for data fetching
- Button loading states

---

## 🤖 AI Assistant (Stubbed)

The AI assistant is **fully stubbed** but designed with a clean interface for future LLM integration.

### Current Implementation

- Pattern matching on common questions
- Context-aware canned responses
- Analyzes current projections if provided
- Returns suggestions and related metrics

### Integration Points

Located in `lib/ai/assistant.ts`:

```typescript
async function askFinanceAssistant(
  request: AssistantRequest
): Promise<AssistantResponse>
```

**To integrate with OpenAI/Anthropic:**
1. Add API key to environment
2. Replace stub logic with LLM call
3. Pass context (company, assumptions, projections) in prompt
4. Parse LLM response into structured format

---

## 📊 Export Functionality

### Excel Export
- Uses `xlsx` library
- Two sheets: Summary + Monthly Projections
- Includes all metrics in tabular format

### CSV Export
- Single file with monthly data
- Comma-separated, ready for analysis

### PDF Export (Stub)
- Currently generates HTML
- Designed for puppeteer integration
- Would render HTML → PDF server-side

**Production Implementation:**
```bash
npm install puppeteer
```

Update `lib/pdf/generator.ts` to use headless Chrome.

---

## 🔒 Security & Multi-Tenancy

### Workspace Isolation

- Every database query filters by `workspaceId`
- Helper functions in `lib/auth/auth-helpers.ts` enforce checks
- API routes validate workspace access before operations

### Role-Based Permissions

| Role   | View | Edit | Export | Manage Team | Billing |
|--------|------|------|--------|-------------|---------|
| OWNER  | ✅   | ✅   | ✅     | ✅          | ✅      |
| EDITOR | ✅   | ✅   | ✅     | ❌          | ❌      |
| VIEWER | ✅   | ❌   | ✅     | ❌          | ❌      |

### Authentication

- NextAuth.js with email magic links + Google OAuth
- Secure session management
- New users automatically get a default workspace

---

## 📈 Audit Logging

All significant actions are logged to `AuditLog` table:

- Create/update/delete companies
- Create/update assumption sets
- Run projections
- Exports (Excel, CSV, PDF)
- Team management actions

Accessible via:
- API: `GET /api/activity?workspaceId={id}`
- UI: Activity page (shows last 20 actions)

---

## 🧪 Testing Strategy

### Recommended Testing Approach

1. **Financial Engine (Unit Tests)**
   - Test pure functions in `lib/financeEngine/`
   - Verify calculations for edge cases
   - Validate scenario overrides
   - Example:
     ```typescript
     test('calculates runway correctly', () => {
       const runway = calculateRunway(100000, 10000);
       expect(runway).toBe(10);
     });
     ```

2. **API Routes (Integration Tests)**
   - Test with Next.js test utilities
   - Mock database with Prisma test client
   - Verify permission checks

3. **UI Components (Component Tests)**
   - React Testing Library
   - Test user interactions
   - Verify data display

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (future)
npm run test:e2e
```

---

## 🚀 Deployment

### Database

1. **PostgreSQL Setup**
   - Provision PostgreSQL (Render, Railway, Supabase, or AWS RDS)
   - Get connection string
   - Update `DATABASE_URL` in production environment

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

### Application

**Recommended Platforms:**
- **Vercel** (Next.js optimized, easiest)
- **Railway** (includes PostgreSQL)
- **Render** (good for full stack)

**Vercel Deployment:**
```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Environment Variables (Production)

```env
DATABASE_URL=<production-postgres-url>
NEXTAUTH_SECRET=<secure-secret>
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=<prod-client-id>
GOOGLE_CLIENT_SECRET=<prod-secret>
```

---

## 🎯 MVP Completion Status

### ✅ Completed

- [x] Project foundation (Next.js 14, TypeScript, Tailwind)
- [x] Prisma schema with all domain entities
- [x] Financial engine (pure TypeScript, deterministic)
- [x] API routes (companies, assumptions, scenarios, projections)
- [x] Authentication (NextAuth with Google OAuth + email)
- [x] Multi-tenancy & workspace management
- [x] Role-based access control
- [x] Audit logging
- [x] Export functionality (Excel, CSV, PDF stub)
- [x] AI assistant (stubbed with clean interface)
- [x] Marketing landing page
- [x] App layout (sidebar, header)
- [x] Dashboard page (KPIs, charts placeholders)
- [x] shadcn/ui components setup

### 🔄 To Complete for Full MVP

1. **Onboarding Wizard** (5 steps to create first model)
   - Located in: `app/(app)/onboarding/`
   - Components: Multi-step form with progress bar
   - Saves: CompanyProfile + AssumptionSet + HiringPlan

2. **Scenario Management Page**
   - UI to create/edit/compare scenarios
   - Side-by-side comparison view
   - Located in: `app/(app)/scenarios/`

3. **Charts Integration**
   - Add Recharts components to dashboard
   - MRR growth line chart
   - Cash & burn dual-axis chart
   - Headcount bar chart

4. **AI Assistant Side Panel**
   - Slide-out panel component
   - Question input + conversation history
   - Integrate with `/api/assistant`

5. **Settings Pages**
   - Workspace settings
   - Team member management
   - Billing integration (Stripe)

---

## 🔮 Beyond MVP: Enhancements

### Near-Term (Weeks 1-4 after MVP)

1. **Enhanced Onboarding**
   - Industry templates (SaaS, marketplace, etc.)
   - Sample data for exploration

2. **Collaboration Features**
   - Comments on scenarios
   - @mentions for team
   - Change history/versioning

3. **Advanced Charts**
   - Interactive Recharts visualizations
   - Drill-down capabilities
   - Custom date ranges

4. **Real AI Integration**
   - OpenAI GPT-4 or Anthropic Claude
   - Context-aware financial advice
   - Benchmark comparisons

### Medium-Term (Months 2-3)

1. **Investor Updates**
   - Template-based investor email generation
   - Auto-populate with metrics
   - Track open rates

2. **Fundraising Tools**
   - "Raise round" simulation
   - Dilution calculator
   - Target metrics for next stage

3. **Benchmarking**
   - Compare to peer companies
   - Industry averages by stage
   - Goal setting

4. **Mobile App**
   - React Native or Progressive Web App
   - View-only for now
   - Push notifications for milestones

### Long-Term (Months 4-6)

1. **Integrations**
   - Accounting systems (QuickBooks, Xero)
   - CRMs (Salesforce, HubSpot)
   - Data sources (Stripe, AWS billing)

2. **Advanced Financial Models**
   - Unit-level economics
   - Cohort analysis
   - Customer segmentation

3. **Team Collaboration**
   - Real-time co-editing
   - Slack/Discord integration
   - Approval workflows

4. **White Label**
   - Allow VCs to offer to portfolio companies
   - Custom branding
   - Multi-company management

---

## 💰 Monetization Strategy

### Pricing Tiers

1. **Starter: $29/month**
   - 1 company
   - 3 scenarios
   - 36-month projections
   - Excel & CSV exports
   - AI assistant (basic)

2. **Growth: $99/month** (Most Popular)
   - Unlimited companies
   - Unlimited scenarios
   - 60-month projections
   - All export formats
   - Advanced AI insights
   - Team collaboration (5 seats)

3. **Enterprise: Custom**
   - Unlimited everything
   - Custom integrations
   - Dedicated support
   - White label option
   - SSO/SAML

### Revenue Projections (Year 1)

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Customers | 10 | 40 | 150 |
| MRR | $600 | $3,200 | $10,500 |
| ARR | $7,200 | $38,400 | $126,000 |
| Churn | 8% | 6% | 5% |

**Path to $1M valuation:**
- $126K ARR at 10x multiple = $1.26M
- Achievable in 12-18 months with proper GTM

---

## 📚 Technical Documentation

### Adding a New API Route

1. Create file in `app/api/[resource]/route.ts`
2. Import auth helpers: `import { getServerSession } from "next-auth"`
3. Check workspace access: `await checkWorkspaceAccess(userId, workspaceId)`
4. Validate input with Zod schema
5. Perform database operation
6. Log audit event if significant action
7. Return JSON response

### Adding a New Page

1. Create file in `app/(app)/[route]/page.tsx`
2. Use Server Component for data fetching
3. Import UI components from `@/components/ui`
4. Use layout from `app/(app)/layout.tsx`
5. Implement loading.tsx for loading state

### Modifying Financial Engine

1. Edit `lib/financeEngine/calculations.ts`
2. Keep functions pure (no side effects)
3. Add unit tests
4. Update TypeScript types if needed
5. Document in code comments

---

## 🎉 Conclusion

This MVP represents a **production-ready foundation** for a financial modeling SaaS that can realistically achieve a $1M valuation with paying customers.

**Key Strengths:**
- ✅ Solid technical architecture (Next.js 14, Prisma, TypeScript)
- ✅ Clean separation of concerns (domain logic vs. framework)
- ✅ Multi-tenant from day one
- ✅ Core financial engine is complete and testable
- ✅ API-first design enables future mobile/integrations
- ✅ Professional UI with shadcn/ui
- ✅ Clear path to monetization

**Next Steps:**
1. Complete onboarding wizard
2. Integrate real charts (Recharts)
3. Build scenario comparison UI
4. Deploy to production (Vercel + PostgreSQL)
5. Launch beta with 10 pilot customers
6. Iterate based on feedback
7. Scale to first $10K MRR

**Good luck building FinModeler! 🚀**