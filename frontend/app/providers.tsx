'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { XPRewardProvider } from '@/contexts/xp-reward-context'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <XPRewardProvider>
          {children}
        </XPRewardProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}