import React from 'react';
import { PageView, NavItem } from '../types';
import { Haptic } from '../utils/haptics';
import { useLanguage } from '../context/LanguageContext';
import { NavHomeIcon, NavMarketsIcon, NavTradeIcon, NavWalletIcon } from './icons/MexcNavIcons';

interface BottomNavProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  embedded?: boolean;
}

const pageToNav: Partial<Record<PageView, PageView>> = {
  DEPOSIT: 'HOME',
  WITHDRAW: 'HOME',
  PROFILE: 'HOME',
  KYC: 'HOME',
  SUPPORT: 'HOME',
  LANGUAGE: 'HOME',
  CURRENCY: 'HOME',
  QR_SCANNER: 'HOME',
  NFT_COLLECTION: 'COINS',
  NFT_ITEM: 'COINS',
};

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, embedded = false }) => {
  const { t } = useLanguage();
  const navItems: NavItem[] = [
    { id: 'HOME',    label: t('nav_home'),    icon: NavHomeIcon },
    { id: 'COINS',   label: t('nav_coins'),   icon: NavMarketsIcon },
    { id: 'TRADING', label: t('nav_trading'), icon: NavTradeIcon },
    { id: 'DEALS',   label: t('nav_deals'),   icon: NavWalletIcon },
  ];

  const activeNav = pageToNav[currentPage] ?? currentPage;

  const navBody = (
    <div className="flex items-stretch min-h-[52px] px-1">
      {navItems.map((item) => {
        const isActive = activeNav === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => { Haptic.medium(); onNavigate(item.id); }}
            className={`relative flex flex-col items-center justify-center flex-1 min-w-0 py-2 gap-1 transition-colors ${
              isActive ? 'text-accent' : 'text-textSubtle'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon active={isActive} size={21} />
            <span className={`text-[9.5px] font-medium leading-none ${isActive ? 'text-accent' : 'text-textSubtle'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  if (embedded) {
    return <nav className="relative z-50">{navBody}</nav>;
  }

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-50 nav-glass"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navBody}
    </nav>
  );
};

export default BottomNav;
