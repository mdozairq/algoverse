export interface MarketplaceTheme {
  primaryColor: string
  secondaryColor: string
  template: 'modern' | 'classic' | 'minimal' | 'creative'
  customCSS?: string
}

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

export function generateThemeConfig(theme: MarketplaceTheme): ThemeConfig {
  const baseConfig: ThemeConfig = {
    colors: {
      primary: theme.primaryColor,
      secondary: theme.secondaryColor,
      accent: lightenColor(theme.primaryColor, 20),
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
    },
    typography: {
      fontFamily: getFontFamily(theme.template),
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: getBorderRadius(theme.template),
    shadows: getShadows(theme.template),
  }

  return baseConfig
}

export function generateCSSVariables(themeConfig: ThemeConfig): string {
  return `
    :root {
      --color-primary: ${themeConfig.colors.primary};
      --color-secondary: ${themeConfig.colors.secondary};
      --color-accent: ${themeConfig.colors.accent};
      --color-background: ${themeConfig.colors.background};
      --color-surface: ${themeConfig.colors.surface};
      --color-text: ${themeConfig.colors.text};
      --color-text-secondary: ${themeConfig.colors.textSecondary};
      
      --font-family: ${themeConfig.typography.fontFamily};
      --font-size-xs: ${themeConfig.typography.fontSize.xs};
      --font-size-sm: ${themeConfig.typography.fontSize.sm};
      --font-size-base: ${themeConfig.typography.fontSize.base};
      --font-size-lg: ${themeConfig.typography.fontSize.lg};
      --font-size-xl: ${themeConfig.typography.fontSize.xl};
      --font-size-2xl: ${themeConfig.typography.fontSize['2xl']};
      --font-size-3xl: ${themeConfig.typography.fontSize['3xl']};
      
      --font-weight-normal: ${themeConfig.typography.fontWeight.normal};
      --font-weight-medium: ${themeConfig.typography.fontWeight.medium};
      --font-weight-semibold: ${themeConfig.typography.fontWeight.semibold};
      --font-weight-bold: ${themeConfig.typography.fontWeight.bold};
      
      --spacing-xs: ${themeConfig.spacing.xs};
      --spacing-sm: ${themeConfig.spacing.sm};
      --spacing-md: ${themeConfig.spacing.md};
      --spacing-lg: ${themeConfig.spacing.lg};
      --spacing-xl: ${themeConfig.spacing.xl};
      
      --border-radius-sm: ${themeConfig.borderRadius.sm};
      --border-radius-md: ${themeConfig.borderRadius.md};
      --border-radius-lg: ${themeConfig.borderRadius.lg};
      --border-radius-xl: ${themeConfig.borderRadius.xl};
      
      --shadow-sm: ${themeConfig.shadows.sm};
      --shadow-md: ${themeConfig.shadows.md};
      --shadow-lg: ${themeConfig.shadows.lg};
      --shadow-xl: ${themeConfig.shadows.xl};
    }
  `
}

export function generateComponentStyles(themeConfig: ThemeConfig): string {
  return `
    .marketplace-button {
      background-color: var(--color-primary);
      color: white;
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-md);
      font-family: var(--font-family);
      font-weight: var(--font-weight-medium);
      transition: all 0.2s ease;
    }
    
    .marketplace-button:hover {
      background-color: var(--color-accent);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .marketplace-card {
      background-color: var(--color-surface);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .marketplace-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    
    .marketplace-header {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-lg);
    }
    
    .marketplace-text-primary {
      color: var(--color-text);
      font-family: var(--font-family);
    }
    
    .marketplace-text-secondary {
      color: var(--color-text-secondary);
      font-family: var(--font-family);
    }
    
    .marketplace-input {
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm) var(--spacing-md);
      font-family: var(--font-family);
      transition: border-color 0.2s ease;
    }
    
    .marketplace-input:focus {
      border-color: var(--color-primary);
      outline: none;
      box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
    }
  `
}

function getFontFamily(template: string): string {
  switch (template) {
    case 'modern':
      return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    case 'classic':
      return '"Times New Roman", Times, serif'
    case 'minimal':
      return '"Helvetica Neue", Helvetica, Arial, sans-serif'
    case 'creative':
      return '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif'
    default:
      return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
}

function getBorderRadius(template: string) {
  switch (template) {
    case 'modern':
      return {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      }
    case 'classic':
      return {
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
      }
    case 'minimal':
      return {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      }
    case 'creative':
      return {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      }
    default:
      return {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      }
  }
}

function getShadows(template: string) {
  switch (template) {
    case 'modern':
      return {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    case 'classic':
      return {
        sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        md: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        lg: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
      }
    case 'minimal':
      return {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 1px 3px rgba(0, 0, 0, 0.1)',
        lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
        xl: '0 10px 15px rgba(0, 0, 0, 0.1)',
      }
    case 'creative':
      return {
        sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
        md: '0 4px 8px rgba(0, 0, 0, 0.15)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.25)',
      }
    default:
      return {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
  }
}

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}
