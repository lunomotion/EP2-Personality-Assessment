 Native Assessment Form — Complete Implementation Plan

 Overview

 Build a public-facing, Typeform-style assessment at /assessment and an admin form builder at /admin/form-builder. The native form reuses the existing scoring engine, question data, and report model. The Typeform webhook stays operational alongside
 it.

---

Question Types (from screenshots)
 ┌─────┬─────────────────┬───────────────────────────────────────────────┬─────────────────┬───────────────────────────────────────────────────────────────┐
 │  #  │  Display Type   │                  Source Data                  │  Auto-advance?  │                          Screenshot                           │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 1   │ image-choice    │ Binary risk/reward, Big 5                     │ Yes             │ personality_question_example.png                              │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 2   │ likert-boxes    │ Likert risk/reward (1-5 numbered rectangles)  │ Yes             │ numbered_options_question.png                                 │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 3   │ star-rating     │ Personality scales (1-5 stars)                │ Yes             │ star_based_options_for_likeliness.png                         │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 4   │ multiple-choice │ Four-types A/B/C/D                            │ Yes             │ —                                                             │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 5   │ table-choice    │ Tie-breaker (rich text + table + Row options) │ Yes             │ tie-breaker-question-example.png                              │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 6   │ matrix          │ Radio grid (rows × columns)                   │ Next btn        │ radio_based_table_type_answers.png                            │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 7   │ rank-order      │ Drag-to-reorder list                          │ Next btn        │ arrangement_order_question_example.png                        │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 8   │ email-input     │ Email collection                              │ Next btn        │ email_question.png                                            │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 9   │ name-input      │ First + Last name                             │ Next btn        │ first_name_last_name.png                                      │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 10  │ free-text       │ Open-ended textarea                           │ Next btn        │ last_free_text_question1.png                                  │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 11  │ multi-option    │ How-tools (4+ choices)                        │ Yes             │ —                                                             │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 12  │ Section intro   │ Section consent/intro screen                  │ "I'm Ready" btn │ for_each_seciton_we_will_start_with_this_consent_question.png │
 ├─────┼─────────────────┼───────────────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────────────────┤
 │ 13  │ Results screen  │ Rich text + "My Report" button                │ —               │ report_ending_screen.png                                      │
 └─────┴─────────────────┴───────────────────────────────────────────────┴─────────────────┴───────────────────────────────────────────────────────────────┘
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 Phase 1: Types + Prisma Schema

 Step 1.1 — Create src/types/form-config.ts

 export type FormDisplayType =
   | 'image-choice'     // binary with circular images per option
   | 'likert-boxes'     // numbered 1-5 rectangular buttons
   | 'star-rating'      // 1-5 star icons
   | 'multiple-choice'  // A/B/C/D text options
   | 'table-choice'     // rich text + table + row options (tie-breaker)
   | 'matrix'           // rows × columns radio grid
   | 'rank-order'       // drag-to-reorder
   | 'email-input'
   | 'name-input'
   | 'free-text'
   | 'multi-option';

 export interface FormQuestionConfig {
   questionRef: string;           // must match a ref in ScoringConfig or be a form-only ref
   displayType: FormDisplayType;
   description?: string;          // subtitle below question text
   questionImage?: string;        // image URL shown above question
   optionImages?: Record<string, string>; // key=option key, value=image URL
   matrixColumns?: string[];      // for matrix: column headers
   matrixRows?: string[];         // for matrix: row labels
   required?: boolean;
 }

 export interface FormSectionConfig {
   key: string;
   order: number;
   title: string;
   subtitle?: string;
   introText?: string;
   introButtonText: string;
   questions: FormQuestionConfig[];
 }

 export interface FormResultsConfig {
   headingHtml: string;
   bodyHtml: string;
   buttonText: string;
   buttonUrlTemplate: string;   // e.g. "/report?email={email}"
 }

 export interface FormConfigData {
   sections: FormSectionConfig[];
   resultsPage: FormResultsConfig;
   backgroundImage?: string;
   isLive: boolean;
 }

 Step 1.2 — Add FormConfig model to prisma/schema.prisma

 model FormConfig {
   id              String   @id @default("default")
   version         Int      @default(1)
   updatedAt       DateTime @updatedAt
   sections        Json     // FormSectionConfig[]
   resultsPage     Json     // FormResultsConfig
   backgroundImage String?
   isLive          Boolean  @default(false)
 }

 Step 1.3 — Run npx prisma generate && npx prisma db push

