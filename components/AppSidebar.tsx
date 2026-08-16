import Link from 'next/link';

type SidebarItem = {
  label: string;
  href: string;
  icon: string;
};

type AppSidebarProps = {
  activePath: string;
};

const navItems: SidebarItem[] = [
  { label: 'Home', href: '/app', icon: '🏠' },
  { label: 'Profile', href: '/app/profile', icon: '👤' },
  { label: 'History', href: '/app/profile', icon: '📜' },
  { label: 'Author', href: '/app/profile', icon: '✍️' },
  { label: 'Notifications', href: '/app/profile', icon: '🔔' },
  { label: 'Help', href: '/app/verify', icon: '❓' },
  { label: 'Settings', href: '/app/profile', icon: '⚙️' },
];

export default function AppSidebar({ activePath }: AppSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <strong>Wallet Menu</strong>
        <p>Access your account pages from one sidebar.</p>
      </div>

      <nav className="sidebar-nav" aria-label="App navigation">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-link${activePath === item.href ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
