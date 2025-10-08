'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { DashboardProvider } from '@/lib/contexts/DashboardContext';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 2,
            refetchInterval: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
