# Plan: Server-Side Scoring Engine + Admin Dashboard

## Summary

  Move all scoring logic from Typeform pre-calculated variables to a server-side engine. Build an admin dashboard at `/admin` where admins can manage scoring rules, content, and view submissions. The scoring engine will be source-agnostic (works
  with Typeform now, custom forms later).

---

## Phase 1: Database Schema & Types

### 1.1 New Prisma Models (`prisma/schema.prisma`)

  **ScoringConfig** - Single-row config table with JSON fields:

- `riskQuestions` - 10 risk questions with type (binary/likert), reversed flag, point mappings
- `rewardQuestions` - 10 reward questions, same structure
- `fourTypesQuestions` - 10 type-voting questions with option-to-animal mappings + letter order
- `tieBreakerConfig` - Tie-breaker question mapping
- `riskThresholds` / `rewardThresholds` - Level cutoff values
- `version`, `updatedAt` fields

  **Content tables** (each with key, title, description, updatedAt):

- `AnimalTypeContent` - 4 animals (traits as string array)
- `RiskLevelContent` - 3 risk levels
- `RewardLevelContent` - 3 reward levels
- `DriverContent` - 7 drivers (questions as string array)
- `AOIContent` - 11 areas of interest (businesses as string array)
- `StrategyContent` - 4 strategies (actions as string array)

  **Extend existing Report model:**

- Add `scoringMethod String @default("typeform")` - tracks which engine scored it
- Add `rawAnswers Json?` - stores raw survey answers for potential re-scoring

### 1.2 TypeScript Types (`src/types/scoring.ts`)

  Define interfaces for all scoring config structures (RiskRewardQuestion, FourTypesQuestion, ThresholdConfig, etc.) used by both the scoring engine and admin API.

### 1.3 Seed Script (`prisma/seed.ts`)

  Extract all hardcoded values from `assessment-processor.ts` and CSV into a seed script that populates ScoringConfig + all content tables.

---

## Phase 2: Server-Side Scoring Engine

### 2.1 Core Engine (`src/lib/scoring-engine.ts`)

  Pure functions with no DB dependency (takes config as parameters):

- `calculateRiskScore(answers, questions)` → number (10-50 range)
- Handles binary (A=1/B=5) and likert (1-5) questions
- Handles reverse scoring (flip point values)
- `calculateRewardScore(answers, questions)` → number (10-50 range)
- `determineAnimalType(answers, questions, tieBreaker)` → AnimalType
- Count votes across 10 questions using option-to-animal mapping
- Tie-break: check tie-breaker answer; if not in tied set, move UP to closest tied animal
- `classifyLevel(score, thresholds)` → "Low" | "Medium" | "High"

### 2.2 Answer Parser (`src/lib/answer-parser.ts`)

  Source-agnostic answer normalization:

- `parseTypeformAnswers(webhookPayload)` → `Map<string, string | number>` keyed by question ref
- Future: `parseCustomFormAnswers(formData)` → same Map format

### 2.3 Config Loader (`src/lib/scoring-config-loader.ts`)

- `getScoringConfig()` - loads from DB with in-memory cache (5 min TTL)
- `getContentConfig()` - loads all content tables, cached
- `invalidateCache()` - called after admin saves

### 2.4 Updated Webhook (`src/app/api/webhook/typeform/route.ts`)

  Dual-path approach:

1. Always parse and store `rawAnswers` from webhook
2. If ScoringConfig exists in DB → use server scoring
3. Otherwise → fall back to existing `processTypeformData()` (unchanged)
4. Set `scoringMethod` field accordingly

---

## Phase 3: Admin Dashboard

### 3.1 Authentication

- **Env-based**: `ADMIN_SECRET` in `.env`
- Login page at `/admin/login` - single password field
- Sets HTTP-only cookie with signed token (using `jose` library)
- Middleware at `src/middleware.ts` protects all `/admin/*` except `/admin/login`

### 3.2 Admin Layout (`src/app/admin/layout.tsx`)

- Sidebar navigation: Dashboard, Scoring Rules, Content, Reports, Score Tester
- Responsive (collapsible on mobile)
- Tailwind-only styling, no UI library

### 3.3 Admin Pages

  **Dashboard (`/admin`)**

- Total reports count
- Reports by animal type (simple bar/stat cards)
- Recent 10 submissions table
- Quick links to other sections

  **Scoring Rules (`/admin/scoring`)**  Tabbed interface:

- **Risk Questions tab**: Table of 10 questions - edit type, reversed flag, point values
- **Reward Questions tab**: Same as risk
- **Four-Types tab**: Table of 10 questions - edit option-to-animal dropdown mappings + tie-breaker config
- **Thresholds tab**: Number inputs for risk/reward level cutoffs (low max, medium max)

  **Content Management (`/admin/content`)**  Tabbed interface:

- **Animals tab**: 4 cards - edit title, description, traits list
- **Risk/Reward Levels tab**: 6 cards - edit category label, description
- **Drivers tab**: 7 cards - edit title, description, questions list
- **AOIs tab**: 11 cards - edit title, description, business suggestions list
- **Strategies tab**: 4 cards - edit title, description, action items list

  **Reports (`/admin/reports`)**

- Paginated table: Email, Animal Type, Risk/Reward Levels, Driver, Strategy, Scoring Method, Date
- Search by email
- Filter by animal type, scoring method
- Click row to view full report details

  **Score Tester (`/admin/score-tester`)**

- Form with all survey questions (grouped by Risk, Reward, Four-Types)
- "Calculate" button runs the scoring engine client-side or via API
- Shows resulting: risk score, reward score, risk/reward levels, animal type, vote breakdown
- Useful for verifying scoring rules after changes

