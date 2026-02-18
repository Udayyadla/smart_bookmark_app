
```md
# 📌 Smart Bookmark App

A full-stack bookmark manager built using **Next.js (App Router)** and **Supabase (Authentication + PostgreSQL + Realtime)**.

This project demonstrates secure per-user data isolation, real-time synchronization across multiple tabs, and production-ready deployment practices.

---

## 🚀 Live Demo

🔗 https://smartbookmarkapp-rho.vercel.app/ 

---

## 📂 GitHub Repository

🔗 https://github.com/Udayyadla/smart_bookmark_app

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Google OAuth
- **Realtime:** Supabase Realtime (WebSockets)
- **Deployment:** Vercel

---

## ✨ Features

- 🔐 Google OAuth login
- ➕ Add bookmarks
- 🗑 Delete bookmarks
- 🔄 Real-time sync across multiple browser tabs
- 🔒 Row Level Security (RLS) enforced at database level
- 🌍 Production deployment on Vercel

---

# 🏗 Architecture Overview

```

Client (Next.js)
↓
Supabase JS Client
↓
PostgREST API
↓
PostgreSQL (with RLS policies)
↓
Realtime (WebSocket subscription)

````

Each bookmark row is protected using:

```sql
auth.uid() = user_id
````

This ensures strict per-user data isolation.

---

# 🚧 Challenges Faced & Engineering Approach

The complexity of this project was not in CRUD operations, but in authentication flow, database security, realtime synchronization, and environment configuration.

---

## 1️ Row Level Security (RLS) Blocking Writes

### Problem

Bookmarks were not inserting or deleting even though frontend logic was correct.

### Root Cause

RLS was enabled but:

* `user_id` column type mismatch
* Policies not aligned with `auth.uid()`
* Silent database rejection

### Solution

```sql
create policy "users can access their own bookmarks"
on bookmarks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### Key Learning

Database-level authorization can silently reject requests even when frontend appears correct.

---

## 2️ TypeScript `never` Error with Supabase

### Problem

Build failed with:

```
Argument of type ... is not assignable to parameter of type 'never'
```

### Root Cause

Supabase client was created without providing database type definitions.  
As a result, TypeScript inferred table types as `never`, causing `.insert()` and other operations to fail at compile time.

### Solution

To resolve this, I explicitly typed the Supabase client using a generic:

```ts
createClient<any>(...)



## 3 OAuth Redirect Issues After Deployment

### Problem

After deploying to Vercel, login redirected to `localhost`.

### Root Cause

Supabase "Site URL" was still configured for development.

### Solution

* Updated Site URL to production domain
* Added both localhost and production URLs
* Used dynamic redirect:

```ts
redirectTo: window.location.origin
```

### Key Learning

OAuth flows depend heavily on correct environment configuration.

---

* Logged Supabase URL in both environments
* Synced environment variables in Vercel
* Redeployed application

### Key Learning

Environment consistency is critical in production systems.

---

## 4 Implementing Reliable Realtime Across Tabs

### Goal

If two tabs are open, changes in one should instantly reflect in the other without refreshing.

### Challenges

Realtime requires:

* Replication enabled on the table
* Subscription after authentication
* Proper RLS filtering
* Correct WebSocket lifecycle handling

### Solution

```ts
supabase
  .channel("bookmarks-realtime")
  .on("postgres_changes", { event: "*", table: "bookmarks" }, handler)
  .subscribe();
```

### Key Learning

Realtime synchronization involves distributed state management — not just enabling a feature flag.

---

### Key Learning

# 🔒 Security Considerations

* Row Level Security enabled
* Strict per-user data isolation
* No service-role key exposed
* Environment variables secured in Vercel

---

# 🧠 Engineering Takeaways

This project strengthened my understanding of:

* Authentication flows
* Authorization policies (RLS)
* OAuth lifecycle management
* Environment configuration
* Realtime WebSocket synchronization
* Production deployment debugging
* Strong TypeScript integration

The most challenging aspects were understanding how different layers of the system interact in production environments.

---

# ⚙️ Local Setup

```bash
git clone https://github.com/Udayyadla/smart_bookmark_app.git
cd smart_bookmark_app
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Run locally:

```bash
npm run dev
```

---

# 🏁 Conclusion

This project demonstrates secure authentication, database-level authorization, realtime synchronization, and production deployment using modern full-stack tools.
```
