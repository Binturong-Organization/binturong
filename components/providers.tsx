'use client';
import { ThemeProvider } from 'next-themes';
import { SWRConfig } from 'swr';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
}
