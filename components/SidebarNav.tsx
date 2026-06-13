import React from 'react';
import { Percent, MessageCircle, LogOut, ShieldCheck, ShieldAlert, User } from 'lucide-react';
import { PageView, NavItem } from '../types';
import { Haptic } from '../utils/haptics';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useWebAuth } from '../context/WebAuthContext';
import Skeleton from './Skeleton';
import { NavHomeIcon, NavMarketsIcon, NavTradeIcon, NavWalletIcon } from './icons/MexcNavIcons';
import UnifiedMarketsRibbon from './UnifiedMarketsRibbon';
import UserAvatar from './UserAvatar';

interface SidebarNavProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
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

const SidebarNav: React.FC<SidebarNavProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  const { user, tgid, webUserId, loading } = useUser();
  const { logout } = useWebAuth();

  const navItems: NavItem[] = [
    { id: 'HOME', label: t('nav_home'), icon: NavHomeIcon },
    { id: 'COINS', label: t('nav_coins'), icon: NavMarketsIcon },
    { id: 'TRADING', label: t('nav_trading'), icon: NavTradeIcon },
    { id: 'STAKING', label: t('staking_title'), icon: Percent },
    { id: 'DEALS', label: t('nav_deals'), icon: NavWalletIcon },
  ];

  const activeNav = pageToNav[currentPage] ?? currentPage;
  const isWebUser = !!(user?.web_registered || (user?.email && !tgid));
  const displayName = user?.full_name || user?.username || (user?.email ? user.email.split('@')[0] : t('guest'));
  const balance = user?.balance ?? 0;
  const balanceLoading = Boolean(loading && (tgid || webUserId));

  return (
    <aside className="hidden lg:flex flex-col w-60 min-w-[15rem] shrink-0 sidebar-glass">
      <div className="sticky top-0 flex flex-col h-screen py-5 px-3">

        {/* Brand */}
        <div className="px-3 pb-4 mb-1 flex items-center justify-between">
          <img src="/mexc-logo.svg" alt="MEXC" className="h-6 w-auto" draggable={false} />
          <span className="live-badge"><span className="live-dot" />LIVE</span>
        </div>

        {/* User info block */}
        {user ? (
          <div className="px-3 pb-4 mb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-2.5 mb-3">
              <UserAvatar
                name={displayName}
                photoUrl={user.photo_url}
                className="w-8 h-8"
                imageClassName="border-border"
                fallbackClassName="bg-card border-border text-neon text-sm"
                iconClassName="text-neon"
                iconSize={12}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-textPrimary truncate">{displayName}</p>
                {user.email && isWebUser && (
                  <p className="text-[10px] text-textMuted truncate">{user.email}</p>
                )}
              </div>
            </div>
            <div className="mb-2.5">
              <p className="text-[10px] text-textMuted uppercase tracking-wide mb-0.5">{t('balance')}</p>
              {balanceLoading ? (
                <Skeleton className="w-24 h-5 rounded bg-card/60" />
              ) : (
                <p className="text-base font-bold text-neon font-mono">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              user.is_kyc ? 'bg-emerald-500/10 text-emerald-400' : 'bg-accentMuted text-neon'
            }`}>
              {user.is_kyc
                ? <><ShieldCheck size={10} />{t('verified')}</>
                : <><ShieldAlert size={10} />{t('verification_required')}</>
              }
            </div>
          </div>
        ) : (
          <div className="px-3 pb-4 mb-2 border-b border-white/[0.05] flex items-center gap-2">
            <User size={16} className="text-textMuted" />
            <span className="text-xs text-textMuted">{t('guest')}</span>
          </div>
        )}

        <UnifiedMarketsRibbon />

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            const isMexcSvg = item.id === 'HOME' || item.id === 'COINS' || item.id === 'TRADING' || item.id === 'DEALS';
            return (
              <button
                key={item.id}
                onClick={() => { Haptic.medium(); onNavigate(item.id); }}
                title={item.label}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
                  isActive
                    ? 'bg-accentMuted text-textPrimary'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-white/[0.06]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                  {isMexcSvg ? (
                    <Icon active={isActive} className={isActive ? 'icon-soft' : 'icon-muted'} size={20} />
                  ) : (
                    <Icon size={18} strokeWidth={1.5} className={isActive ? 'text-accent' : 'text-textMuted'} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm tracking-tight truncate block">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-0.5 pt-2 border-t border-white/[0.05]">
          <button
            type="button"
            title={t('support')}
            onClick={() => { Haptic.medium(); onNavigate('SUPPORT'); }}
            className="cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-left text-textSecondary hover:text-textPrimary hover:bg-white/[0.06] transition-colors duration-150"
          >
            <MessageCircle size={20} strokeWidth={1.5} />
            <span className="font-medium text-sm tracking-tight">{t('support')}</span>
          </button>
          {isWebUser && webUserId && (
            <button
              type="button"
              title={t('exit') || 'Выйти'}
              onClick={() => { Haptic.medium(); logout(); window.location.href = '/'; }}
              className="cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-left text-textSecondary hover:text-red-400 hover:bg-red-500/[0.06] transition-colors duration-150"
            >
              <LogOut size={20} strokeWidth={1.5} />
              <span className="font-medium text-sm tracking-tight">{t('exit') || 'Выйти'}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
