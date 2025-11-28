# Quick Start Guide

Your React TypeScript application with shadcn/ui, Tailwind CSS, and Firebase is ready!

## What's Included

### Core Technologies
- **React 18** with TypeScript
- **Vite 4** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library (configured, ready to add components)
- **Firebase SDK** - Authentication and Firestore

### Project Structure

```
src/
├── components/ui/      # shadcn/ui components (add components here)
├── config/
│   └── firebase.ts     # Firebase initialization
├── contexts/
│   └── AuthContext.tsx # Authentication context provider
├── hooks/
│   └── useFirestore.ts # Custom Firestore hooks
├── lib/
│   └── utils.ts        # Utility functions (cn helper)
├── services/
│   ├── auth.ts         # Authentication service
│   └── firestore.ts    # Firestore CRUD operations
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx
├── main.tsx
└── index.css           # Global styles with Tailwind
```

## Getting Started

### 1. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and/or Google authentication
4. Enable **Cloud Firestore**:
   - Go to Firestore Database
   - Create database (start in test mode for development)

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Firebase config from Firebase Console:
   - Project Settings > General > Your apps > Web app
   - Copy the config values

3. Update `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

### 3. Install Dependencies (if not already done)

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see your app!

## Available Services

### Authentication Service

```typescript
import { authService } from '@/services/auth';

// Sign up
await authService.signUp(email, password);

// Sign in
await authService.signIn(email, password);

// Sign in with Google
await authService.signInWithGoogle();

// Sign out
await authService.signOut();

// Get current user
const user = authService.getCurrentUser();
```

### Firestore Service

```typescript
import { firestoreService } from '@/services/firestore';

// Get all documents from a collection
const users = await firestoreService.getCollection('users');

// Get a single document
const user = await firestoreService.getDocument('users', userId);

// Add a document
const id = await firestoreService.addDocument('users', { name: 'John' });

// Update a document
await firestoreService.updateDocument('users', userId, { name: 'Jane' });

// Delete a document
await firestoreService.deleteDocument('users', userId);
```

### Custom Hooks

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useFirestoreCollection, useFirestoreDocument } from '@/hooks/useFirestore';

// Use auth context
const { user, loading } = useAuth();

// Use Firestore collection hook
const { data, loading, error } = useFirestoreCollection('users');

// Use Firestore document hook
const { data, loading, error } = useFirestoreDocument('users', userId);
```

## Adding shadcn/ui Components

You can add shadcn/ui components manually or use their CLI:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

Components will be added to `src/components/ui/`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Next Steps

1. Set up your Firebase project and add credentials to `.env`
2. Customize the app by editing `src/App.tsx`
3. Add shadcn/ui components as needed
4. Create your database schema in Firestore
5. Build your features using the provided services and hooks

## Notes

- The `.env` file is ignored by git for security
- Share `.env.example` with your team (without actual credentials)
- Update Firestore security rules before deploying to production
- Consider upgrading Node.js to v18+ for better compatibility

Happy coding!
