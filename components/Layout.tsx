import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Logo } from './Logo';
import { ChevronRight, User, CreditCard, Settings, HelpCircle, LogOut } from 'lucide-react';
import { AnimatedOutlet } from './AnimatedOutlet';
import { VpnConnectionCard } from './VpnConnectionCard';
import { BillingPlanCard } from './BillingPlanCard';
import { UsageChartCard } from './UsageChartCard';
import { PaymentHistoryCard } from './PaymentHistoryCard';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/account', label: 'Основное', icon: <User size={18} />, group: 'account' },
  { to: '/account/billing', label: 'Биллинг', icon: <CreditCard size={18} />, group: 'account' },
  { to: '/instructions', label: 'Настройка', icon: <Settings size={18} />, group: 'help' },
  { to: '/support', label: 'Поддержка', icon: <HelpCircle size={18} />, group: 'help' },
];

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  '/account': { title: 'Аккаунт', description: 'Управление аккаунтом и настройками' },
  '/account/billing': { title: 'Биллинг', description: 'Управление подпиской и платежами' },
  '/instructions': { title: 'Настройка', description: 'Активация доступа в три простых шага' },
  '/support': { title: 'Поддержка', description: 'Центр поддержки и помощи' },
  '/pay': { title: 'Оплата', description: 'Выбор и оплата тарифа' },
  '/result': { title: 'Результат', description: 'Статус оплаты' },
};

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Для HashRouter путь может быть с хешем, нормализуем его
  const pathname = location.pathname || location.hash.replace('#', '') || '/';
  
  const pageInfo = useMemo(() => {
    return PAGE_TITLES[pathname] || { title: 'Аккаунт', description: 'Управление аккаунтом и настройками' };
  }, [pathname]);

  const helpItems = NAV_ITEMS.filter(item => item.group === 'help');
  
  // Определяем, показывать ли блоки биллинга (только на страницах аккаунта)
  const showBillingBlocks = pathname === '/account' || pathname === '/account/billing';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full h-14 border-b border-border sticky top-0 bg-white/80 backdrop-blur-md z-50 flex justify-center items-center">
        <div className="w-[788px] h-full px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/account"><Logo className="w-6 h-6 text-fg-4" /></Link>
            <div className="flex items-center gap-2 text-[13px] font-medium text-fg-2">
              <ChevronRight size={14} className="opacity-30" />
              <div className="flex items-center gap-1.5 p-1 px-2 hover:bg-bg-2 rounded-full transition-colors cursor-pointer text-fg-4 font-medium">
                 <div className="w-4 h-4 bg-fg-4 rounded flex items-center justify-center">
                   <Logo className="w-2.5 h-2.5 text-white" />
                 </div>
                 <span>Аккаунт</span>
              </div>
            </div>
          </div>
          <Link to="/account" className="w-8 h-8 rounded-full overflow-hidden border border-border">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username || 'Пользователь'} />
            ) : (
              <div className="w-full h-full bg-bg-2 flex items-center justify-center text-fg-3 text-xs font-bold">
                {user?.username?.[0]?.toUpperCase() || 'П'}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Title */}
      <div className="w-full pt-16 pb-2 flex flex-col items-center gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-fg-4">
          {pageInfo.title}
        </h1>
        <p className="text-sm text-fg-2">{pageInfo.description}</p>
      </div>

      {/* Main Grid */}
      <div className="max-w-[788px] w-full mx-auto px-[20px] py-10 flex flex-col md:flex-row gap-7 flex-1">
        <aside className="w-full md:w-56 space-y-1">
          {/* Account Section */}
          <SidebarLink 
            to="/account" 
            label="Аккаунт"
            icon={<User size={18} />}
            active={pathname === '/account' || pathname.startsWith('/account')}
          />
          
          {/* Divider */}
          <div className="h-px bg-border my-4 mx-3" />
          
          {/* Help Section */}
          <div className="space-y-1">
            {helpItems.map((item) => (
              <SidebarLink 
                key={item.to}
                to={item.to} 
                label={item.label}
                icon={item.icon}
                active={pathname === item.to}
              />
            ))}
          </div>

          {/* Logout */}
          {user && (
            <>
              <div className="h-px bg-border my-4 mx-3" />
              <button
                onClick={logout}
                className="sidebar-link w-full text-left"
                aria-label="Выйти из аккаунта"
              >
                <LogOut size={18} />
                <span>Выйти</span>
              </button>
            </>
          )}
        </aside>

        <main className="flex-1 max-w-[768px]">
          <VpnConnectionCard />
          {showBillingBlocks && (
            <>
              <BillingPlanCard />
              <UsageChartCard />
              <PaymentHistoryCard />
            </>
          )}
          <AnimatedOutlet />
        </main>
      </div>

      <footer className="pt-2.5 pb-2.5 text-center border-t border-border mt-0">
         <p className="text-xs font-medium text-fg-1">© 2025 Outlivion. Простой и красивый VPN-дашборд.</p>
      </footer>
    </div>
  );
};

const SidebarLink = ({ 
  to, 
  label, 
  icon, 
  active 
}: { 
  to: string; 
  label: string; 
  icon?: React.ReactNode; 
  active: boolean;
}) => (
  <Link 
    to={to} 
    className={`sidebar-link group relative ${
      active ? 'active' : ''
    }`}
    data-active={active}
    aria-current={active ? 'page' : undefined}
  >
    {icon && (
      <span className={`shrink-0 transition-colors ${
        active ? 'text-fg-4' : 'text-fg-2 group-hover:text-fg-4'
      }`}>
        {icon}
      </span>
    )}
    <span className="flex-1 font-medium">{label}</span>
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#CE3000] rounded-r-full" 
           aria-hidden="true" />
    )}
  </Link>
);