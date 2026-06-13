import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AssetTable from '../components/AssetTable';
import Skeleton from '../components/Skeleton';
import { MOCK_ASSETS } from '../constants';
import { Asset, PageView, type NavigateToTradingOptions } from '../types';
import { useLiveAssets } from '../utils/useLiveAssets';
import {
  Headphones,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Scan,
  User,
  Plus,
} from 'lucide-react';
import { Haptic } from '../utils/haptics';
import { useCurrency } from '../context/CurrencyContext';
import { useHideOnScroll } from '../utils/useHideOnScroll';
import { supabase } from '../lib/supabase';
import BottomSheet from '../components/BottomSheet';
import CryptoBannerWidget from '../components/CryptoBannerWidget';
import UserAvatar from '../components/UserAvatar';

interface HomePageProps {
  balance: number;
  balanceLoading?: boolean;
  user: import('../context/UserContext').DbUser | null;
  onNavigateToTrading: (asset: Asset, options?: NavigateToTradingOptions) => void;
  onSearch: () => void;
  onNavigate: (page: PageView) => void;
  onCurrencyClick?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  balance,
  balanceLoading = false,
  user,
  onNavigateToTrading,
  onSearch,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { formatPrice, currencyCode } = useCurrency();
  const liveAssets = useLiveAssets(MOCK_ASSETS);

  const topBarHidden = useHideOnScroll();
  const prevBalance = useRef<number | null>(null);
  const [balanceFlash, setBalanceFlash] = useState('');

  useEffect(() => {
    if (prevBalance.current !== null && prevBalance.current !== balance) {
      const cls = balance > prevBalance.current ? 'value-flash-up' : 'value-flash-down';
      setBalanceFlash(cls);
      const id = window.setTimeout(() => setBalanceFlash(''), 350);
      prevBalance.current = balance;
      return () => window.clearTimeout(id);
    }
    prevBalance.current = balance;
  }, [balance]);

  const totalAssetsText = useMemo(() => {
    const n = Number(balance);
    if (!Number.isFinite(n) || n <= 0) return '0';
    return formatPrice(n, { fractionDigits: n < 1 ? 4 : 0 });
  }, [balance, formatPrice]);