---

 Phase 2: Seed Data

 Step 2.1 — Add FormConfig seed to prisma/seed.ts

 Map existing question refs into sections:
 ┌─────────┬─────────────────────────┬──────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┬────────────────────────────────┐
 │ Section │           Key           │                        Title                         │                        Questions                        │          Display Type          │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 1       │ welcome                 │ Welcome                                              │ user_name (name-input), user_email (email-input)        │ name-input, email-input        │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 2       │ personality-risk-binary │ Let's have some fun! Tell me about your personality. │ risk_q1–risk_q5                                         │ image-choice                   │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 3       │ personality-risk-likert │ Let's have some fun!                                 │ risk_q6–risk_q10                                        │ likert-boxes                   │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 4       │ reward-binary           │ What drives your ambition?                           │ reward_q1–reward_q5                                     │ image-choice                   │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 5       │ reward-likert           │ Your reward style                                    │ reward_q6–reward_q10                                    │ likert-boxes                   │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 6       │ four-types              │ Your entrepreneurial type                            │ type_q1–type_q10 + tiebreaker                           │ multiple-choice + table-choice │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 7       │ big5                    │ Who are you?                                         │ big5_openness–big5_neuroticism                          │ image-choice                   │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 8       │ personality-games       │ How does your brain work?                            │ personality_games_rank + scale_creative–scale_obsessive │ rank-order + star-rating       │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 9       │ how-tools               │ Tell me about your future business                   │ how_product_type, how_sales_model, how_business_vision  │ matrix or multi-option         │
 ├─────────┼─────────────────────────┼──────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ 10      │ open-ended              │ You're almost finished.                              │ open_who_helps, open_impact_life                        │ free-text                      │
 └─────────┴─────────────────────────┴──────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┴────────────────────────────────┘
 Intro screen for each section uses the section title + description + "I'm Ready" or "Final Two Questions" button.

 Results page seed:
 resultsPage: {
   headingHtml: '`<p><em>`Say bye! Recall information with @`</em></p>`',
   bodyHtml: '`<p><em>`Learn more about your entrepreneur personality.`</em></p>`',
   buttonText: 'My Report',
   buttonUrlTemplate: '/report?email={email}',
 }

 user_name and user_email are form-only refs not present in ScoringConfig — they collect identity info and are extracted separately during submission (not fed to scoring engine).

---

 Phase 3: Backend — API Routes + Loaders

 Step 3.1 — Create src/lib/form-config-loader.ts

 Same caching pattern as scoring-config-loader.ts:

- getFormConfig(): Promise<FormConfigData | null> — 5-min in-memory cache
- invalidateFormConfigCache(): void

 Step 3.2 — Create src/app/api/assessment/config/route.ts (PUBLIC, no auth)

 GET — Returns hydrated form config:

1. Load FormConfig from DB (via loader)
2. Load ScoringConfig from DB (via existing loader)
3. For each FormQuestionConfig, look up the matching question from ScoringConfig by questionRef and merge in text, optionLabels, pointMap, options, etc.
4. Return array of hydrated sections where each question has both presentation config AND text/options
5. Form-only refs (user_name, user_email) return hardcoded text ("What is your email?", "What is your first and last name?")

 Response shape:
 interface HydratedFormQuestion {
   // From FormQuestionConfig
   questionRef: string;
   displayType: FormDisplayType;
   description?: string;
   questionImage?: string;
   optionImages?: Record<string, string>;
   matrixColumns?: string[];
   matrixRows?: string[];
   required?: boolean;
   // Merged from ScoringConfig
   text: string;
   optionLabels?: Record<string, string>;
   options?: Record<string, string>;
   // Source metadata
   source: 'risk' | 'reward' | 'fourTypes' | 'tieBreaker' | 'survey' | 'form-only';
 }

 Step 3.3 — Create src/app/api/assessment/submit/route.ts (PUBLIC, no auth)

 POST body: { answers: Record<string, string | number | string[]>, firstName: string, lastName: string, email: string }

 Logic:

