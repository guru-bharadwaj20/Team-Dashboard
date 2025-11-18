# Team Decision Board - Architecture Overview

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Landing Page (/)                         │
│                   Public - No Authentication                    │
│            [Login Button] [Register Button]                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
          ┌─────────▼──────┐  ┌─▼──────────────┐
          │   Login (/login)│  │Register(/register)
          │  - Email Input  │  │ - Name Input
          │ - Password      │  │ - Email Input
          │ - Validation    │  │ - Password
          └────────┬────────┘  │ - Confirm Pass
                   │           │ - Validation
                   └─────┬─────┘
                         │
                  [JWT Token Saved]
                         │
          ┌──────────────▼──────────────┐
          │    Dashboard (/dashboard)    │
          │    [Private Route]           │
          │ • Teams Grid                │
          │ • Create Team Modal         │
          │ • TeamCard Component        │
          └──────────────┬──────────────┘
                         │
                  [Click Team Card]
                         │
          ┌──────────────▼──────────────┐
          │    TeamBoard (/team/:id)    │
          │    [Private Route]          │
          │ • Team Name                 │
          │ • Proposals List            │
          │ • Create Proposal Modal     │
          │ • ProposalCard Component   │
          └──────────────┬──────────────┘
                         │
                  [Click Proposal]
                         │
        ┌────────────────▼─────────────────┐
        │ ProposalDetails (/proposal/:id)  │
        │         [Private Route]          │
        │ • Title & Description            │
        │ • Voting Section                 │
        │ • Results with Progress Bars    │
        │ • Comments Section              │
        └────────────────┬─────────────────┘
                         │
                    [Get Share Link]
                         │
        ┌────────────────▼─────────────────┐
        │  PublicBoard (/board/:shareId)   │
        │       [Public Route]             │
        │ • Title & Description            │
        │ • Results (Read-only)            │
        │ • Vote Distribution              │
        │ • No Authentication Required     │
        └─────────────────────────────────┘

          [Profile] (/profile) [Private]
          [Notifications] (/notifications) [Private]
          [Error Page] (/error) [Public]
```

## Component Hierarchy

```
App (BrowserRouter)
├── Navbar (Global)
│   ├── Brand Link
│   ├── Navigation Links
│   └── Auth Buttons
│
├── ProtectedRoute (Wrapper)
│   └── Private Pages
│
├── Public Pages
│   ├── LandingPage
│   ├── Login
│   ├── Register
│   └── PublicBoard
│
├── Private Pages
│   ├── Dashboard
│   │   ├── TeamCard (Reusable)
│   │   └── CreateTeamModal
│   │
│   ├── TeamBoard
│   │   ├── ProposalCard (Reusable)
│   │   └── CreateProposalModal
│   │
│   ├── ProposalDetails
│   │   ├── VoteOptions
│   │   ├── ResultsBar
│   │   └── CommentsList
│   │
│   ├── Profile
│   ├── Notifications
│   └── ErrorPage
│
└── Utilities
    ├── Loader
    └── Modal (Base)
```

## Data Flow

```
┌────────────────────┐
│  Local Storage     │
│  - authToken       │
│  - currentUser     │
└────────┬───────────┘
         │
         ▼
┌──────────────────────┐
│  React State         │
│  (useState hooks)    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  API Layer (api.js)                  │
│  • axios instance                    │
│  • interceptors                      │
│  • endpoint functions                │
└────────┬───────────────────────────┬─┘
         │                           │
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│ Backend API      │        │ Mock Data        │
│ (Future)         │        │ (constants.js)   │
└──────────────────┘        └──────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │ UI Components    │
           │ (Re-renders)     │
           └──────────────────┘
```

## State Management Pattern

```
Page Component (e.g., Dashboard)
│
├── useState(data) - Stores fetched data
├── useState(loading) - Loading state
├── useState(error) - Error messages
└── useState(isModalOpen) - UI state

│
├── useEffect - Fetch data on mount
│
├── Event Handler - User interactions
│   │
│   ├── Validation
│   ├── API Call (via api.js)
│   └── Update local state
│
└── Render - Display UI based on state
```

## Authentication Flow

```
User Registration/Login
        │
        ▼