  const [promoTick, setPromoTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setPromoTick((v) => (v + 1) % 1000), 3500);
    return () => window.clearInterval(id);
  }, []);

  const [workerEvent, setWorkerEvent] = useState<{
    title: string;
    bonus: string | null;
    body: string;
    image_url: string;
  } | null>(null);
  const [eventOpen, setEventOpen] = useState(false);

  useEffect(() => {
    const wid = user?.referrer_id;
    if (!wid) { setWorkerEvent(null); return; }
    supabase
      .from('worker_events')
      .select('title, bonus, body, image_url')
      .eq('worker_id', wid)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) return;
        const row = (data as any[])?.[0];
        if (row?.image_url && row?.title && row?.body) {
          setWorkerEvent(row);
        } else {
          setWorkerEvent(null);
        }
      });
  }, [user?.user_id, user?.referrer_id, promoTick]);

  const promoTickers = useMemo(() => {
    const symbols = ['BTC', 'ETH', 'SOL'];
    return symbols.map((sym) => {
      const a = liveAssets.find((x) => x.ticker === sym);
      return { sym, price: a?.price ?? null, change: a?.change24h ?? null };
    });
  }, [liveAssets]);

  const quickActions = [
    { label: t('deposit'), Icon: ArrowDownLeft, primary: true, onClick: () => onNavigate('DEPOSIT') },
    { label: t('quick_withdraw'), Icon: ArrowUpRight, primary: false, onClick: () => onNavigate('WITHDRAW') },
    { label: t('quick_scan'), Icon: Scan, primary: false, onClick: () => onNavigate('QR_SCANNER') },
    { label: t('profile'), Icon: User, primary: false, onClick: () => onNavigate('PROFILE') },
  ];

  return (
    <div className="flex flex-col min-h-full animate-fade-in px-4 lg:px-6 lg:max-w-5xl mx-auto pb-28 lg:pb-8">

      {/* Top bar */}
      <header
        className={[
          'sticky top-0 z-40 -mx-4 lg:-mx-6 px-4 lg:px-6',
          'pt-2 pb-1.5',
          'bg-background',
          'hairline-bottom',
          'transition-transform duration-200',
          topBarHidden ? '-translate-y-full' : 'translate-y-0',
        ].join(' ')}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { Haptic.tap(); onNavigate('PROFILE'); }}
            className="touch-target h-9 w-9 rounded-xl flex items-center justify-center hover:bg-surfaceElevated active:scale-95 transition-all shrink-0"
            aria-label={t('profile')}
          >
            <UserAvatar
              name={user?.full_name || user?.username || user?.email || t('profile')}
              photoUrl={user?.photo_url}
              className="h-7 w-7"
              imageClassName="border-border"
              fallbackClassName="bg-surface border-border text-textSecondary text-[10px]"
              iconClassName="text-textSecondary"
              iconSize={12}
            />
          </button>

          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => { Haptic.tap(); onSearch(); }}
              className="w-full h-9 rounded-xl bg-surface flex items-center gap-2 px-3 text-left active:scale-[0.99] transition-transform"
            >
              <Search size={14} className="text-textMuted shrink-0" />
              <span className="text-xs text-textMuted font-medium truncate">{t('search')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => { Haptic.tap(); onNavigate('SUPPORT'); }}
            className="touch-target h-9 w-9 rounded-xl flex items-center justify-center hover:bg-surfaceElevated active:scale-95 transition-all text-textMuted hover:text-textPrimary"
            aria-label={t('support')}
          >
            <Headphones size={18} />
          </button>
        </div>
      </header>

      {/* Balance + Deposit */}
      <section className="pt-4 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-textMuted text-xs font-medium">{t('home_total_assets')}</span>
            <div className="flex items-baseline gap-2">
              {balanceLoading ? (
                <Skeleton className="w-32 h-9 rounded-lg bg-surface" />
              ) : (
                <span className={`text-[32px] font-bold tracking-tight text-ink tabular-nums leading-none rounded-lg ${balanceFlash}`}>
                  {totalAssetsText}
                </span>
              )}
              <span className="text-sm font-semibold text-textMuted uppercase tracking-wider">{currencyCode}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { Haptic.tap(); onNavigate('DEPOSIT'); }}
            className="touch-target exchange-btn exchange-btn-primary px-5 h-10 rounded-xl text-sm font-semibold active:scale-[0.97] flex items-center justify-center shrink-0 mt-1"
          >
            {t('deposit')}
          </button>
        </div>
      </section>

      {/* Quick actions */}
      <section className="pb-6">
        <div className="grid grid-cols-4 gap-1">
          {quickActions.map(({ label, Icon, primary, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={() => { Haptic.tap(); onClick(); }}
              className="touch-target flex flex-col items-center justify-center gap-2 active:scale-[0.94] transition-transform py-1"
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                primary ? 'bg-neon text-black' : 'bg-surface hover:bg-surfaceElevated text-textPrimary'
              }`}>
                <Icon size={18} />
              </div>
              <span className="text-[11px] text-textSecondary font-medium tracking-tight text-center leading-none">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Desktop two-column */}
      <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-5 lg:items-start">

        {/* Promo / special offer */}
        <section className="pb-5">
          <button
            type="button"
            onClick={() => {
              Haptic.tap();
              if (workerEvent) { setEventOpen(true); return; }
              try { localStorage.removeItem('mexc_active_p2p_deal'); } catch {}
              try { localStorage.removeItem('mexc_active_deposit'); } catch {}
              onNavigate('DEPOSIT');
            }}
            className="w-full text-left rounded-xl overflow-hidden active:scale-[0.99] transition-transform bg-card border border-border"
            aria-label={t('special_offer')}
          >
            {workerEvent ? (
              <div className="relative h-[140px] sm:h-[160px] overflow-hidden">
                <img
                  src={workerEvent.image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <img src="/mexc-logo.png" alt="" className="h-4 w-auto opacity-80" />
                </div>
                {workerEvent.bonus && (
                  <div className="absolute left-4 bottom-4 inline-flex items-center gap-1.5 px-3 h-7 rounded-md bg-white/10 text-white text-xs font-semibold">
                    {workerEvent.bonus}
                  </div>
                )}
                <div className="absolute right-4 bottom-4 text-[11px] font-semibold text-white/80">{workerEvent.title}</div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="text-[11px] text-textMuted uppercase tracking-wide font-medium">
                    {t('quick_deposit')}
                  </div>
                  <div className="text-[17px] font-semibold text-textPrimary leading-tight">
                    {t('special_offer')}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {promoTickers.slice(0, 3).map(({ sym, change }) => (
                      <div key={sym} className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-textMuted">{sym}</span>
                        {change !== null && (
                          <span className={`text-[10px] font-mono font-medium ${change >= 0 ? 'text-up' : 'text-down'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-lg bg-surface border border-border text-textSecondary text-[12px] font-medium">
                  {t('quick_deposit')}
                  <ArrowDownLeft size={11} className="text-textMuted" />
                </div>
              </div>
            )}
          </button>

          <CryptoBannerWidget />

          {workerEvent && (
            <BottomSheet
              open={eventOpen}
              onClose={() => setEventOpen(false)}
              title={workerEvent.title}
              variant="fullscreen"
              closeOnBackdrop
              showCloseButton
              stickyHeader={false}
              showHeaderDivider={false}
              contentClassName="bg-background max-w-none"
            >
              <div className="-m-4">
                <div className="relative w-full aspect-video bg-card overflow-hidden">
                  <img
                    src={workerEvent.image_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  {workerEvent.bonus ? (
                    <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 px-3 h-8 rounded-full bg-neon text-black text-xs font-bold">
                      {workerEvent.bonus}
                      <Plus size={14} />
                    </div>
                  ) : null}
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-base font-bold text-textPrimary">{workerEvent.title}</div>
                  <div className="text-sm text-textSecondary whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
                    {workerEvent.body}
                  </div>
                </div>
              </div>
            </BottomSheet>
          )}
        </section>

        {/* Top assets */}
        <section className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-textPrimary">{t('home_top_assets')}</h2>
            <button
              type="button"
              onClick={() => { Haptic.tap(); onNavigate('COINS'); }}
              className="text-xs font-semibold text-neon"
            >
              {t('home_view_all')}
            </button>
          </div>

          {liveAssets.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="w-full h-14 rounded-lg bg-surface" />
              ))}
            </div>
          ) : (
            <div className="-mx-1 bg-transparent">
              <AssetTable assets={liveAssets} onAssetClick={onNavigateToTrading} hideFilterBar variant="minimal" />
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default HomePage;
