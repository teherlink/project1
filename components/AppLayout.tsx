import type { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

type AppLayoutProps = {
  activePath: string;
  title?: string;
  children: ReactNode;
};

export default function AppLayout({ activePath, title, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <AppSidebar activePath={activePath} />
      <main className="app-main">
        {title ? <div className="app-page-title"><h1>{title}</h1></div> : null}
        {children}
      </main>
    </div>
  );
}
