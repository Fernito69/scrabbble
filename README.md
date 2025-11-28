# Scrabbble

A React TypeScript application built with modern web technologies.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Firebase** - Backend services
  - Firebase Authentication - User authentication
  - Cloud Firestore - NoSQL database

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Copy `.env.example` to `.env` and fill in your Firebase configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/      # React components
│   └── ui/         # shadcn/ui components
├── config/         # Configuration files
│   └── firebase.ts # Firebase configuration
├── contexts/       # React contexts
│   └── AuthContext.tsx
├── hooks/          # Custom React hooks
│   └── useFirestore.ts
├── lib/            # Utility functions
│   └── utils.ts
├── services/       # Service layer
│   ├── auth.ts     # Authentication service
│   └── firestore.ts # Firestore service
├── types/          # TypeScript type definitions
├── App.tsx         # Main app component
├── main.tsx        # App entry point
└── index.css       # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Firebase Setup

1. Create a `.env` file based on `.env.example`
2. Add your Firebase configuration values
3. Enable Authentication methods in Firebase Console
4. Set up Firestore database rules

## Adding shadcn/ui Components

To add new shadcn/ui components, you can manually create them in `src/components/ui/` or use the shadcn CLI:

```bash
npx shadcn-ui@latest add button
```

## License

MIT