### 3.4 Admin API Routes (`src/app/api/admin/`)

```
  POST /api/admin/login                                                                                                                                                                                                                                 
  POST /api/admin/logout                                                                                                                                                                                                                                
  GET  /api/admin/scoring          → full ScoringConfig                                                                                                                                                                                                 
  PUT  /api/admin/scoring          → update any section                                                                                                                                                                                                 
  GET  /api/admin/content/[type]   → content by type (animals, drivers, etc.)                                                                                                                                                                           
  PUT  /api/admin/content/[type]   → update content                                                                                                                                                                                                     
  GET  /api/admin/reports          → paginated list with filters                                                                                                                                                                                        
  GET  /api/admin/reports/stats    → dashboard stats                                                                                                                                                                                                    
  POST /api/admin/score-tester     → run scoring engine on test inputs                                                                                                                                                                                  
```

### 3.5 Shared Components (`src/components/admin/`)

- `AdminSidebar.tsx` - Navigation
- `DataTable.tsx` - Sortable, paginated table
- `EditableCard.tsx` - View/edit toggle with save/cancel
- `TabGroup.tsx` - Tab navigation
- `ListEditor.tsx` - Add/remove/reorder string arrays
- `Toast.tsx` - Success/error notifications

---

## Phase 4: Integration & Migration

### Migration Path

1. Deploy schema changes + seed → no behavior change
2. Deploy scoring engine + updated webhook → new submissions get server-scored, old flow still works as fallback
3. Deploy admin dashboard → admin can view/tweak everything
4. Once verified, remove Typeform-side score calculations → server handles everything

### Changes are future-only

  Editing scoring rules or content only affects new submissions. Existing reports retain their original scores and content (baked in at save time).

---

## New Dependencies

- `jose` - JWT signing/verification (Edge-compatible)
- `bcryptjs` - Not needed (env-based auth, no password hashing)

---

## Files to Create/Modify

### Modified Files

- `prisma/schema.prisma` - Add new models + extend Report
- `src/app/api/webhook/typeform/route.ts` - Add server scoring path
- `src/middleware.ts` - Add admin auth check (create if not exists)

### New Files

```
  prisma/seed.ts                                                                                                                                                                                                                                        
  src/types/scoring.ts                                                                                                                                                                                                                                  
  src/lib/scoring-engine.ts                                                                                                                                                                                                                             
  src/lib/answer-parser.ts                                                                                                                                                                                                                              
  src/lib/scoring-config-loader.ts                                                                                                                                                                                                                      
  src/lib/admin-auth.ts                                                                                                                                                                                                                                 
  src/app/admin/layout.tsx                                                                                                                                                                                                                              
  src/app/admin/page.tsx                                                                                                                                                                                                                                
  src/app/admin/login/page.tsx                                                                                                                                                                                                                          
  src/app/admin/scoring/page.tsx                                                                                                                                                                                                                        
  src/app/admin/content/page.tsx                                                                                                                                                                                                                        
  src/app/admin/reports/page.tsx                                                                                                                                                                                                                        
  src/app/admin/score-tester/page.tsx                                                                                                                                                                                                                   
  src/app/api/admin/login/route.ts                                                                                                                                                                                                                      
  src/app/api/admin/logout/route.ts                                                                                                                                                                                                                     
  src/app/api/admin/scoring/route.ts                                                                                                                                                                                                                    
  src/app/api/admin/content/[type]/route.ts                                                                                                                                                                                                             
  src/app/api/admin/reports/route.ts                                                                                                                                                                                                                    
  src/app/api/admin/reports/stats/route.ts                                                                                                                                                                                                              
  src/app/api/admin/score-tester/route.ts                                                                                                                                                                                                               
  src/components/admin/AdminSidebar.tsx                                                                                                                                                                                                                 
  src/components/admin/DataTable.tsx                                                                                                                                                                                                                    
  src/components/admin/EditableCard.tsx                                                                                                                                                                                                                 
  src/components/admin/TabGroup.tsx                                                                                                                                                                                                                     
  src/components/admin/ListEditor.tsx                                                                                                                                                                                                                   
  src/components/admin/Toast.tsx                                                                                                                                                                                                                        
```

---

## Implementation Order

1. **Schema + Types** - Prisma models, TypeScript interfaces, seed script
2. **Scoring Engine** - Pure scoring functions + answer parser + config loader
3. **Admin Auth** - Middleware, login page, env-based auth
4. **Admin Layout + Dashboard** - Shell layout, sidebar, dashboard stats page
5. **Scoring Rules Editor** - Tabbed scoring config editor + API routes
6. **Content Editor** - Tabbed content management + API routes
7. **Reports Viewer** - Paginated reports list + detail view
8. **Score Tester** - Simulator page for testing scoring rules
9. **Webhook Integration** - Update webhook to use server scoring engine

## Verification

- Run `npx prisma migrate dev` to verify schema
- Run `npx prisma db seed` to verify seed populates correctly
- Run `npm run build` to verify no TypeScript errors
- Test webhook with sample Typeform payload → verify server scoring matches expected results from CSV
- Test admin login with `ADMIN_SECRET` env var
- Test each admin page: view/edit scoring rules, content, reports
- Test score tester with known answer sets from the CSV scoring guide
- Verify existing report viewing (`/report?email=...`) still works unchanged

  If you need specific details from before exiting plan mode (like exact code snippets, error messages, or content you generated), read the full transcript at:
  C:\Users\usamar\.claude\projects\C--Users-usamar-Documents-Github-praxiainsights\9af9bb33-075f-4b3f-88dd-45e967d24881.jsonl
