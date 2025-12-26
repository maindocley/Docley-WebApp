Phase 4: The "Pro-Launch" (Hardening)
Goal: Performance and maintenance.

Lightweight Refactor: Audit React dependencies. Since you are using Supabase + NestJS, we can likely remove several client-side libraries that are no longer needed once the backend handles the logic.

Middleware: Add helmet for security and compression to the NestJS backend to keep it fast.