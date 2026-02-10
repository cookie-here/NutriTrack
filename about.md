# NutriTrack Project Overview (Detailed)

NutriTrack is a full-stack web and mobile-friendly app that helps users manage pregnancy and baby care. It provides secure authentication, baby profiles, growth tracking, guidance content, reminders, and vaccines. The system is split into a backend REST API (Node.js + Express + Sequelize) and a frontend app (React + Vite), connected via JSON over HTTP with JWT-based authentication.

## Purpose and Scope
- Support new and expecting parents with baby profile management and weekly growth tracking.
- Provide structured guidance content (nutrition, feeding, vaccines).
- Keep data secure with password hashing and token-based access control.

## Tech Stack
- Frontend: React, Vite, React Router, custom hooks, context state.
- Backend: Node.js, Express, Sequelize ORM.
- Database: SQLite by default; MySQL supported through `DATABASE_URL`.
- Auth: bcrypt password hashing + JWT access tokens.

## Architecture Overview
The frontend renders UI and calls backend endpoints through a centralized API client. The backend exposes REST endpoints, validates auth tokens, and uses Sequelize models to read/write the database. Static datasets (vaccines and feeding guides) are seeded on startup.

## Visual Representation
```mermaid
flowchart LR
  UI[Frontend React App] -->|REST JSON| API[Express API]
  API -->|Sequelize| DB[(SQLite/MySQL)]
  API --> Seeds[Static Seeds: Vaccines/Feeding]
  UI --> Local[LocalStorage: auth_token, userType, selectedBabyId]
```

## Backend (How It Works)
### Database Connection and Sync
- DB connection is created on server startup.
- Sequelize authenticates and syncs models with `alter: true` to keep tables updated.
- SQLite foreign keys are temporarily disabled during sync, then re-enabled.

### Models and Relationships
- `User` stores account data and auth fields.
- `Baby` stores baby profile data and belongs to a user.
- `GrowthRecord` stores measurement data and links to both user and baby.
- Relationships: User has many Babies; Baby has many GrowthRecords; GrowthRecord belongs to User and Baby.

### Controllers and Routes
- Controllers implement business logic (create, read, update, delete).
- Routes map endpoints to controllers and apply auth middleware.
- Example groups: `/api/auth`, `/api/babies`, `/api/growth`, `/api/reminders`, `/api/vaccines`, `/api/static`, `/api/profile`.

### Backend Route Map (API)
All API routes are mounted under the `/api` prefix in [backend/src/server.js](backend/src/server.js).

Auth
- `POST /api/auth/register` create user
- `POST /api/auth/login` login and return JWT
- `GET /api/auth/me` current user (auth required)

Babies
- `GET /api/babies` list active babies
- `POST /api/babies` create baby
- `GET /api/babies/:babyId` get baby + growth records
- `PUT /api/babies/:babyId` update baby
- `DELETE /api/babies/:babyId` soft delete baby
- `GET /api/babies/:babyId/growth` growth records for baby

Growth
- `GET /api/growth/records` list growth records (auth required)
- `POST /api/growth/records` create growth record
- `GET /api/growth/records/:recordId` get record
- `PUT /api/growth/records/:recordId` update record
- `DELETE /api/growth/records/:recordId` delete record

Reminders
- `GET /api/reminders` list reminders
- `POST /api/reminders` create reminder
- `PATCH /api/reminders/:reminderId/complete` mark complete
- `DELETE /api/reminders/:reminderId` delete reminder

Vaccines
- `GET /api/vaccines` list vaccines
- `GET /api/vaccines/mother` list vaccines for pregnant users
- `GET /api/vaccines/:vaccineId` get vaccine by id
- `GET /api/vaccines/reminders/user` list user vaccine reminders
- `POST /api/vaccines/reminders` create vaccine reminder
- `POST /api/vaccines/reminders/cleanup` cleanup duplicates
- `PATCH /api/vaccines/reminders/:reminderId/status` update reminder status
- `DELETE /api/vaccines/reminders/:reminderId` delete reminder

Static Content
- `GET /api/static/daily-tip`
- `GET /api/static/nutrition-tips`
- `GET /api/static/feeding-guide`
- `GET /api/static/safe-foods`
- `GET /api/static/vaccine-schedule`

Profile
- `GET /api/profile` get user profile
- `PUT /api/profile` update profile
- `POST /api/profile/emergency-contact` save contact
- `GET /api/profile/emergency-contact` get contact
- `DELETE /api/profile/emergency-contact` delete contact
- `POST /api/profile/partner-invite` send invite
- `GET /api/profile/partner-invitations` list invites
- `PATCH /api/profile/partner-invitations/:invitationId/accept` accept invite
- `PATCH /api/profile/partner-invitations/:invitationId/decline` decline invite

Feeding
- `GET /api/feedings` list feeding guide entries (by age filter)
- `GET /api/feedings/:feedingId` get feeding entry

### Authentication and Security
- Password strength is validated server-side before account creation.
- Passwords are hashed with bcrypt and stored as `hashed_password`.
- Login verifies password and issues a JWT access token.
- Auth middleware validates `Authorization: Bearer <token>` and attaches `req.user`.

## Frontend (How It Works)
### Routing and Pages
- Login and Signup handle authentication flows.
- Growth page handles baby list, growth records, charts, and milestones.
- Add Baby is a dedicated page for creating new baby profiles.

### Frontend Route Map (UI)
Routes are defined in [FrontEnd/src/App.jsx](FrontEnd/src/App.jsx).

Public and onboarding
- `/onboarding` first-time onboarding
- `/welcome` stage selection
- `/login` sign in
- `/signup` create account

