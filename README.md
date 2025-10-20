# Synergy

Synergy is a full‑stack real‑time collaboration suite including collaborative documents (Yjs), chat, taskboards, workspaces, invites, file storage and video calls. The frontend is built with React + Vite. The backend is Node/Express and includes an optional Yjs websocket server with LevelDB persistence. Supabase provides authentication, Postgres storage and file storage.

---

## Table of contents

- Project summary
- Features
- Requirements
- Project layout
- Environment variables (.env examples)
- Local setup (development)
- Database / Supabase notes
- Troubleshooting (common issues)
- Useful commands
- Where to look in the code


---

## Project summary

- Frontend: synergy-frontend (Vite + React)
- Backend: synergy-backend (Express, routes, Yjs websocket)
- Realtime docs: Yjs (CRDT) + websocket server
- Auth/storage/db: Supabase (Auth + Postgres + Storage)

This repository provides the full stack required to run the app.

---

## Features

- Supabase authentication (email / OAuth)
- Workspace management (create, join by invite code, invite users)
- Real-time collaborative documents (Yjs)
- Chat using sockets
- Kanban taskboard
- File manager integrated with Supabase Storage
- Video calls via WebRTC / simple-peer
- Presence and notifications
- Yjs document persistence (LevelDB folder under synergy-backend/yjs-docs)

---

## Requirements

- Node.js >= 18 LTS
- npm (or yarn)
- A Supabase project (URL + anon key + service_role key for backend)
- (Optional) SMTP credentials if using email invites from backend

---

## Project layout (key folders / files)


- synergy-frontend/
  - src/
    - AuthProvider.jsx — auth & user sync
    - supabaseClient.js — client config
    - components/features/ — WorkspaceList.jsx, DocEditor.jsx, ChatRoom.jsx, TaskBoard.jsx, FileManager.jsx, etc.
    - context/ — providers (SocketContext, WorkspaceContext, PresenceProvider)
    - pages/ — login, signup, workspace dashboard
  - .env — frontend environment variables (local)

---

## Environment variables

Create .env files in frontend and backend directories. Do NOT commit secret keys to version control.

Example: synergy-frontend/.env
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

Example: synergy-backend/.env
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=service-role-key  # server-only
PORT=5000
JWT_SECRET=some-secret-if-used
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

Notes:
- Use the Supabase service role key only in server-side processes (backend).
- Frontend uses anon/public key (VITE_SUPABASE_ANON_KEY).

---

## Local setup (development)

Open two terminal windows / tabs (PowerShell on Windows recommended).

1. Install dependencies

- Backend:
  ```powershell
  cd c:\Users\bujja\OneDrive\Desktop\synergy\synergy-backend
  npm install
  ```

- Frontend:
  ```powershell
  cd c:\Users\bujja\OneDrive\Desktop\synergy\synergy-frontend
  npm install
  ```

2. Start backend API

In backend folder:
```powershell
npm start
# or
node index.js
# server listens on PORT (default 5000)
```

3. Start Yjs websocket server (optional, required for collaborative docs)

In backend folder:
```powershell
npx y-websocket --port 1234
```
- This writes persistent document state to `synergy-backend/yjs-docs`. Keep the folder for persistence across restarts.

4. Start frontend dev server

In frontend folder:
```powershell
npm run dev
# open http://localhost:5173
```

5. Sign in / test

- Use Supabase Auth via the frontend (OAuth or email). After signing in the app will call backend routes for workspaces, invites and will use the Supabase client for DB/storage operations.

---

## Database / Supabase notes

 Adjust schema to match your code if you changed table/column names.

Example SQL (minimal):
```sql
create extension if not exists "pgcrypto";

create table users (
  id uuid primary key references auth.users(id),
  email text,
  name text,
  created_at timestamptz default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text,
  invite_code text unique,
  public boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table workspace_members (
  workspace_id uuid references workspaces(id),
  user_id uuid references users(id),
  role text default 'member',
  primary key (workspace_id, user_id)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id),
  name text,
  yjs_state bytea,
  created_at timestamptz default now()
);
```

Important:
- Use Row Level Security (RLS) carefully: if RLS blocks anonymous/unauthorized access, Supabase REST calls can fail or yield PostgREST errors.
- If your code uses `.single()` and no row exists you may see a 406 (PostgREST PGRST116). Use `.maybeSingle()` or handle the empty result.

---


## Troubleshooting (common issues)

- 406 Not Acceptable (PostgREST PGRST116):
  - Caused by `.single()` when no row is returned. Replace with `.maybeSingle()` or handle no-row cases.
- CORS errors:
  - Ensure backend CORS allows `http://localhost:5173` (frontend dev host).
- Auth token missing / 401s:
  - Ensure Authorization header is `Bearer <access_token>` for backend calls requiring auth.
  - Use Supabase session access_token on frontend when calling protected backend routes.
- Yjs documents not restoring:
  - Ensure websocket server is running and `yjs-docs/` is accessible. Check server logs.
- Email invites failing:
  - Verify SMTP env variables and that port is open. Check backend logs for send errors.
- Dev server changes not reflected:
  - Restart the dev servers after .env changes.

---

## Useful commands

From repository root or per-folder:



- Frontend
  - Install: npm install
  - Dev: npm run dev
  - Build: npm run build
  - Preview build: npm run preview

- Inspect network/auth:
  - Use browser DevTools → Network to inspect API and Supabase requests.
  - Check request Accept / Authorization headers when debugging Supabase responses.

---

## Where to look in the code (quick links)

- Frontend
  - Auth provider: synergy-frontend/src/AuthProvider.jsx
  - Supabase client: synergy-frontend/src/supabaseClient.js
  - Workspace UI: synergy-frontend/src/components/features/WorkspaceList.jsx
  - Doc editor: synergy-frontend/src/components/features/DocEditor.jsx
  - Chat: synergy-frontend/src/components/features/ChatRoom.jsx
  - Taskboard: synergy-frontend/src/components/features/TaskBoard.jsx
  - File manager: synergy-frontend/src/components/features/FileManager.jsx



---



## Deployment notes

- Use the Supabase service role key only in backend/servers.
- Host the Yjs websocket server behind a process manager (pm2, systemd) or a container orchestration system.
- For production, serve the frontend build (dist) via a static host or from backend express static middleware.
- Use secure environment management for secrets .

---

## Example .env example files



synergy-frontend/.env.example
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

---


