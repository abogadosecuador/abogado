// Configuración de tema y paleta de colores profesional
export const theme = {
  colors: {
    // Colores primarios - Azul profesional
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Colores secundarios - Verde éxito
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    // Grises neutros
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    // Colores de estado
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    // Colores específicos
    gold: '#fbbf24',
    purple: '#8b5cf6',
    indigo: '#6366f1',
  },
  // Gradientes profesionales
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #13B497 0%, #22c55e 100%)',
    premium: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
    dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  // Sombras profesionales
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    card: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08)',
    button: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    floating: '0 10px 40px rgba(0,0,0,0.15)',
  },
  // Bordes redondeados
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  // Transiciones
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
    slower: '500ms ease-in-out',
  },
  // Espaciado
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },
  // Tipografía
  typography: {
    fonts: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: '"Merriweather", Georgia, Cambria, "Times New Roman", Times, serif',
      mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },
};

// Funciones helper para aplicar tema
export const getColor = (colorPath) => {
  const keys = colorPath.split('.');
  let value = theme.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getGradient = (gradientName) => {
  return theme.gradients[gradientName] || theme.gradients.primary;
};

export const getShadow = (shadowName) => {
  return theme.shadows[shadowName] || theme.shadows.base;
};

export default theme;
