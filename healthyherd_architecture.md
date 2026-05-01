# HealthyHerd (CattleApp) Architecture Description

## 1. Executive Summary
HealthyHerd (internally referred to as `CattleApp`) is a mobile-first, offline-capable livestock management platform. It is designed to empower farmers with real-time herd tracking, health monitoring, and pasture management, even in remote areas with limited connectivity. The system leverages a modern cloud-native backend (Supabase) paired with a robust local-first frontend architecture.

## 2. Core Technology Stack
- **Frontend Framework**: React 19 with TypeScript, bundled via Vite.
- **Local Database**: Dexie.js (IndexedDB) for persistent local storage and offline queueing.
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Edge Functions, Storage).
- **AI Engine**: Google Gemini (via `@google/generative-ai`) for natural language intent extraction from voice commands.
- **Styling**: Vanilla CSS with a focus on custom design tokens for a premium, high-performance UI.
- **Utilities**: `lucide-react` (icons), `recharts` (data visualization), `papaparse` (CSV processing), `date-fns` (time manipulation).

## 3. System Architecture & Data Flow

### 3.1 Offline-First Sync Logic (`SyncManager`)
The app utilizes an "Outbox Pattern" to ensure reliability in low-connectivity environments:
1.  **Local Write**: All user actions (e.g., adding an animal, recording a treatment) are first written to the local Dexie database.
2.  **Queueing**: Operations are added to a `sync_outbox` table in Dexie with a `pending` status.
3.  **Synchronization**: The `SyncManager` service monitors connectivity. When online, it iterates through the outbox, executing equivalent operations (INSERT/UPDATE/DELETE) on the remote Supabase database.
4.  **Audio Handling**: Voice notes are stored as local blobs and queued in `offline_audio_queue` before being uploaded to Supabase Storage.

### 3.2 Backend & Security
- **Data Isolation**: Multi-tenancy is enforced at the database level using Supabase Row Level Security (RLS). Users can only access records associated with their `user_id`.
- **Database Triggers**: PostgreSQL triggers are used for critical business logic, such as:
    - Enforcing animal limits based on the user's subscription plan.
    - Provisioning default trial subscriptions upon user registration.
    - Automating support request routing.
- **Edge Functions**: Deno-based serverless functions handle complex side effects, including sending transactional emails via the Resend API (e.g., welcome emails, support confirmations).

## 4. Key Functional Modules

### 4.1 Herd Inventory & Management
Tracks individual animals with detailed metadata (breed, gender, status, birth weight). Supports batch movements between "Camps" (pastures) and batch health treatments to streamline large-scale operations.

### 4.2 Voice Assistant
A unique mobile-first feature that allows farmers to record observations hands-free.
- **Workflow**: Audio Capture -> Local Storage -> Gemini Intent Extraction -> Confirmation Modal -> Local DB Write -> Sync.
- **Supported Intents**: "Add animal", "Move herd", "Record treatment", "Log note".

### 4.3 Subscription & Billing
Tiered access model managed via a `SubscriptionContext`.
- **States**: `trialing`, `active`, `grace_period` (read-only), `cancelled`.
- **Limits**: Functional constraints (e.g., maximum animal count) are enforced both in the UI and via database triggers to prevent plan abuse.

### 4.4 Reporting & Analytics
Visualizes herd performance, health trends, and financial history (Buy/Sell) using `recharts`. Data is aggregated from local tables, ensuring reports load instantly regardless of network state.

## 5. Development Patterns
- **Component Architecture**: Highly modular functional components. Core UI logic is separated into `hooks` (e.g., `useSubscription`) and business logic into `services` (e.g., `syncManager`).
- **PWA Configuration**: Optimized for mobile installation with a custom `manifest.json` and device-aware UI utilities to ensure a native-app feel on iOS and Android.
- **Migrations**: Versioned PostgreSQL migrations in `/supabase/migrations` serve as the "source of truth" for the database schema evolution.