Form Validation
        │
        ├─ Email valid?
        ├─ Password >= 6 chars?
        └─ Passwords match? (Register only)
        │
        ▼
Mock Authentication (or API call)
        │
        ▼
JWT Token Generated
        │
        ▼
Save to localStorage:
  - authToken
  - currentUser (name, email)
        │
        ▼
Redirect to Dashboard
        │
        ▼
ProtectedRoute checks token on each private route:
  - Token exists? ✓ Allow access
  - Token missing? ✗ Redirect to login
```

## File Size Estimation

```
Components: ~20 KB
  - 12 component files
  - Navbar, Cards, Modals, ProtectedRoute, Loader

Pages: ~50 KB
  - 20 page files + CSS
  - Landing, Auth, Dashboard, Board, Details, Profile, Notifications

Utilities: ~15 KB
  - api.js: 3 KB (API endpoints)
  - constants.js: 5 KB (mock data)
  - helpers.js: 7 KB (utility functions)

CSS: ~30 KB
  - 17 CSS files
  - Global + component styles
  - Responsive design

Total (uncompressed): ~115 KB
Total (gzipped): ~35-40 KB
```

## Color Scheme Visualization

```
Primary Actions:        Light Blue (#3b82f6)
├── Buttons
├── Links
├── Active States
└── Hover Effects

Success Feedback:       Green (#86efac)
├── Yes votes
├── Success messages
└── Positive indicators

Error Feedback:         Red (#fca5a5)
├── No votes
├── Error messages
└── Destructive actions

Warning Feedback:       Yellow (#fbbf24)
├── Abstain votes
├── Warning messages
└── Pending states

Backgrounds:            White (#ffffff)
├── Cards
├── Modals
└── Overlays

Accents:                Light Gray (#f3f4f6)
├── Page background
├── Section separators
└── Disabled states

Text:
├── Primary: Black (#111827)
├── Secondary: Dark Gray (#4b5563)
└── Tertiary: Medium Gray (#6b7280)
```

## Responsive Breakpoints

```
Mobile (<640px)
├── Single column layout
├── Stack all elements
├── Touch-friendly buttons
└── Simplified navigation

Tablet (640px - 768px)
├── Two column layout
├── Grid adjusts
└── Standard sizing

Desktop (>768px)
├── Multi-column layout
├── Full grid layout
├── Optimized spacing
└── Hover effects enabled
```

## API Endpoint Structure

```
/api/auth
├── POST /login
├── POST /register
└── POST /logout

/api/teams
├── GET / (all teams)
├── GET /:id (single team)
├── POST / (create)
├── PUT /:id (update)
└── DELETE /:id (delete)

/api/proposals
├── GET /team/:teamId (by team)
├── GET /:id (single)
├── POST /team/:teamId (create)
├── PUT /:id (update)
└── DELETE /:id (delete)

/api/votes
├── POST /:proposalId (cast vote)
└── GET /:proposalId/results (get results)

/api/comments
├── GET /:proposalId (get comments)
├── POST /:proposalId (create)
└── DELETE /:id (delete)

/api/user
├── GET /profile
├── PUT /profile (update)
├── GET /notifications
└── POST /logout

/api/public
└── GET /board/:shareId (public results)
```

## Event Flow Example: Voting

```
User clicks Vote Button
        │
        ▼
handleVote(option) called
        │
        ├── Set userVote state
        ├── Update proposal votes locally
        │
        ├── Try: Call API
        │   └── votes.vote(proposalId, option)
        │
        ├── Catch: Show error
        │
        └── Finally: Show success message
                    (auto-dismiss after 3s)
                    │
                    ▼
            UI Updates:
            ├── Vote button shows selected
            ├── Results bar updates
            ├── Vote count increments
            └── Success message appears
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable component structure
- ✅ Easy navigation flow
- ✅ Responsive design
- ✅ Ready for backend integration
- ✅ Mock data for immediate testing