1. Validate required fields (email, firstName, lastName)
2. Load ScoringConfig + content from DB
3. Strip form-only refs (user_name, user_email) from answers
4. Call parseCustomFormAnswers(answers) → Map<string, string | number>
5. Call runScoringEngine(answersMap, scoringConfig) → ScoringResult
6. Extract driverKey, aoi1Key, aoi2Key, strategyKey from answers (these will be dedicated selection questions or a new selection section — see Phase 2 notes)
7. Look up content (animal, risk, reward, driver, AOI, strategy) from DB — same logic as webhook/typeform/route.ts lines 54-100
8. Build ReportData object
9. Upsert to Report model (keyed on email)
10. Return { success: true, reportUrl: '/report?email=`<email>`' }

 Step 3.4 — Create src/app/api/admin/form-config/route.ts (ADMIN, auth required)

- GET — Returns current FormConfig row
- PUT — Partial update of FormConfig fields. Increments version. Calls invalidateFormConfigCache().

 Step 3.5 — Update src/lib/answer-parser.ts

 Flesh out parseCustomFormAnswers():

- Handle string[] values (rank-order) by joining with , or storing as-is
- Handle matrix answers (stored as { "row1": "col2", "row2": "col1" } → flatten to individual refs)

 Step 3.6 — Update src/app/api/admin/images/upload/route.ts

 Add 'form' and 'form-backgrounds' to allowed categories so form question images and background images can be uploaded through the existing pipeline.

---

 Phase 4: Public Assessment Form UI

 File Structure

 src/app/assessment/
   page.tsx                          — Server component, Suspense wrapper
   AssessmentForm.tsx                — Main client component (state machine)
   components/
     SectionIntro.tsx                — Full-screen section intro + CTA button
     ProgressBar.tsx                 — Top progress bar
     TopBar.tsx                      — Section number + title header
     NavigationButtons.tsx           — Back + Next buttons
     ResultsScreen.tsx               — Rich text + "My Report" button
     QuestionRenderer.tsx            — Switch on displayType → correct component
     questions/
       ImageChoice.tsx               — Binary with circular images
       LikertBoxes.tsx               — 1-5 numbered rectangular buttons
       StarRating.tsx                — 1-5 star icons
       MultipleChoice.tsx            — A/B/C/D text cards
       TableChoice.tsx               — Rich text + HTML table + row options
       MatrixGrid.tsx                — Radio table (rows × columns)
       RankOrder.tsx                 — Drag-and-drop reorder
       EmailInput.tsx                — Email field
       NameInput.tsx                 — First + Last name fields
       FreeText.tsx                  — Textarea
       MultiOption.tsx               — Multi-option selection

 Step 4.1 — AssessmentForm.tsx — State Machine

 interface FormState {
   currentStep: number;
   answers: Record<string, string | number | string[]>;
   userInfo: { firstName: string; lastName: string; email: string };
   isSubmitting: boolean;
   isComplete: boolean;
   error: string | null;
 }

 type StepItem =
   | { type: 'section-intro'; section: HydratedSection }
   | { type: 'question'; question: HydratedFormQuestion; sectionIndex: number; sectionTitle: string }
   | { type: 'results' };

 On mount: fetch /api/assessment/config, flatten sections into StepItem[] array.

 Navigation:

