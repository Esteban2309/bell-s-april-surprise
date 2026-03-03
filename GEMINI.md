# Project Overview: Bell's April Surprise

A specialized digital "advent calendar" application built for "Bell" to celebrate the month of April. The app features 30 unique surprises (one for each day), with special fixed gifts for key dates (Day 1 for Birthday, Day 8 for 5-month anniversary) and a shuffled selection for the remaining days.

## Tech Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with `shadcn-ui` components
- **Icons:** Lucide React
- **State Management:** React hooks (useState, useMemo, useCallback) and localStorage for persistence
- **Testing:** Vitest and React Testing Library

## Architecture
- **`src/App.tsx`**: Application entry point configuring providers for TanStack Query, Radix UI Tooltips, and React Router.
- **`src/pages/Index.tsx`**: The core page managing the gift calendar logic, countdown timers, and unlocking rules.
- **`src/components/GiftBox.tsx`**: Handles individual gift states, including shaking animations and content revelation.
- **`src/data/gifts.ts`**: Contains the gift content and a seeded shuffle algorithm to ensure consistency across sessions.

## Key Features
- **Daily Unlocking:** Gifts are locked based on the current date (primarily active in April).
- **Persistence:** Opened states and dates are saved in `localStorage`.
- **Responsive Design:** Optimized for mobile and desktop views using Tailwind CSS.
- **Seeded Randomization:** Gifts are shuffled consistently based on the current year.

## Building and Running

### Development
```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production
```sh
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing & Linting
```sh
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Lint the project
npm run lint
```

## Development Conventions

- **Component Structure:** Follow the `shadcn-ui` pattern. UI primitives reside in `src/components/ui`, while feature-specific components go in `src/components`.
- **Styling:** Use Tailwind CSS utility classes. Prefer CSS variables for theme-specific colors (defined in `index.css`).
- **Icons:** Use `lucide-react` for all iconography.
- **Types:** Strictly use TypeScript interfaces for data models (e.g., `Gift` in `src/data/gifts.ts`).
- **Persistence:** Use the `STORAGE_KEY` and `OPENED_DATE_KEY` constants in `Index.tsx` for any localStorage modifications.
