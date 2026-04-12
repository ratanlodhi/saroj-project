import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col paper-texture overflow-x-hidden">
      <Header />
      <main className="flex-1 min-w-0 pt-36 lg:pt-24">{children}</main>
      <Footer />
    </div>
  );
}
