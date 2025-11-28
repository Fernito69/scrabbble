# Routing Setup

This document explains the authentication-based routing implementation in the app.

## Overview

The app uses React Router to handle navigation with authentication-based route protection:
- **Unauthenticated users** are redirected to `/login`
- **Authenticated users** can access `/` (Playfield)

## Components

### ProtectedRoute
Location: `src/components/auth/ProtectedRoute.tsx`

A wrapper component that protects routes requiring authentication:
- Shows loading state while checking auth status
- Redirects to `/login` if user is not authenticated
- Renders children if user is authenticated

```typescript
<ProtectedRoute>
  <Playfield />
</ProtectedRoute>
```

### Login Page
Location: `src/pages/Login.tsx`

Simple login interface with:
- Email/password authentication
- Google sign-in option
- Auto-redirect to home after successful login

Features:
- Form validation
- Error handling
- Loading states
- Styled with Tailwind CSS

### Playfield Page
Location: `src/pages/Playfield.tsx`

The main game interface (currently a placeholder):
- Shows user email
- Sign out button
- Placeholder for game board

## Route Configuration

In `src/App.tsx`:

```typescript
<BrowserRouter>
  <Routes>
    {/* Login route - redirects to home if already authenticated */}
    <Route path="/login" element={<LoginRoute />} />

    {/* Protected home route - requires authentication */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Playfield />
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>
```

## How It Works

### 1. Initial Load
- App checks authentication state via `AuthContext`
- Shows loading screen while checking

### 2. Unauthenticated User
- User tries to access `/`
- `ProtectedRoute` detects no user
- Redirects to `/login`
- User signs in
- Automatically redirected to `/`

### 3. Authenticated User
- User visits `/login`
- `LoginRoute` detects authenticated user
- Redirects to `/`
- User can access protected routes

### 4. Sign Out
- User clicks "Sign Out" in Playfield
- Auth state cleared
- Redirected to `/login`

## Testing Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:5173`
   - You should be redirected to `/login`

3. Try to access `http://localhost:5173/`
   - Without login, you'll be redirected to `/login`

4. Sign in with Firebase credentials
   - You'll be redirected to `/` (Playfield)

## Adding New Routes

### Public Route (no auth required)
```typescript
<Route path="/about" element={<About />} />
```

### Protected Route (auth required)
```typescript
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
```

## Firebase Requirements

Make sure you have:
1. Created a Firebase project
2. Enabled Authentication (Email/Password and Google)
3. Added Firebase config to `.env`

See `SETUP.md` for detailed Firebase configuration instructions.
