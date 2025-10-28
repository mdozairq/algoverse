# Theme System Documentation

## Overview

This document outlines the comprehensive theme system implemented across the NFT Marketplace project to ensure consistent theming throughout all pages and components.

## Theme Architecture

### 1. Theme Provider Setup

The theme system is built on top of `next-themes` and uses CSS custom properties for consistent theming:

```tsx
// app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <ThemeWrapper>
    {/* App content */}
  </ThemeWrapper>
</ThemeProvider>
```

### 2. CSS Custom Properties

All theme colors are defined using CSS custom properties in `app/globals.css`:

```css
:root {
  --background: 0 0% 98%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### 3. Tailwind Configuration

The Tailwind config maps CSS custom properties to Tailwind classes:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ... other colors
    },
  },
}
```

## Theme Utilities

### 1. CSS Utility Classes

The system provides comprehensive utility classes in `app/globals.css`:

#### Background Utilities
```css
.bg-theme-primary { @apply bg-white dark:bg-gray-900; }
.bg-theme-secondary { @apply bg-gray-50 dark:bg-gray-800; }
.bg-theme-tertiary { @apply bg-gray-100 dark:bg-gray-700; }
```

#### Text Utilities
```css
.text-theme-primary { @apply text-gray-900 dark:text-white; }
.text-theme-secondary { @apply text-gray-600 dark:text-gray-300; }
.text-theme-muted { @apply text-gray-500 dark:text-gray-400; }
```

#### Border Utilities
```css
.border-theme { @apply border-gray-200 dark:border-gray-700; }
.border-theme-light { @apply border-gray-100 dark:border-gray-800; }
```

#### Component Utilities
```css
.card-theme { @apply bg-card text-card-foreground border border-border rounded-lg shadow-sm; }
.btn-theme-primary { @apply bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2; }
.input-theme { @apply border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none; }
```

### 2. TypeScript Theme Utilities

The `lib/theme-utils.ts` file provides TypeScript utilities for consistent theming:

```typescript
import { themeUtils } from '@/lib/theme-utils'

// Usage examples
const cardClasses = themeUtils.components.card
const buttonClasses = themeUtils.components.buttonPrimary
const textClasses = themeUtils.classes.text.primary
```

## Best Practices

### 1. Use CSS Custom Properties

**✅ Good:**
```tsx
<div className="bg-background text-foreground border-border">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

**❌ Avoid:**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
  <h1 className="text-gray-900 dark:text-white">Title</h1>
  <p className="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

### 2. Use Theme Utility Classes

**✅ Good:**
```tsx
<Card className="card-theme">
  <CardHeader className="card-theme-header">Title</CardHeader>
  <CardContent className="card-theme-content">Content</CardContent>
</Card>
```

**❌ Avoid:**
```tsx
<Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
  <CardHeader className="text-gray-900 dark:text-white text-lg font-semibold">Title</CardHeader>
  <CardContent className="text-gray-600 dark:text-gray-300 text-sm">Content</CardContent>
</Card>
```

### 3. Consistent Component Patterns

#### Cards
```tsx
<div className="card-theme p-4">
  <h3 className="card-theme-header">Card Title</h3>
  <p className="card-theme-content">Card content goes here</p>
</div>
```

#### Buttons
```tsx
<Button className="btn-theme-primary">Primary Button</Button>
<Button className="btn-theme-outline">Outline Button</Button>
<Button className="btn-theme-ghost">Ghost Button</Button>
```

#### Form Elements
```tsx
<input className="input-theme" placeholder="Enter text..." />
<select className="select-theme">
  <option>Option 1</option>
</select>
```

#### Navigation
```tsx
<nav className="flex space-x-4">
  <Link href="/" className="nav-theme-link">Home</Link>
  <Link href="/about" className="nav-theme-link nav-theme-link-active">About</Link>
</nav>
```

## Component Updates Made

### 1. Theme Wrapper
- Updated to use `bg-background text-foreground` instead of hardcoded colors
- Ensures consistent theme application across the app

### 2. Dashboard Layout
- Replaced all hardcoded color classes with theme-aware classes
- Updated sidebar, header, and dropdown components
- Consistent hover states and focus states

### 3. Header Component
- Updated navigation links to use theme utilities
- Consistent button styling and dropdown menus
- Mobile menu theming

### 4. Marketplace Components
- Updated marketplace header and footer
- Consistent color usage throughout
- Theme-aware badges and buttons

### 5. Main Pages
- Updated homepage CTA section
- Marketplace page card styling
- Consistent background and text colors

## Migration Guide

### For Existing Components

1. **Replace hardcoded colors:**
   ```tsx
   // Before
   className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
   
   // After
   className="bg-card text-card-foreground"
   ```

2. **Use theme utilities:**
   ```tsx
   // Before
   className="border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
   
   // After
   className="border-border hover:bg-accent"
   ```

3. **Apply component classes:**
   ```tsx
   // Before
   className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4"
   
   // After
   className="card-theme p-4"
   ```

## Testing Theme Consistency

### 1. Visual Testing
- Test all components in both light and dark modes
- Verify hover states and focus states
- Check contrast ratios for accessibility

### 2. Automated Testing
- Use CSS custom property values in tests
- Verify theme switching functionality
- Test responsive behavior

### 3. Accessibility Testing
- Ensure proper contrast ratios
- Test with screen readers
- Verify focus indicators

## Future Enhancements

1. **Theme Customization**
   - Allow users to customize accent colors
   - Support for multiple theme variants
   - Brand-specific theming for marketplaces

2. **Performance Optimizations**
   - CSS-in-JS optimizations
   - Theme preloading
   - Reduced bundle size

3. **Advanced Features**
   - System theme detection
   - Theme persistence
   - Smooth transitions between themes

## Conclusion

The theme system provides a robust foundation for consistent theming across the entire application. By using CSS custom properties, utility classes, and TypeScript utilities, we ensure that all components maintain visual consistency while supporting both light and dark modes.

For any questions or issues with the theme system, refer to this documentation or contact the development team.