- goNext() — increment currentStep, if last question step → submit answers → show results
- goBack() — decrement currentStep (skip section intros on back? or show them?)
- Auto-advance questions call goNext() immediately after onAnswer
- Manual questions show "Next" button (enabled when answer is valid)

 Submission: on reaching end of questions, POST to /api/assessment/submit. On success, show results screen.

 Step 4.2 — Visual Design

- Full viewport: min-h-screen with background-image from config
- Semi-transparent dark overlay: bg-black/40 for readability
- Content area: centered, max-width ~650px, translucent card or no card (matching Typeform screenshots — text directly on background)
- Top bar: sticky, section number + arrow + title in white text, progress bar below
- Question text: large white bold text, description in lighter/italic text below
- Answer options: styled per question type (see below)
- Transitions: CSS opacity + transform fade/slide between steps
- Mobile: same layout, options stack vertically if needed

 Step 4.3 — Question Components (each follows same props interface)

 interface QuestionComponentProps {
   question: HydratedFormQuestion;
   currentAnswer: string | number | string[] | undefined;
   onAnswer: (value: string | number | string[]) => void;
 }

 ImageChoice — Two side-by-side boxes (~150px each). Each has:

- Circular image (from optionImages[key], falls back to placeholder)
- Letter badge (A/B) in small colored square
- Label text below image
- Selected state: highlighted border
- Click → onAnswer(key) (auto-advance)

 LikertBoxes — Row of 5 equal-width rectangular buttons labeled 1–5. Description above shows "1 = Not at all like me, 5 = Exactly like me". Click → auto-advance.

 StarRating — Row of 5 star SVG icons with number labels below. Empty stars fill on hover. Click → auto-advance.

 MultipleChoice — Vertical stack of 4 option cards. Each shows letter badge + text. Click → auto-advance.

 TableChoice — Render tie-breaker text with whitespace-pre-line. Render a styled HTML `<table>` with the hunting data (Hunting Group Size, Success Rate, Risk, Reward, Time to Materialize). Below table: 4 option buttons (Row #1–4). Click →
 auto-advance. The table data should be stored in the question config or hardcoded from the tie-breaker description.

 MatrixGrid — Table layout with row labels left, column headers top, radio buttons in cells. "Next" button enabled when all rows have a selection. Answer stored as Record<string, string> (row→column).

 RankOrder — Draggable cards using HTML5 drag-and-drop. Each card has a colored handle + number dropdown + label text. "Next" button always visible.

 EmailInput — Large underline-style text input (matching Typeform look). Placeholder "name@example.com". Email validation on blur. "Next" button.

 NameInput — Two underline-style inputs: "First name *" and "Last name *". "Next" enabled when both non-empty.

 FreeText — Large textarea with placeholder "Type your answer here...". "Next" button.

 MultiOption — Similar to MultipleChoice but for how-tools questions. 4 option cards. Auto-advance.

 Step 4.4 — SectionIntro.tsx

 Full-screen centered content:

- Section number + arrow + section title at top (in top bar)
- Bold intro text (e.g., "Don't think, just react.")
- Description text below in lighter italic
- CTA button (e.g., "I'm Ready") — black pill-shaped button with white text
- "press Enter ↵" hint text next to button

 Step 4.5 — ResultsScreen.tsx

- Renders resultsPage.headingHtml using dangerouslySetInnerHTML
- Renders resultsPage.bodyHtml using dangerouslySetInnerHTML
- Black pill button with resultsPage.buttonText, href = buttonUrlTemplate.replace('{email}', userEmail)

 Step 4.6 — ProgressBar.tsx

 Thin horizontal bar at very top of viewport:

- Width = (currentQuestionIndex / totalQuestions) * 100%
- Purple/pink gradient fill
- Smooth CSS transition on width

 Step 4.7 — TopBar.tsx

 Sticky bar below progress bar:

- Left: section number + "→" + section title (white text on transparent background)
- Font: bold for section number, regular weight for title
- Background: transparent or subtle dark overlay

 Step 4.8 — NavigationButtons.tsx

- Back arrow button (left side, bottom or floating)
- Next/Submit button (right side, for manual-advance questions)
- "press Enter ↵" hint
- Keyboard support: Enter = Next, arrow keys for navigation

 Step 4.9 — page.tsx

 export const metadata = { title: 'EP2 Assessment — Praxia Insights' };

 export default function AssessmentPage() {
   return (
     <Suspense fallback={`<AssessmentLoading />`}>
       `<AssessmentForm />`
     `</Suspense>`
   );
 }

 No admin layout — this is a standalone full-screen page (no sidebar, no header).

---

 Phase 5: Rich Text Editor

 Step 5.1 — Install tiptap

 npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-text-align @tiptap/pm

 Step 5.2 — Create src/components/admin/RichTextEditor.tsx

 Client component with:

- Props: { content: string; onChange: (html: string) => void; placeholder?: string }
- Toolbar: Bold, Italic, H1/H2/H3, Link, Align Left/Center/Right
- Uses @tiptap/starter-kit + link + text-align extensions
- Outputs HTML string
- Styled with Tailwind (toolbar buttons, editor area with border)

---

 Phase 6: Admin Form Builder

 Step 6.1 — Create src/app/admin/form-builder/page.tsx

 Client component using TabGroup with 5 tabs:

 Tab 1: Sections

- List of sections with up/down reorder buttons
- Each section expandable: edit title, subtitle, introText, introButtonText
- Show question count per section
- Add/remove section

 Tab 2: Questions

- Grouped by section
- For each question:
  - Question text (read-only, gray italic note: "Edit in Scoring Rules")
  - Display type dropdown (constrained by source type)
  - Description text input
  - Question image upload button
  - Per-option image upload buttons (for image-choice type only)
- Display type constraints:
  - binary risk/reward → image-choice
  - likert risk/reward → likert-boxes or star-rating
  - FourTypesQuestion → multiple-choice
  - TieBreakerConfig → table-choice
  - NonScoredQuestion binary → image-choice
  - NonScoredQuestion scale → star-rating or likert-boxes
  - NonScoredQuestion rank → rank-order
  - NonScoredQuestion open-ended → free-text
  - NonScoredQuestion multi-option → multi-option or matrix

 Tab 3: Background

- Current background image preview
- Upload button (uses existing image upload pipeline, category form-backgrounds)
- Remove/clear button

 Tab 4: Results Page

- RichTextEditor for heading
- RichTextEditor for body
- Text input for button text
- Text input for button URL template (with {email} placeholder note)
- Live preview panel

 Tab 5: Preview

- "Open Preview" button → opens /assessment?preview=true in new tab
- Or inline `<iframe>` showing the form

 Step 6.2 — Update src/components/admin/AdminSidebar.tsx

 Add nav item:
 { href: '/admin/form-builder', label: 'Form Builder', icon: /* clipboard SVG */ }

 Place between "Images" and "Reports" in the list.

---

 Phase 7: Driver/AOI/Strategy Selection

 The current Typeform flow uses Typeform's internal variables/logic to determine driver, AOI1, AOI2, and strategy. The native form needs dedicated selection questions for these.

 Option A (Recommended): Add a new section "Your Preferences" with 4 dropdown/selection questions:

- select_driver — "What drives you most?" → 7 options (Boss, Control, Passion, Money, Solve, Impact, Legacy)
- select_aoi1 — "Primary area of interest?" → 11 options
- select_aoi2 — "Secondary area of interest?" → 11 options
- select_strategy — "Preferred business strategy?" → 4 options

 These are form-only questions — stored in FormConfig, not ScoringConfig. The submit route reads them from the answers and maps directly to report fields.

 Option B: Auto-derive from other answers using Typeform's same logic (complex, fragile, would need reverse-engineering of Typeform's conditional logic).

 Going with Option A — explicit selection. These get their own section in the form.

