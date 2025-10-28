/**
 * Theme utility functions and constants for consistent theming across the application
 */

// Theme-aware CSS class mappings
export const themeClasses = {
  // Backgrounds
  background: {
    primary: 'bg-background',
    secondary: 'bg-card',
    tertiary: 'bg-muted',
    accent: 'bg-accent',
    primarySolid: 'bg-primary',
  },
  
  // Text colors
  text: {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    accent: 'text-accent-foreground',
    primarySolid: 'text-primary-foreground',
    destructive: 'text-destructive',
  },
  
  // Borders
  border: {
    default: 'border-border',
    light: 'border-border/50',
    accent: 'border-accent',
  },
  
  // Hover states
  hover: {
    background: 'hover:bg-accent',
    text: 'hover:text-foreground',
    border: 'hover:border-border',
  },
  
  // Focus states
  focus: {
    ring: 'focus:ring-2 focus:ring-ring focus:ring-offset-2',
    outline: 'focus:outline-none',
  },
  
  // Interactive elements
  interactive: {
    button: 'bg-primary text-primary-foreground hover:bg-primary/90',
    buttonOutline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    buttonGhost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary hover:text-primary/80 underline-offset-4 hover:underline',
  },
  
  // Layout
  layout: {
    container: 'container-responsive',
    card: 'bg-card border border-border rounded-lg shadow-sm',
    section: 'py-16 sm:py-24 px-4 sm:px-6 lg:px-8',
  },
  
  // Spacing
  spacing: {
    responsive: 'p-4 sm:p-6 lg:p-8',
    responsiveX: 'px-4 sm:px-6 lg:px-8',
    responsiveY: 'py-4 sm:py-6 lg:py-8',
  },
  
  // Grid layouts
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
    responsive2: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
    responsive3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  },
} as const

// Common component class combinations
export const componentClasses = {
  // Cards
  card: `${themeClasses.layout.card} ${themeClasses.spacing.responsive}`,
  cardHeader: `${themeClasses.text.primary} text-lg font-semibold`,
  cardContent: `${themeClasses.text.secondary} text-sm`,
  
  // Buttons
  buttonPrimary: `${themeClasses.interactive.button} px-4 py-2 rounded-md font-medium transition-colors`,
  buttonSecondary: `${themeClasses.interactive.buttonOutline} px-4 py-2 rounded-md font-medium transition-colors`,
  buttonGhost: `${themeClasses.interactive.buttonGhost} px-4 py-2 rounded-md font-medium transition-colors`,
  
  // Form elements
  input: `${themeClasses.background.primary} ${themeClasses.border.default} ${themeClasses.text.primary} ${themeClasses.focus.ring} ${themeClasses.focus.outline} px-3 py-2 rounded-md`,
  select: `${themeClasses.background.primary} ${themeClasses.border.default} ${themeClasses.text.primary} ${themeClasses.focus.ring} ${themeClasses.focus.outline} px-3 py-2 rounded-md`,
  
  // Navigation
  navLink: `${themeClasses.text.secondary} ${themeClasses.hover.text} font-medium transition-colors`,
  navLinkActive: `${themeClasses.text.primary} font-medium`,
  
  // Headers
  h1: `${themeClasses.text.primary} text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight`,
  h2: `${themeClasses.text.primary} text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight`,
  h3: `${themeClasses.text.primary} text-xl sm:text-2xl font-semibold`,
  h4: `${themeClasses.text.primary} text-lg font-semibold`,
  
  // Text
  body: `${themeClasses.text.primary} text-base`,
  bodySecondary: `${themeClasses.text.secondary} text-sm`,
  caption: `${themeClasses.text.secondary} text-xs`,
  
  // Badges
  badge: `${themeClasses.background.secondary} ${themeClasses.text.primary} ${themeClasses.border.default} px-2 py-1 rounded-full text-xs font-medium`,
  badgePrimary: `${themeClasses.background.primarySolid} ${themeClasses.text.primarySolid} px-2 py-1 rounded-full text-xs font-medium`,
  
  // Dividers
  divider: `${themeClasses.border.default} border-t`,
  
  // Loading states
  skeleton: `${themeClasses.background.tertiary} animate-pulse rounded`,
  
  // Error states
  error: `${themeClasses.text.destructive} text-sm`,
  errorBackground: `${themeClasses.background.secondary} ${themeClasses.border.default} border-l-4 border-l-destructive p-4 rounded-r-md`,
} as const

// Theme-aware color utilities for dynamic styling
export const getThemeAwareColor = (color: string, opacity: number = 1) => {
  return `hsl(var(--${color}) / ${opacity})`
}

// Common animation classes
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideDown: 'animate-in slide-in-from-top-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  stagger: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
} as const

// Responsive breakpoint utilities
export const breakpoints = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  '2xl': '2xl:',
} as const

// Common shadow utilities
export const shadows = {
  sm: 'shadow-sm',
  default: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
} as const

// Common border radius utilities
export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  default: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

// Export all utilities as a single object for easy destructuring
export const themeUtils = {
  classes: themeClasses,
  components: componentClasses,
  animations,
  breakpoints,
  shadows,
  borderRadius,
  getThemeAwareColor,
} as const

export default themeUtils
