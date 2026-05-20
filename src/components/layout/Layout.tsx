import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />
      <main
        className={cn(
          'flex-1 min-w-0',
          isHome ? 'pt-28 sm:pt-[11.5rem] lg:pt-40' : 'pt-36 lg:pt-24'
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