---

 Files Summary

New Files (26 files)
 ┌────────────────────────────────────────────────────────────┬────────────────────────────────────┐
 │                            File                            │              Purpose               │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/types/form-config.ts                                   │ TypeScript interfaces              │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/lib/form-config-loader.ts                              │ Cached DB loader                   │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/api/assessment/config/route.ts                     │ Public GET: hydrated form config   │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/api/assessment/submit/route.ts                     │ Public POST: submit + score + save │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/api/admin/form-config/route.ts                     │ Admin GET/PUT                      │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/page.tsx                                │ Server component wrapper           │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/AssessmentForm.tsx                      │ Main form state machine            │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/SectionIntro.tsx             │ Section intro screen               │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/ProgressBar.tsx              │ Top progress bar                   │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/TopBar.tsx                   │ Section header                     │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/NavigationButtons.tsx        │ Back/Next                          │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/ResultsScreen.tsx            │ End screen                         │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/QuestionRenderer.tsx         │ displayType switch                 │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/ImageChoice.tsx    │ Binary + images                    │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/LikertBoxes.tsx    │ 1-5 boxes                          │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/StarRating.tsx     │ 1-5 stars                          │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/MultipleChoice.tsx │ A/B/C/D                            │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/TableChoice.tsx    │ Tie-breaker                        │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/MatrixGrid.tsx     │ Radio grid                         │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/RankOrder.tsx      │ Drag reorder                       │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/EmailInput.tsx     │ Email                              │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/NameInput.tsx      │ First/Last name                    │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/FreeText.tsx       │ Textarea                           │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/assessment/components/questions/MultiOption.tsx    │ Multi-option                       │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/components/admin/RichTextEditor.tsx                    │ Tiptap editor                      │
 ├────────────────────────────────────────────────────────────┼────────────────────────────────────┤
 │ src/app/admin/form-builder/page.tsx                        │ Admin form builder                 │
 └────────────────────────────────────────────────────────────┴────────────────────────────────────┘
 Modified Files (5 files)
 ┌──────────────────────────────────────────┬──────────────────────────────────────────────────────────┐
 │                   File                   │                          Change                          │
 ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
 │ prisma/schema.prisma                     │ Add FormConfig model                                     │
 ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
 │ prisma/seed.ts                           │ Add FormConfig seed data with all sections               │
 ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
 │ src/lib/answer-parser.ts                 │ Flesh out parseCustomFormAnswers(), handle arrays/matrix │
 ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
 │ src/components/admin/AdminSidebar.tsx    │ Add "Form Builder" nav item                              │
 ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
 │ src/app/api/admin/images/upload/route.ts │ Add form, form-backgrounds to allowed categories         │
 ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
 │ package.json                             │ Add tiptap dependencies                                  │
 └──────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 Execution Order

