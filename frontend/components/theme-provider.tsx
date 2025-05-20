'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Ensure smooth transitions by setting a small delay for theme changes
  React.useEffect(() => {
    document.documentElement.classList.add('transition-colors');
    document.documentElement.classList.add('duration-300');
    
    return () => {
      document.documentElement.classList.remove('transition-colors');
      document.documentElement.classList.remove('duration-300');
    }
  }, []);
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
