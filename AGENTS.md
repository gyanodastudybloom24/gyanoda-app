# Gyanoda React Native Architecture & Coding Guidelines

> **Authoritative guide for Antigravity and all coding agents working in this repository.**
> Read this file before editing code. These rules take priority over convenience, default templates, or personal preference.

---

## 1. Mission & Overview

Gyanoda is an Expo / React Native mobile application. Prioritize mobile-first patterns, performance, accessibility, and cross-platform compatibility (iOS, Android, and Web).

The repository is being evolved from initial starter/template code into a clean, scalable, maintainable application. Inspect the project first, then clean up dummy code, starter templates, and placeholders safely while strictly preserving existing architecture, folders, and real functionality.

- **Do not perform a blind rewrite.**
- **Do not delete folders**, even if empty.
- **Do not invent fake backend integrations, endpoints, credentials, or mock production behavior.**
- **Use React Navigation only. Never use Expo Router.**

---

## 2. Architecture & Folder Structure

The project structure is the baseline. **All existing folders must be preserved**:

```text
gyanoda-app/
├── .claude/
├── .vscode/
├── assets/
│   ├── expo.icon/
│   └── images/
│       └── tabIcons/
├── node_modules/
├── scripts/
├── src/
│   ├── app/            # App entry, root providers, React Navigation setup & navigators
│   ├── components/     # Reusable UI components shared across screens
│   │   ├── icons/      # Shared Solar Icon components & sets (preserved)
│   │   └── ui/         # Generic UI primitives (Button, Card, Toggle, Alert, Collapsible)
│   ├── constants/      # App-wide constants, theme tokens, styling metrics
│   ├── data/           # Static content, local seed data, documented test fixtures
│   ├── features/       # Feature-driven modules and subcomponents (preserved)
│   ├── hooks/          # Reusable custom React hooks
│   ├── lib/            # Third-party client instances & SDK initializations
│   ├── screens/        # Pure screen UI view renderers (e.g. home.screen.tsx, explore.screen.tsx)
│   ├── services/       # API clients, network requests, repositories, data-access
│   ├── types/          # Shared domain models & TypeScript definitions
│   ├── utils/          # Pure helper functions (no React hooks/components or state)
│   └── global.css      # Base styling / CSS variables
├── .gitignore
├── AGENTS.md           # This authoritative guide
├── app.json            # Expo application config
├── CLAUDE.md
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

### Folder Responsibilities

Keep code strictly in the folder whose responsibility it serves:

- **`src/app/`** — Application entry/bootstrap, root providers, `NavigationContainer`, navigators (stacks, tabs), and route containers (e.g. `home.tsx`, `explore.tsx`) that compose and render screen components from `src/screens/`.
- **`src/screens/`** — Pure screen UI view components (e.g. `home.screen.tsx`, `explore.screen.tsx`). Keep presentation and screen structure focused here for scalability.
- **`src/components/`** — Reusable UI components shared by multiple screens/features. Keep components composable and prop-driven.
- **`src/components/icons/`** — Shared vector icon components powered by Solar Icons (`react-native-solar-icons`).
- **`src/components/ui/`** — Shared design system primitives (`Button`, `Card`, `Toggle`, `Alert`, `Collapsible`).
- **`src/constants/`** — App-wide constants, route-name constants, theme tokens (`Colors`, `Palette`, `Typography`, `Rounded`, `Spacing`, `Fonts`).
- **`src/data/`** — Static content, local seed data, and explicitly documented fixtures. Never treat temporary mock data as production data.
- **`src/features/`** — Feature-specific screens and submodules (e.g. `home/screens`, `explore/screens`).
- **`src/hooks/`** — Reusable custom hooks encapsulating stateful behavior or React lifecycle logic. Keep one-off logic local to its feature.
- **`src/lib/`** — Configured third-party clients and low-level integrations (SDK initializations). Centralize clients; never expose secrets.
- **`src/services/`** — API calls, repositories, and business-service operations. Keep networking out of presentational UI components.
- **`src/types/`** — Shared TypeScript types, interfaces, and domain models.
- **`src/utils/`** — Small, pure, reusable helper functions. No React components, hooks, or network calls here.
- **`src/global.css`** — Global web CSS variables and fonts. Verify native runtime styling compatibility before editing.
- **`assets/`** — Static images, fonts, icons, and bundled assets. Reuse existing assets; never delete without verifying references.
- **`scripts/`** — Developer, maintenance, or build scripts. Keep them documented.

---

## 3. Navigation: React Navigation Only (Strictly No Expo Router)

**Do not use Expo Router.** All screen routing, stack navigation, bottom tabs, drawers, and nested navigation must use **React Navigation** (`@react-navigation/*`).

### Mandatory Navigation Rules:
1. **Never use Expo Router**: Do not import from `expo-router`, do not use `expo-router/ui` or `expo-router/native-tabs`, do not use file-based routing conventions (`_layout.tsx`, `+not-found.tsx`), and do not create an `app/` directory at the repository root.
2. **React Navigation packages**: Use `@react-navigation/native`, `@react-navigation/native-stack`, and `@react-navigation/bottom-tabs`. Install them using `npx expo install`.
3. **Single Root `NavigationContainer`**: Wrap the app in a single `NavigationContainer` at the application root inside `src/app/App.tsx`.
4. **Typed Routes & Navigators**: Keep navigator definitions and route parameter lists organized under `src/app/navigation/`. Use TypeScript `NativeStackScreenProps` or `BottomTabScreenProps` for all routes.
5. **No Scattered String Literals**: Define route names as constants or TypeScript string union types in `src/types/navigation.ts`.
6. **Entry Point**: App entry must point to root `index.ts` registering root `App` component with Expo's `registerRootComponent`.

---

## 4. Mandatory UI, Icon, Alert & Animation Rules

1. **STRICTLY USE CUSTOM ALERT — NEVER USE NATIVE ALERT**:
   - **Never import or call React Native's native `Alert.alert`**.
   - Always use `customAlert` (or `useAlert()`) from `@/components/ui`:
     ```tsx
     import { customAlert } from '@/components/ui';

     customAlert.show({
       title: 'Confirmation',
       message: 'Are you sure you want to proceed?',
       type: 'confirm',
       buttons: [
         { text: 'Cancel', style: 'cancel' },
         { text: 'Confirm', style: 'primary', onPress: () => handleConfirm() },
       ],
     });
     ```
   - Supports: `info`, `success`, `warning`, `error`, `confirm`.
   - The `<AlertProvider>` is mounted globally at `src/app/App.tsx`.
2. **Icon Library**:
   - Use **Solar Icons** via `@/components/icons` (`SolarIcon` from `react-native-solar-icons`).
   - **Do NOT use `lucide-react`, `lucide-react-native`, or raw `@expo/vector-icons`**.
3. **Animations**:
   - Use `react-native-reanimated` for UI micro-animations (spring press scaling on buttons and cards, smooth thumb slide on toggles, and modal entrance/exit on alerts).
4. **Design Tokens & Rounded Constants**:
   - Buttons must use `brand` (`#3880FF`) as primary color by default, with `accent` (`#fc8019`) as secondary.
   - **All Buttons Everywhere must use `Rounded.full` (`9999px` — pills / fully rounded buttons)**, including in Alert dialogs (`customAlert`), screen action buttons, and shared UI primitives.
   - Border radius must strictly use the design tokens from `@/constants/theme`:
     - `Rounded.default` (`0px` — sharp edges)
     - `Rounded.md` (`8px` — soft UI rounding for dialogs and input boxes)
     - `Rounded.card` (`24px` — standard cards, notification cards, and alert dialogs)
     - `Rounded.full` (`9999px` — buttons, pills, chips, and circular badges)

---

## 5. Cleanup of Dummy, Placeholder, and Starter Code

Audit the repository before modifying it:
- Remove starter template components, demo text, or fake production data.
- Keep folders even if empty; add a descriptive `README.md` to preserve them.
- Provide honest, elegant empty states when features are pending real backends.

---

## 6. Code Quality & TypeScript Standards

- **TypeScript Safety**: Strict TypeScript is enabled. Avoid `any`, unsafe type casts, and broad suppressions (`@ts-ignore`).
- **Reusable UI Components**: UI components in `src/components/ui/` must be pure and prop-driven.
- **Separation of Concerns**: Keep UI presentation, state management, and business logic / API services separated.
- **Zero Secrets**: Never commit API keys, tokens, or private credentials.

---

## 7. Package Management & Dependencies

- Always install packages using:
  ```bash
  npx expo install <package>
  ```
- Do not upgrade unrelated packages or regenerate the lockfile blindly.

---

## 8. Common Commands

```bash
npx expo install <package>   # Install SDK-compatible package
npx expo start               # Start Expo dev server
npm run lint                 # Run ESLint validation
npx tsc --noEmit             # TypeScript typecheck
npx expo-doctor              # Validate project dependencies and configuration
```

Always run `npx tsc --noEmit` and `npm run lint` before declaring any task complete.

---

## 9. Required Workflow for Coding Agents

1. **Inspect** $\rightarrow$ 2. **Map** $\rightarrow$ 3. **Plan** $\rightarrow$ 4. **Implement** $\rightarrow$ 5. **Verify** $\rightarrow$ 6. **Review** $\rightarrow$ 7. **Report**.