New parent flow
- `/home` dashboard
- `/add-baby` add baby form
- `/nutrition` nutrition tips
- `/vaccines` vaccines info
- `/feeding` feeding guides
- `/growth` growth tracking
- `/profile` user profile

Pregnant flow
- `/pregnant/home` pregnant dashboard
- `/pregnant/nutrition` nutrition tips for pregnancy
- `/pregnant/vaccines` vaccines and health for pregnancy

Redirects
- `/` and any unknown path redirect to `/onboarding`

### UI Structure (Frontend)
Root composition
- [FrontEnd/src/main.jsx](FrontEnd/src/main.jsx) wraps the app with `ThemeProvider` and renders `App`.
- [FrontEnd/src/App.jsx](FrontEnd/src/App.jsx) wraps routes in `BabyProvider` and `Router`.

Page-level composition (high level)
- Login: Auth header/footer + reusable inputs + submit button.
- Signup: Auth header/footer + inputs + password strength + user type selector + date input.
- Growth: header + tabs + baby list cards + baby form + growth input + charts + records table.
- Add Baby: page shell + BabyForm.
- Home/Pregnant Home: dashboard pages with navigation and content sections.
- Nutrition/Vaccines/Feeding: content pages consuming static API data.
- Profile: user profile and emergency contact management.

Key reusable UI components
- Auth: `AuthHeader`, `AuthFooter`, `FormInput`, `ErrorMessage`, `SubmitButton`.
- Baby/Growth: `BabyCard`, `BabyForm`, `GrowthInput`, `GrowthHeader`, `MilestoneCard`.
- Navigation: `BottomNavigation` on main flows.

### State Management
- `BabyContext` loads babies on app start (if token exists).
- The currently selected baby is saved to `localStorage`.
- Local UI state is managed with React hooks (`useState`, `useEffect`).

### API Client Layer
- `api.js` wraps `fetch` with:
  - Base URL config
  - Automatic JWT header injection
  - Error handling and response parsing
- All frontend pages call this API layer instead of `fetch` directly.

## Key Data Flows
### Sign Up Flow
1. User fills the Signup form (client validation).
2. Frontend sends `/api/auth/register`.
3. Backend validates password strength, checks email uniqueness, hashes password, creates user.
4. Frontend navigates to Login on success.

### Login Flow
1. User enters credentials on Login page.
2. Frontend calls `/api/auth/login`.
3. Backend verifies credentials and returns a JWT.
4. Frontend stores token and fetches current user profile.

### Baby Create/Update/Delete Flow
1. Baby form validates name and date of birth.
2. Frontend calls `/api/babies` (POST/PUT/DELETE).
3. Backend creates or updates the Baby model.
4. Frontend updates context state and refreshes UI.

### Growth Record Flow
1. Growth input validates weight and height.
2. Frontend calls `/api/growth/records` (POST/GET/DELETE).
3. Backend writes GrowthRecord and returns updated data.
4. Growth page updates charts and tables.

## Visual Workflow (User Journey)
```mermaid
flowchart LR
  classDef entry fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px,color:#1b5e20
  classDef auth fill:#e3f2fd,stroke:#1565c0,stroke-width:1px,color:#0d47a1
  classDef decision fill:#fff8e1,stroke:#f57f17,stroke-width:1px,color:#6d4c41
  classDef parent fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1px,color:#4a148c
  classDef preg fill:#fff3e0,stroke:#ef6c00,stroke-width:1px,color:#e65100
  classDef shared fill:#eceff1,stroke:#546e7a,stroke-width:1px,color:#263238

  Start([Open App]):::entry --> Onboarding[Onboarding]:::entry --> Stage[Stage Select]:::entry

  Stage -->|New user| Signup[Signup]:::auth --> Login[Login]:::auth
  Stage -->|Has account| Login

  Login --> Auth{User Type?}:::decision

  subgraph Parent[New Parent Flow]
    direction TB
    ParentHome[Home]:::parent --> AddBaby[Add Baby]:::parent
    ParentHome --> Growth[Growth Tracking]:::parent
    ParentHome --> Nutrition[Nutrition]:::parent
    ParentHome --> Vaccines[Vaccines]:::parent
    ParentHome --> Feeding[Feeding]:::parent
    ParentHome --> Profile[Profile]:::shared
  end

  subgraph Preg[Pregnant Flow]
    direction TB
    PregHome[Pregnant Home]:::preg --> PregNutrition[Pregnant Nutrition]:::preg
    PregHome --> PregVaccines[Pregnant Vaccines]:::preg
    PregHome --> Profile
  end

  Auth -->|newParent| ParentHome
  Auth -->|pregnant| PregHome
```

## Visual Sequence Example (Login)
```mermaid
sequenceDiagram
  participant U as User
  participant UI as Frontend
  participant API as Backend
  participant DB as Database
  U->>UI: Enter email + password
  UI->>API: POST /api/auth/login
  API->>DB: Find user by email
  DB-->>API: User record
  API->>API: Verify bcrypt hash
  API-->>UI: JWT access token
  UI->>UI: Save token in localStorage
```

## Data Storage
- Default: SQLite file database for local/dev usage.
- Optional: MySQL via `DATABASE_URL`.
- Sequelize models define all tables and relationships.

## Why It Works End-to-End
- Frontend validates input and uses a single API client for network calls.
- Backend enforces auth, runs validations, and persists data via Sequelize.
- Context state and localStorage keep the UI consistent across sessions.

## Notes and Constraints
- JWT secret should be set securely in production.
- Email format validation is strict on the frontend; backend only checks uniqueness.
- Soft delete is used for babies (`is_active = false`).

---


