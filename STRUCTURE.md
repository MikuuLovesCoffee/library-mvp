# Book Harbor - Complete Project Architecture & Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Technology Stack](#technology-stack)
5. [Data Flow & Connections](#data-flow--connections)
6. [Building from 0 to MVP](#building-from-0-to-mvp)
7. [Detailed Code Breakdown](#detailed-code-breakdown)

---

## 🎯 Project Overview

**Book Harbor** is a full-stack monorepo application for sharing and discovering digital content (books, manga, images, PDFs).

### Key Features:
- User authentication & profiles
- Content upload & management
- Rating & comments system
- Group/community creation
- Search & filtering
- Real-time interactions

### Why Monorepo Architecture?
- Single `node_modules` → Shared dependencies reduce disk space
- `shared/` folder → Reusable types/schemas between client & server
- One dev server → Express serves both API + frontend with Vite HMR
- No CORS issues → Client and API on same origin (http://localhost:5000)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                     │
│  React App (Vite) - http://localhost:5000               │
│  └─ Components, Pages, Hooks, Utilities                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP Requests/WebSocket
                       │ Same Origin (no CORS)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Node.js)                    │
│  http://127.0.0.1:5000                                  │
│  ┌──────────────────────────────────────────────┐       │
│  │ Routes Handler (/api/*)                      │       │
│  │ - Auth routes                                 │       │
│  │ - Content CRUD                                │       │
│  │ - User management                             │       │
│  │ - Comments, Ratings, Groups                   │       │
│  └──────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────┐       │
│  │ Middleware                                    │       │
│  │ - Session/Auth (passport + openid-client)    │       │
│  │ - File upload (multer)                        │       │
│  │ - Vite dev server (hot module reload)         │       │
│  └──────────────────────────────────────────────┘       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ SQL Queries
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│          DATABASE (PostgreSQL)                          │
│  localhost:5432/book_harbor                             │
│  ┌──────────────────────────────────────────────┐       │
│  │ Tables:                                       │       │
│  │ - users (id, email, firstName, lastName...)  │       │
│  │ - contents (id, title, fileUrl, price...)    │       │
│  │ - comments (id, userId, contentId, text...)  │       │
│  │ - ratings (id, userId, contentId, rating)    │       │
│  │ - groups (id, name, ownerId, privacy...)     │       │
│  │ - sessions (sid, sess, expire)               │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure & Purpose

```
Book-Harbor/
│
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── main.tsx                # Entry point - mounts React app
│   │   ├── App.tsx                 # Root component + routing
│   │   ├── index.css               # Global styles
│   │   │
│   │   ├── pages/                  # Page components (full routes)
│   │   │   ├── Home.tsx            # Landing page, content feed
│   │   │   ├── ContentDetail.tsx    # Single content view
│   │   │   ├── Upload.tsx          # File upload form
│   │   │   ├── Profile.tsx         # User profile
│   │   │   ├── Groups.tsx          # Groups listing
│   │   │   ├── GroupDetail.tsx     # Single group view
│   │   │   ├── Landing.tsx         # Welcome/marketing page
│   │   │   └── not-found.tsx       # 404 page
│   │   │
│   │   ├── components/             # Reusable components
│   │   │   ├── Hero3D.tsx          # 3D hero section
│   │   │   ├── ContentCard.tsx     # Content preview card
│   │   │   ├── ContentFilters.tsx  # Search/filter controls
│   │   │   ├── CommentSection.tsx  # Comments + replies
│   │   │   ├── StarRating.tsx      # Rating component
│   │   │   ├── UploadForm.tsx      # File upload form
│   │   │   ├── AppSidebar.tsx      # Navigation sidebar
│   │   │   ├── ThemeToggle.tsx     # Dark/light mode
│   │   │   ├── ThemeProvider.tsx   # Theme context provider
│   │   │   ├── GroupCard.tsx       # Group preview card
│   │   │   │
│   │   │   └── ui/                 # shadcn/ui components (auto-generated)
│   │   │       ├── button.tsx, card.tsx, input.tsx
│   │   │       ├── dialog.tsx, select.tsx, etc.
│   │   │       └── (50+ UI components)
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts          # Auth state management
│   │   │   ├── use-toast.ts        # Toast notifications
│   │   │   └── use-mobile.tsx      # Responsive design detection
│   │   │
│   │   └── lib/                    # Utilities & helpers
│   │       ├── authUtils.ts        # Auth helpers
│   │       ├── queryClient.ts      # React Query setup
│   │       └── utils.ts            # General utilities (cn(), etc.)
│   │
│   ├── public/                     # Static assets
│   │   └── (images, icons, etc.)
│   │
│   └── index.html                  # HTML template (Vite entry)
│
├── server/                          # Express Backend
│   ├── index.ts                    # App setup, middleware, port binding
│   ├── routes.ts                   # ALL API endpoints (/api/*)
│   ├── storage.ts                  # Database operations (CRUD)
│   ├── db.ts                       # Database connection (Drizzle ORM)
│   ├── replitAuth.ts               # Auth setup (Passport + OpenID/Dev mode)
│   ├── vite.ts                     # Vite middleware setup
│   └── static.ts                   # Static file serving (production)
│
├── shared/                          # Shared code (client + server)
│   └── schema.ts                   # Database schema + Zod validation
│                                   # Types exported for client use
│
├── Configuration Files
│   ├── package.json                # Dependencies + scripts
│   ├── tsconfig.json               # TypeScript config (includes all folders)
│   ├── vite.config.ts              # Vite bundler config
│   ├── tailwind.config.ts          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS pipeline
│   ├── drizzle.config.ts           # Drizzle ORM config
│   └── components.json             # shadcn/ui config
│
├── .env.local                      # Environment variables (git ignored)
├── .gitignore                      # Git ignore rules
├── STRUCTURE.md                    # This file
└── node_modules/                   # All dependencies (root level)
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | What's Used |
|-----------|---------|-----------|
| **React** (18.3.1) | UI framework | Components, hooks, state |
| **Vite** (7.3.0) | Bundler | Dev server, HMR, fast builds |
| **TypeScript** (5.6.3) | Type safety | Type checking throughout |
| **Tailwind CSS** (3.4.17) | Styling | Utility-first CSS classes |
| **shadcn/ui** (50+ components) | UI components | Pre-built accessible components |
| **React Query** (5.60.5) | Data fetching | Server state management |
| **Wouter** (3.3.5) | Routing | Client-side routing |
| **React Hook Form** (7.55.0) | Forms | Form state management |
| **Zod** (3.24.2) | Validation | Schema validation |
| **Framer Motion** (11.13.1) | Animations | Page transitions, animations |

### Backend
| Technology | Purpose | What's Used |
|-----------|---------|-----------|
| **Express** (4.21.2) | Web framework | Routes, middleware, HTTP |
| **TypeScript** (5.6.3) | Type safety | Server code typing |
| **Drizzle ORM** (0.39.3) | Database | Type-safe queries |
| **PostgreSQL** (pg 8.16.3) | Database | Primary database |
| **Multer** (2.0.2) | File upload | Multipart form handling |
| **Passport** (0.7.0) | Authentication | Auth strategy handling |
| **openid-client** (6.8.1) | OpenID Connect | OAuth/SSO integration |
| **express-session** (1.18.1) | Sessions | User session management |

### Shared
| Technology | Purpose | What's Used |
|-----------|---------|-----------|
| **Zod** (3.24.2) | Schema validation | Type validation both sides |
| **Drizzle Zod** (0.7.0) | ORM integration | Auto-generated Zod schemas |

### Development
| Technology | Purpose |
|-----------|---------|
| **TSX** (4.20.5) | TypeScript execution |
| **cross-env** (7.0.3) | Windows compatibility |
| **dotenv** (17.2.3) | Environment variables |
| **Drizzle Kit** (0.31.8) | Database migrations |

---

## 🔄 Data Flow & Connections

### 1. User Authentication Flow
```
User Opens App
    ↓
client/src/main.tsx → creates React root
    ↓
App.tsx → loads useAuth hook
    ↓
useAuth.ts → calls GET /api/auth/user
    ↓
server/routes.ts:45 → isAuthenticated middleware
    ↓
server/replitAuth.ts → checks session
    ↓
Dev Mode: Creates mock user
Prod Mode: Validates OpenID token
    ↓
server/storage.ts → getUser(userId)
    ↓
server/db.ts → Drizzle ORM query
    ↓
PostgreSQL users table
    ↓
Returns user data → Response sent to client
    ↓
useAuth.ts → Updates context
    ↓
Components render with user data
```

### 2. Content Upload Flow
```
User clicks "Upload" → Upload.tsx page
    ↓
UploadForm.tsx → Form submission
    ↓
POST /api/contents/upload (multipart/form-data)
    ↓
server/routes.ts:160 → multer middleware
    ↓
File saved to /uploads directory
    ↓
server/storage.ts → createContent()
    ↓
Drizzle ORM → INSERT INTO contents table
    ↓
PostgreSQL → new row created
    ↓
Response with contentId
    ↓
React Query invalidates cache
    ↓
Home.tsx refetches contents list
```

### 3. Content Viewing Flow
```
User clicks content card → ContentDetail.tsx
    ↓
GET /api/contents/:id
    ↓
server/routes.ts:120 → getContentWithDetails()
    ↓
Joins: contents + ratings + comments + user info
    ↓
Increments view count
    ↓
Returns rich content data
    ↓
Page displays: title, content, comments, ratings
    ↓
User clicks "Download" → increments download count
```

### 4. Comment System Flow
```
User types comment → CommentSection.tsx
    ↓
POST /api/contents/:id/comments
    ↓
server/storage.ts → createComment()
    ↓
PostgreSQL → INSERT INTO comments
    ↓
React Query → refetch comments
    ↓
New comment appears in UI with animations
```

---

## 🚀 Building from 0 to MVP

### Phase 1: Project Setup (15 minutes)
```bash
# Step 1: Create project folder
mkdir book-harbor
cd book-harbor

# Step 2: Initialize Git & Node
git init
npm init -y

# Step 3: Create folder structure
mkdir -p client/src/{components,pages,hooks,lib} server shared client/public

# Step 4: Install root dependencies
npm install --save-dev typescript tsx @types/node ts-node
npm install express cors dotenv
npm install --save-dev vite @vitejs/plugin-react
```

### Phase 2: TypeScript & Config Setup (10 minutes)
```bash
# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "dom", "dom.iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"]
}
EOF

# Create .env.local
cat > .env.local << 'EOF'
DEV_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/book_harbor
NODE_ENV=development
EOF

# Create vite.config.ts (shown below)
```

### Phase 3: Shared Schema (30 minutes)
```bash
# Install Drizzle & Zod
npm install drizzle-orm drizzle-zod zod pg
npm install --save-dev drizzle-kit

# Create shared/schema.ts
# This defines ALL database tables and types
# Tables: users, contents, comments, ratings, groups, sessions
# Types auto-generated from schema with Zod
```

**Key file: `shared/schema.ts`**
```typescript
import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contents = pgTable("contents", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title"),
  fileUrl: varchar("file_url"),
  price: decimal("price").default("0"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generate Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createInsertSchema(users);
```

### Phase 4: Database Layer (20 minutes)
```bash
# Create server/db.ts
```

**Key file: `server/db.ts`**
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DEV_DATABASE_URL
});

export const db = drizzle(pool, { schema });
```

### Phase 5: Storage/CRUD Layer (45 minutes)
```bash
# Create server/storage.ts
# Implements all database operations
```

**Key file: `server/storage.ts` (excerpt)**
```typescript
import { db } from "./db";
import { users, contents } from "@shared/schema";

export const storage = {
  // User operations
  getUser: async (id: string) => {
    return db.query.users.findFirst({
      where: eq(users.id, id)
    });
  },

  createContent: async (data: InsertContent) => {
    return db.insert(contents).values(data).returning();
  },

  // ... more CRUD operations
};
```

### Phase 6: Express Server & Routes (60 minutes)
```bash
# Install Express dependencies
npm install express express-session passport passport-local multer cors
npm install --save-dev @types/express @types/node

# Create server/index.ts
```

**Key file: `server/index.ts`**
```typescript
import express from "express";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(express.json());

registerRoutes(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
```

**Key file: `server/routes.ts` (excerpt)**
```typescript
export async function registerRoutes(app: Express) {
  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  });

  // Content routes
  app.get("/api/contents", async (req, res) => {
    const contents = await storage.getContents();
    res.json(contents);
  });

  app.post("/api/contents", isAuthenticated, async (req, res) => {
    const content = await storage.createContent(req.body);
    res.json(content);
  });

  // User routes, comment routes, etc...
}
```

### Phase 7: Authentication (40 minutes)
```bash
# Create server/replitAuth.ts
# Handles Passport, sessions, OAuth setup
```

**Key file: `server/replitAuth.ts` (dev mode excerpt)**
```typescript
export async function setupAuth(app: Express) {
  if (process.env.NODE_ENV === "development") {
    // Mock authentication for testing
    app.get("/api/login", (req, res) => {
      req.login({ claims: { sub: "dev-user" } }, () => {
        res.redirect("/");
      });
    });
    return;
  }

  // Production: full OpenID setup
}

export const isAuthenticated = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    return next(); // Skip in dev
  }
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
```

### Phase 8: React Frontend Setup (30 minutes)
```bash
# Install React dependencies
npm install react react-dom
npm install --save-dev vite @vitejs/plugin-react

# Create vite.config.ts
```

**Key file: `vite.config.ts`**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "client"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  server: {
    middlewareMode: true,
  },
});
```

### Phase 9: React App Structure (40 minutes)

**Create: `client/src/main.tsx`**
```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

**Create: `client/src/App.tsx`**
```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ContentDetail from "./pages/ContentDetail";
import Upload from "./pages/Upload";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### Phase 10: Install UI Library (20 minutes)
```bash
npm install @radix-ui/react-* lucide-react tailwindcss
npm install --save-dev tailwindcss postcss autoprefixer

# Copy shadcn/ui components you need
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog
```

### Phase 11: Build Core Pages (90 minutes)

**Create: `client/src/pages/Home.tsx`**
```typescript
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ContentCard from "@/components/ContentCard";

export default function Home() {
  const { data: contents } = useQuery({
    queryKey: ["contents"],
    queryFn: async () => {
      const res = await fetch("/api/contents");
      return res.json();
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Discover Content</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contents?.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
    </div>
  );
}
```

**Create: `client/src/pages/Upload.tsx`**
```typescript
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/contents", {
        method: "POST",
        body: formData,
      });
      return res.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <Input
        placeholder="Content Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button type="submit" disabled={mutation.isPending}>
        Upload
      </Button>
    </form>
  );
}
```

### Phase 12: Styling & Polish (60 minutes)
```bash
# Create client/src/index.css with Tailwind directives
# Add global styles
# Configure dark mode
# Add animations with Framer Motion
```

### Phase 13: Package.json Scripts
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "check": "tsc --noEmit",
    "db:push": "drizzle-kit push"
  }
}
```

### Phase 14: Run It!
```bash
# Make sure PostgreSQL is running
# Then:
npm run dev

# Open browser
# http://127.0.0.1:5000
```

---

## 📝 Detailed Code Breakdown

### Server Initialization Flow
```
npm run dev
  ↓
cross-env NODE_ENV=development tsx server/index.ts
  ↓
server/index.ts loads
  ↓
dotenv loads .env.local
  ↓
import express → creates app
  ↓
import registerRoutes
  ↓
registerRoutes(app) called
  ↓
setupAuth(app) → handles sessions/passport
  ↓
Define all app.get(), app.post(), etc.
  ↓
Create HTTP server from Express app
  ↓
In dev mode: import setupVite()
  ↓
setupVite adds Vite middleware to Express
  ↓
  Vite middleware serves React + handles HMR
  ↓
httpServer.listen(5000)
  ↓
Server running! Can access:
  - http://127.0.0.1:5000 → React app
  - http://127.0.0.1:5000/api/contents → JSON API
```

### Request to Response Example
```
User clicks "Like" on content
  ↓
FrontEnd: const response = await fetch("/api/contents/123/like", {
             method: "POST"
           });
  ↓
HTTP POST arrives at Express
  ↓
server/routes.ts line ~250:
app.post("/api/contents/:id/like", isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  const contentId = req.params.id;
  ↓
  server/storage.ts:
  const like = await storage.likeContent(userId, contentId);
  ↓
  server/db.ts (Drizzle ORM):
  INSERT INTO ratings (userId, contentId, rating) VALUES (...)
  ↓
  PostgreSQL database:
  - Checks constraints
  - Inserts new row
  - Returns result
  ↓
  Drizzle returns JS object
  ↓
  storage returns object
  ↓
  res.json(like) sends response
  ↓
HTTP 200 OK with JSON
  ↓
Frontend: response.json()
  ↓
QueryClient invalidates cache
  ↓
React refetches content
  ↓
UI updates with new like count
```

### File Upload Example
```
User selects file: test.pdf (5MB)
  ↓
Frontend: const formData = new FormData();
          formData.append('file', file);
          formData.append('title', 'My Book');
          
          fetch('/api/contents', {
            method: 'POST',
            body: formData
          });
  ↓
Express receives multipart/form-data
  ↓
server/routes.ts line ~160:
app.post("/api/contents", upload.single('file'), isAuthenticated, ...)
  ↓
multer middleware:
- Validates file size (< 100MB)
- Saves to /uploads/1734633456789-123456789.pdf
- Adds req.file object
  ↓
Route handler gets req.file:
{
  fieldname: 'file',
  originalname: 'test.pdf',
  filename: '1734633456789-123456789.pdf',
  path: '/home/user/uploads/...',
  size: 5242880
}
  ↓
storage.createContent({
  userId: req.user.claims.sub,
  title: 'My Book',
  fileUrl: '/uploads/1734633456789-123456789.pdf',
  ...
})
  ↓
Drizzle ORM:
INSERT INTO contents (userId, title, fileUrl, ...)
VALUES ('user-123', 'My Book', '/uploads/...', ...)
  ↓
PostgreSQL returns new content object
  ↓
res.json(content)
  ↓
Frontend receives:
{
  id: 'content-456',
  title: 'My Book',
  fileUrl: '/uploads/...',
  ...
}
  ↓
React QueryClient invalidates 'contents' cache
  ↓
Home.tsx refetches /api/contents
  ↓
New content appears in grid
```

---

## 🔑 Key Concepts

### Why Monorepo?
1. **Dependency Sharing** - Both client & server use same TypeScript, React packages
2. **Type Safety** - Shared schema means client & server types always match
3. **Single Dev Server** - One Express server serves both API + frontend HMR
4. **No CORS** - Everything on same origin

### Authentication Flow
```
Session-based with JWT tokens (production) or mock (dev)

Dev Mode:
- GET /api/login creates mock session
- All requests auto-authenticated

Production Mode:
- OAuth via Replit or custom OpenID provider
- JWT tokens stored in session
- Passport validates on each request
```

### Data Validation
```
Shared Schema (shared/schema.ts)
  ↓
Drizzle ORM reads it
  ↓
Creates table migrations
  ↓
Creates Zod schemas
  ↓
Frontend imports schemas
  ↓
Uses for form validation
```

### Database Relationships
```
users (1) ──→ (many) contents
users (1) ──→ (many) comments
users (1) ──→ (many) ratings
contents (1) ──→ (many) comments
contents (1) ──→ (many) ratings
users (1) ──→ (many) groups
groups (1) ──→ (many) groupMembers
```

---

## 🎯 MVP Checklist

- [x] TypeScript configuration
- [x] Express server setup
- [x] PostgreSQL connection (Drizzle ORM)
- [x] Database schema (users, contents, comments, ratings)
- [x] Authentication system
- [x] File upload handling (multer)
- [x] React app structure
- [x] Vite dev server integration
- [x] Client routing
- [x] API fetch integration (React Query)
- [x] Forms with validation (React Hook Form + Zod)
- [x] UI components (shadcn/ui)
- [x] Basic pages (Home, Upload, Profile)
- [x] Content CRUD operations
- [x] Comments system
- [x] Ratings system
- [x] Groups/communities

---

## 🚨 Troubleshooting

### Database Connection Error
```
Error: password authentication failed for user "postgres"
```
**Solution:** Set up PostgreSQL locally or provide DEV_DATABASE_URL in .env.local

### Port Already in Use
```
Error: listen EADDRINUSE
```
**Solution:** Change PORT in .env.local or kill process on port 5000

### Module Not Found
```
Cannot find module '@/components/...'
```
**Solution:** Check tsconfig.json paths alias matches folder structure

### Vite HMR Not Working
```
WebSocket connection failed
```
**Solution:** Check vite.config.ts hmr configuration

---

## 📚 Learning Resources

- Drizzle ORM: https://orm.drizzle.team/
- React Query: https://tanstack.com/query/latest
- shadcn/ui: https://ui.shadcn.com/
- Express: https://expressjs.com/
- Vite: https://vitejs.dev/

---

**Last Updated:** December 19, 2025