1. Phase 1 — Types + Schema → prisma generate + db push
2. Phase 2 — Seed data → npx tsx prisma/seed.ts
3. Phase 3 — Backend APIs (form-config-loader, 3 routes, answer-parser update, image upload update)
4. Phase 4 — Public form UI (all 23 component files)
5. Phase 5 — Rich text editor (install tiptap + create component)
6. Phase 6 — Admin form builder page + sidebar update
7. Phase 7 — Driver/AOI/Strategy selection questions in form config

---

 Verification

1. npx prisma generate + npx prisma db push succeeds
2. npx tsx prisma/seed.ts creates FormConfig row with all sections
3. GET /api/assessment/config returns hydrated sections with question text + options
4. /assessment loads, shows first section intro with background
5. Can navigate through all questions — auto-advance works for selection types
6. Back button returns to previous question
7. Progress bar updates correctly
8. Matrix and rank-order show "Next" button, enable when complete
9. Name + email fields validate before advancing
10. Submission creates Report with correct scores (compare with score-tester presets)
11. Results screen renders rich text + button linking to /report?email=...
12. Admin form builder: sections tab editable, questions tab shows all questions with display type selector
13. Admin: background image upload works and reflects on /assessment
14. Admin: results page rich text editor saves and renders on completion
15. Typeform webhook (POST /api/webhook/typeform) still creates reports as before
16. npm run build passes with no type errors
17. Mobile viewport (375px) renders form correctly
    ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
