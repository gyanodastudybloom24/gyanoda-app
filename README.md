# Gyanoda Mobile App

Gyanoda is a modern, mobile-first learning platform built with Expo and React Native, featuring cross-platform support for iOS, Android, and Web.

---

## 🎨 UI & Design System

The application uses a custom design system with curated theme tokens and smooth animations powered by `react-native-reanimated`.

### 🚨 Mandatory Alert Rule
> **IMPORTANT: Strictly use Custom Alert instead of Native Alert.**
> **Never import or call React Native's `Alert.alert`**.
> Always use `customAlert` (or `useAlert()`) from `@/components/ui`:
>
> ```tsx
> import { customAlert } from '@/components/ui';
>
> customAlert.show({
>   title: 'Save Progress?',
>   message: 'Your study module will be synced.',
>   type: 'confirm', // 'info' | 'success' | 'warning' | 'error' | 'confirm'
>   buttons: [
>     { text: 'Cancel', style: 'cancel' },
>     { text: 'Confirm', style: 'primary', onPress: () => handleSave() },
>   ],
> });
> ```

### 🧩 Core Reusable UI Components (`src/components/ui/`)

- **`Button`**: Reusable button with spring press animations via Reanimated. Defaults to primary brand color (`#3880FF`). Supports `primary`, `secondary` (`#fc8019`), `outline`, `ghost`, and `destructive` variants, sizes (`sm`, `md`, `lg`), and `Rounded` tokens.
- **`Card`**: Structured card container (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) with `Rounded.md` (`8px`) soft rounding and optional press feedback.
- **`Toggle`**: Reusable switch component with animated sliding thumb and smooth color transitions using `react-native-reanimated`.
- **`Collapsible`**: Animated expandable accordion section.
- **`AlertProvider` & `InlineAlert`**: Global custom alert modal system with animated backdrop and spring scale entrance.

### ☀️ Icon Library: Solar Icons
- Icons are powered by **Solar Icons** (`@/components/icons` / `react-native-solar-icons`).
- Do **not** use `lucide-react`, `lucide-react-native`, or raw `@expo/vector-icons`.
- Example usage:
  ```tsx
  import { SolarIcon } from '@/components/icons';

  <SolarIcon name="Home2" type="bold" size={24} themeColor="brand" />
  ```

### 📐 Design Tokens (`src/constants/theme.ts`)
- **Colors**:
  - Brand (Primary): `#3880FF` (gradient to `#5190FF`)
  - Accent / Secondary: `#fc8019`
  - Background: `#ffffff` (Dark: `#121212`)
  - Foreground / Text: `#282c3f` (Dark: `#e9e9eb`)
  - Muted: `#686b78`
  - Border: `#e9e9eb` (Dark: `#282c3f`)
  - Card: `#ffffff` (Dark: `#1a1d29`)
- **Border Radius**:
  - `Rounded.default`: `0px` (sharp edges)
  - `Rounded.md`: `8px` (soft UI rounding)
  - `Rounded.card`: `24px` (standard cards, notification cards, alert dialogs)
  - `Rounded.full`: `9999px` (pills and circles)
- **Typography**:
  - `fontFamily.sans`: `Basis Grotesque Pro, system-ui, sans-serif`
  - `body`: `fontSize: 14px`, `lineHeight: 1.4`
  - `heading`: `fontWeight: 700`, `letterSpacing: -0.02em`

---

## 🧭 Navigation: React Navigation Only

This project strictly uses **React Navigation** (`@react-navigation/*`). Expo Router is not used.

- Root stack: `src/app/navigation/RootNavigator.tsx`
- Bottom tabs: `src/app/navigation/MainTabNavigator.tsx`
- Parameter types: `src/types/navigation.ts`

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npx expo start
   ```

3. **Validation & Quality Checks**:
   ```bash
   npx tsc --noEmit    # TypeScript typecheck
   npm run lint        # ESLint validation
   npx expo-doctor     # Expo configuration & dependency check
   ```
