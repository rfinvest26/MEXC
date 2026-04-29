import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import BottomNav from './BottomNav';
import SidebarNav from './SidebarNav';
import { PageView } from '../types';
import { useKeyboard } from '../context/KeyboardContext';
import { Haptic } from '../utils/haptics';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  hideNavigation?: boolean;
}

const PAGES_WITHOUT_BOTTOM_NAV: PageView[] = ['KYC', 'CURRENCY', 'LANGUAGE', 'SUPPORT', 'CALL'];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, hideNavigation = false }) => {
  const { keyboardOpen, keyboardOffset } = useKeyboard();
  const hideBottomNav = PAGES_WITHOUT_BOTTOM_NAV.includes(currentPage) || keyboardOpen || hideNavigation;
  const pageHasOwnScroll = currentPage === 'SUPPORT';
  const [p2pSummary, setP2pSummary] = useState<{
    amount: number;
    currency: string;
    status: 'waiting' | 'payment';
    timeLeft?: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = 'etoro_active_p2p_deal';

    const readFromStorage = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setP2pSummary(null);
          return;
        }
        const stored = JSON.parse(raw) as {
          amount?: number;
          currency?: string;
          status?: string;
          paymentDeadline?: number | string;
          waitDeadline?: number | string;
        };
        const amount = Number(stored.amount || 0);
        if (!amount) {
          setP2pSummary(null);
          return;
        }
        const currency = stored.currency || 'RUB';
        const paymentDeadline = Number(stored.paymentDeadline);
        const waitDeadline = Number(stored.waitDeadline);
        if (stored.status === 'awaiting_payment' && Number.isFinite(paymentDeadline) && paymentDeadline > 0) {
          const now = Date.now();
          const left = Math.max(0, Math.floor((paymentDeadline - now) / 1000));
          setP2pSummary({
            amount,
            currency,
            status: 'payment',
            timeLeft: left,
          });
        } else {
          const now = Date.now();
          const left = Number.isFinite(waitDeadline) && waitDeadline > 0 ? Math.max(0, Math.floor((waitDeadline - now) / 1000)) : undefined;
          setP2pSummary({
            amount,
            currency,
            status: 'waiting',
            timeLeft: left,
          });
        }
      } catch {
        setP2pSummary(null);
      }
    };

    readFromStorage();
    const id = window.setInterval(readFromStorage, 1000);
    return () => window.clearInterval(id);
  }, []);

  const hasActiveP2P = !!p2pSummary;
  const mainPaddingBottom = keyboardOffset > 0 ? keyboardOffset + 16 : undefined;
  const effectiveMainPaddingBottom =
    !hideBottomNav && mainPaddingBottom != null ? mainPaddingBottom : undefined;
  const formatMmSs = (s: number) => {
    const mm = Math.max(0, Math.floor(s / 60)).toString().padStart(2, '0');
    const ss = Math.max(0, s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div
      className="h-screen min-h-[100dvh] bg-background text-white flex flex-col lg:flex-row relative overflow-hidden"
      style={{
        height: 'var(--app-viewport-height, 100dvh)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {!hideBottomNav && <SidebarNav currentPage={currentPage} onNavigate={onNavigate} />}

      <main
        className={`flex-1 w-full relative z-10 no-scrollbar scroll-smooth overscroll-contain scroll-app transition-[padding] duration-150
          max-w-md lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto
          ${hideBottomNav ? 'pb-2' : 'pb-20 lg:pb-8'}
          ${pageHasOwnScroll ? 'overflow-hidden flex flex-col min-h-0' : 'overflow-y-auto'}
        `}
        style={effectiveMainPaddingBottom != null ? { paddingBottom: effectiveMainPaddingBottom } : undefined}
      >
        {pageHasOwnScroll ? <div className="flex-1 min-h-0">{children}</div> : children}
        {!hideBottomNav && currentPage === 'PROFILE' && (
          <button
            type="button"
            onClick={() => { Haptic.tap(); onNavigate('SUPPORT'); }}
            className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 h-12 w-12 rounded-full bg-surfaceElevated/95 text-textPrimary shadow-lg shadow-black/40 flex items-center justify-center active:scale-95 transition-transform hover:bg-card"
            aria-label="Чат поддержки"
          >
            <MessageCircle size={22} strokeWidth={2} />
          </button>
        )}
      </main>

          {!hideBottomNav && (
        <div
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-200 ease-out ${
            keyboardOpen ? 'translate-y-full pointer-events-none' : 'translate-y-0'
          }`}
          >
        {hasActiveP2P && currentPage !== 'DEPOSIT' && p2pSummary && (
            <button
              onClick={() => {
                Haptic.tap();
                onNavigate('DEPOSIT');
              }}
              className="mx-3 mb-2 mt-1 w-auto rounded-2xl bg-neon/10 text-neon text-xs font-semibold px-3 py-1.5 flex items-center justify-center gap-2 hairline-top hairline-bottom"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
              <span className="truncate">
                {p2pSummary.status === 'payment'
                  ? `Реквизиты получены · Оплатить ${p2pSummary.amount.toLocaleString('ru-RU')} ${p2pSummary.currency}`
                  : `Ожидаем подтверждение продавца · ${p2pSummary.amount.toLocaleString('ru-RU')} ${p2pSummary.currency}`}
              </span>
              {typeof p2pSummary.timeLeft === 'number' && (
                <span className="ml-1 text-xs font-mono flex items-center gap-1 text-textPrimary">
                  ⏱ {formatMmSs(p2pSummary.timeLeft)}
                </span>
              )}
            </button>
          )}
          <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
};

export default Layout;