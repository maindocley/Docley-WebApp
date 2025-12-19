# Supabase Authentication Configuration Guide

Complete these steps in your Supabase Dashboard to enable all authentication features.

---

## 1. Configure Redirect URLs

Go to **Authentication > URL Configuration** in Supabase Dashboard.

| Setting | Value |
|---------|-------|
| Site URL | `https://docley.so` |
| Redirect URLs | `http://localhost:5173/auth/callback`, `http://localhost:5176/auth/callback`, `https://docley.so/auth/callback`, `http://localhost:5173/reset-password`, `https://docley.so/reset-password` |

---

## 2. Enable Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth Client ID**
5. Select **Web application**
6. Add Authorized redirect URIs:
   - `https://jaetegawuwrkrmvladwk.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Go to **Authentication > Providers** in Supabase Dashboard
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. Enter your credentials:

| Field | Value |
|-------|-------|
| Client ID | `665223591792-g55abldu7gtfjiqsim3mg4vp129b4f10.apps.googleusercontent.com` |
| Client Secret | *(Get from Google Cloud Console)* |

5. Click **Save**

---

## 3. Configure Custom SMTP

For emails to come from `maindocley@gmail.com`, you need a Gmail App Password.

### Step 1: Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App passwords**
4. Select **Mail** and generate a password
5. Copy the 16-character password

### Step 2: Configure in Supabase

Go to **Project Settings > Authentication > SMTP Settings**

| Setting | Value |
|---------|-------|
| Enable Custom SMTP | ✅ Enabled |
| Sender email | `maindocley@gmail.com` |
| Sender name | `Docley` |
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `maindocley@gmail.com` |
| Password | *(Your 16-character App Password)* |

Click **Save**

---

## 4. Customize Email Templates

Go to **Authentication > Email Templates**

### Confirm Signup Template

```html
<h2>Verify your email</h2>
<p>Welcome to Docley! Click the button below to verify your email address.</p>
<p style="margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #3b82f6; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 8px; font-weight: 600;
            display: inline-block;">
    Verify Email
  </a>
</p>
<p style="color: #64748b; font-size: 14px;">
  If you didn't create an account, you can safely ignore this email.
</p>
```

### Reset Password Template

```html
<h2>Reset your password</h2>
<p>Click the button below to reset your password.</p>
<p style="margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #3b82f6; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 8px; font-weight: 600;
            display: inline-block;">
    Reset Password
  </a>
</p>
<p style="color: #64748b; font-size: 14px;">
  If you didn't request a password reset, you can safely ignore this email.
</p>
```

---

## 5. Verify Configuration

After completing all steps:

1. **Test Email Verification**: Create a new account at `/signup`
2. **Test Google Sign-In**: Click "Google" button on login/signup
3. **Test Password Reset**: Click "Forgot password?" on login page

---

## Files Created (Frontend Auth)

| File | Purpose |
|------|---------|
| `src/lib/supabase.js` | Supabase client configuration |
| `src/context/AuthContext.jsx` | Auth state management |
| `src/pages/Auth/Login.jsx` | Login with email & Google |
| `src/pages/Auth/Signup.jsx` | Signup with email & Google |
| `src/pages/Auth/ForgotPassword.jsx` | Request password reset |
| `src/pages/Auth/ResetPassword.jsx` | Set new password |
| `src/pages/Auth/AuthCallback.jsx` | Handle OAuth/email callbacks |
| `src/components/ProtectedRoute.jsx` | Route protection |
| `.env` | Environment variables |
