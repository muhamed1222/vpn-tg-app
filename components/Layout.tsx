import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../App';
import { Logo } from './Logo';
import { ChevronRight } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAccountActive = location.pathname.startsWith('/account');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full h-14 border-b border-border sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/account"><Logo className="w-6 h-6 text-fg-4" /></Link>
            <div className="flex items-center gap-2 text-[13px] font-medium text-fg-2">
              <ChevronRight size={14} className="opacity-30" />
              <div className="flex items-center gap-1.5 p-1 px-2 hover:bg-bg-2 rounded-full transition-colors cursor-pointer text-fg-4 font-semibold">
                 <div className="w-4 h-4 bg-fg-4 rounded flex items-center justify-center">
                   <Logo className="w-2.5 h-2.5 text-white" />
                 </div>
                 <span>Account</span>
              </div>
            </div>
          </div>
          <Link to="/account" className="w-8 h-8 rounded-full overflow-hidden border border-border">
            <img src={user?.avatar} alt="" />
          </Link>
        </div>
      </header>

      {/* Title */}
      <div className="w-full pt-16 pb-2 flex flex-col items-center gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg-4">
          {location.pathname === '/account' ? 'Account' : 'Billing'}
        </h1>
        <p className="text-sm text-fg-2">Manage your account and preferences</p>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1200px] w-full mx-auto px-6 py-10 flex flex-col md:flex-row gap-12 flex-1">
        <aside className="w-full md:w-56 space-y-1">
          <SidebarLink to="/account" label="General" active={location.pathname === '/account'} />
          <SidebarLink to="/account/billing" label="Billing" active={location.pathname === '/account/billing'} />
          <div className="h-px bg-border my-4 mx-3" />
          <SidebarLink to="/instructions" label="Setup" active={location.pathname === '/instructions'} />
          <SidebarLink to="/support" label="Support" active={location.pathname === '/support'} />
        </aside>

        <main className="flex-1 max-w-[768px]">
          <Outlet />
        </main>
      </div>

      <footer className="py-20 text-center border-t border-border mt-20">
         <p className="text-xs font-medium text-fg-1">© 2025 Outlivion. Simple, beautiful web analytics.</p>
      </footer>
    </div>
  );
};

const SidebarLink = ({ to, label, active }: { to: string, label: string, active: boolean }) => (
  <Link to={to} className="sidebar-link" data-active={active}>
    {label}
  </Link>
);