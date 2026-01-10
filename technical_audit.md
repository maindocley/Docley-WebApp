# Comprehensive Technical Audit: Docley-WebApp

This audit provides the technical foundation for implementing a centralized API client and standardizing communication between the frontend and backend.

## 1. Current API Endpoints

### Public / Infrastructure
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/` | `GET` | Hello World / Root health check |
| `/health` | `GET` | System health status |
| `/maintenance` | `GET` | Global maintenance toggle status |
| `/posts` | `GET` | List published blog posts |
| `/posts/:slug` | `GET` | Fetch single published post |
| `/api/webhooks/whop` | `POST` | Whop payment/membership webhook handler |

### User & Authentication
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/users/profile` | `GET` | Retrieve current user profile |
| `/users/profile` | `PATCH` | Update user profile data |
| `/users/password` | `PATCH` | Securely update user password |
| `/users/check-admin` | `GET` | Verify admin status |
| `/users/sync` | `POST` | Synchronize Supabase user with backend DB |

### core Features
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/payments/session` | `GET` | Generate dynamic Whop checkout session |
| `/ai/transform` | `POST` | AI text transformation (diagnostic/upgrade) |
| `/documents` | `GET` | List user documents |
| `/documents` | `POST` | Create new document entry |
| `/documents/:id` | `GET` | Fetch document content |
| `/documents/:id` | `PATCH` | Update document metadata/content |
| `/documents/:id` | `DELETE` | Remove document |
| `/documents/upload` | `POST` | Handle file uploads to storage |
| `/feedback` | `POST` | User feedback submission |

### Admin management (Protected)
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/admin/stats` | `GET` | Dashboard KPI overview |
| `/admin/activity` | `GET` | Global activity audit log |
| `/admin/users` | `GET` | list all registered users |
| `/admin/users/:id/status` | `PATCH` | Ban or unban a user |
| `/admin/users/:id` | `DELETE` | Permanent user deletion |
| `/admin/settings` | `GET` | Fetch app configuration |
| `/admin/settings` | `PATCH` | Update app configuration |
| `/admin/upload-image` | `POST` | Upload images for the blog |
| `/admin/posts` | `GET/POST` | Blog post management |
| `/notifications` | `GET/PATCH` | Admin notification system |

---

## 2. Authentication Flow
- **Protocol**: Standard **JWT Bearer Authentication**.
- **Frontend Logic**:
    1. `src/lib/supabase` provides the client.
    2. `src/api/client.js` implements `getAuthHeaders()`.
    3. It fetches the session via `supabase.auth.getSession()`.
    4. Token is attached as `Authorization: Bearer <access_token>`.
- **Backend Logic**:
    - `SubscriptionGuard` and `AdminGuard` intercept requests.
    - They use `SupabaseService` to verify the JWT via `supabase.auth.getUser()`.
    - User information is extracted and attached to the `req.user` object.

---

## 3. Environment Variable Audit
| Folder | Variable | Active Usage |
| :--- | :--- | :--- |
| `/docley` | `VITE_API_URL` | Base endpoint for all backend calls |
| `/docley` | `VITE_SUPABASE_URL` | Supabase endpoint |
| `/docley` | `VITE_SUPABASE_ANON_KEY` | Public access key |
| `/server` | `WHOP_API_KEY` | Server-side payment processing |
| `/server` | `WHOP_WEBHOOK_SECRET` | Header signature verification |
| `/server` | `GOOGLE_API_KEY` | Gemini AI processing |
| `/server` | `SUPABASE_URL` | Supabase project URL |
| `/server` | `SUPABASE_SERVICE_ROLE_KEY` | Bypassing RLS for admin actions |

---

## 4. Shared Utility vs. Manual Fetch
Current audit of `/docley/src/services`:

- **Shared Utility**: `API_BASE_URL` and `getAuthHeaders` are used by ALL services.
- **Manual Fetch**: **Every current service** still uses the manual `fetch()` browser API.

> [!IMPORTANT]
> To implement a "Centralized API Client", we should refactor `src/api/client.js` to include `client.get`, `client.post`, etc., and then update all 7 service files to use these wrappers instead of manual `fetch` calls.

---

## 5. Whop Integration
- **Status**: **Fully Backend-Managed**.
- **Execution**: The frontend **never** touches Whop plan IDs or creates sessions. It simply calls the backend `/payments/session` endpoint. The backend handles the secret `WHOP_API_KEY` and return url logic, ensuring maximum security.
