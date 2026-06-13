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
  User,
  ArrowDownLeft,
  Scan,
  Percent,
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

const HomePage: React.FC<HomePageProps> = ({ balance, balanceLoading = false, user, onNavigateToTrading, onSearch, onNavigate, onCurrencyClick }) => {
  const { t } = useLanguage();
  const { formatPrice, currencyCode } = useCurrency();
  const liveAssets = useLiveAssets(MOCK_ASSETS);
  const promoTickers = useMemo(() => {
    const symbols = ['BTC', 'ETH', 'SOL'];
    return symbols.map((sym) => {
      const a = liveAssets.find((x) => x.ticker === sym);
      return { sym, price: a?.price ?? null, change: a?.change24h ?? null };
    });
  }, [liveAssets]);

  const [searchValue, setSearchValue] = useState('GOLD(XAUT)');
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

  // Мягкая “пульсация” баннера как в приложениях бирж
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
    if (!wid) {
      setWorkerEvent(null);
      return;
    }
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

  return (
    <div className="flex flex-col min-h-full animate-fade-in px-4 lg:px-6 lg:max-w-5xl mx-auto pb-28 lg:pb-8">
      {/* Top bar (как у MEXC) */}
      <header
        className={[
          'sticky top-0 z-40 -mx-4 lg:-mx-6 px-4 lg:px-6',
          'pt-2 pb-1.5',
          'bg-background/85 backdrop-blur-xl',
          'hairline-bottom',
          'transition-transform duration-200',
          topBarHidden ? '-translate-y-full' : 'translate-y-0',
        ].join(' ')}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { Haptic.tap(); onNavigate('PROFILE'); }}
            className="touch-target h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all shrink-0"
            aria-label={t('profile')}
          >
            <UserAvatar
              name={user?.full_name || user?.username || user?.email || t('profile')}
              photoUrl={user?.photo_url}
              className="h-6.5 w-6.5"
              imageClassName="border-neutral-700"
              fallbackClassName="bg-neutral-800 border-neutral-700 text-textSecondary text-[10px]"
              iconClassName="text-textSecondary"
              iconSize={12}
            />
          </button>

          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => { Haptic.tap(); onSearch(); }}
              className="w-full h-9 rounded-full bg-white/5 flex items-center gap-2 px-3.5 text-left active:scale-[0.99] transition-transform"
            >
              <Search size={14} className="text-textSubtle shrink-0" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-transparent outline-none text-xs text-textPrimary placeholder:text-textSubtle w-full min-w-0 font-medium"
                placeholder={t('search')}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { Haptic.tap(); onNavigate('SUPPORT'); }}
              className="touch-target h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all text-textSecondary hover:text-textPrimary"
              aria-label={t('support')}
            >
              <Headphones size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Balance row + Deposit */}
      <section className="pt-2 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex flex-col justify-center">
            <div className="text-textSubtle text-xs leading-none">{t('home_total_assets')}</div>
            <div className="flex items-baseline gap-2 mt-1">
              {balanceLoading ? (
                <Skeleton className="w-28 h-8 rounded-lg bg-card/60" />
              ) : (
                <span className={`text-3xl font-semibold tracking-tight text-ink tabular-nums leading-[1] rounded-lg px-1 ${balanceFlash}`}>
                  {totalAssetsText}
                </span>
              )}
              <div className="flex items-center gap-1 text-textSubtle text-xs leading-none">
                <span className="font-semibold uppercase tracking-wider">{currencyCode}</span>
              </div>
            </div>
            

          </div>

          <button
            type="button"
            onClick={() => { Haptic.tap(); onNavigate('DEPOSIT'); }}
            className="touch-target exchange-btn exchange-btn-primary px-4 h-10 rounded-full text-sm active:scale-[0.98] flex items-center justify-center animate-none"
          >
            {t('deposit')}
          </button>
        </div>
      </section>

      {/* “Complete Your Futures Trade” style banner */}
      <section className="pb-4">
        <div
          className="bg-white/5 rounded-xl px-3.5 py-3 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <div className="text-xs text-textPrimary truncate">
              3/3&nbsp;&nbsp;{t('home_complete_futures_banner')}
              <span className="text-neon font-semibold">&nbsp;{t('home_try_now')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { Haptic.tap(); onNavigate('TRADING'); }}
            className="touch-target h-8 px-3 rounded-xl exchange-btn-secondary text-textPrimary text-xs font-semibold active:scale-[0.98] transition-transform"
          >
            {t('home_go')}
          </button>
        </div>
      </section>

      {/* Quick actions grid */}
      <section className="pb-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: t('deposit'), Icon: ArrowDownLeft, badge: null, onClick: () => onNavigate('DEPOSIT') },
            { label: t('staking_title'), Icon: Percent, badge: null, onClick: () => onNavigate('STAKING') },
            { label: t('quick_scan'), Icon: Scan, badge: null, onClick: () => onNavigate('QR_SCANNER') },
            { label: t('profile'), Icon: User, badge: null, onClick: () => onNavigate('PROFILE') },
          ].map(({ label, Icon, badge, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={() => { Haptic.tap(); onClick(); }}
              className="touch-target flex flex-col items-center justify-center gap-2 active:scale-[0.95] transition-transform relative py-1"
            >
              {badge ? (
                <span className="absolute top-1 right-2 text-[9px] font-bold text-white bg-neon rounded-full px-1.5 py-0.5 z-10">
                  {badge}
                </span>
              ) : null}
              <div className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/8 flex items-center justify-center transition-colors">
                <Icon size={18} className="text-textPrimary" />
              </div>
              <span className="text-[11px] text-textSecondary font-semibold tracking-tight text-center leading-none">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Desktop two-column: promo + assets */}
      <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-5 lg:items-start">

      {/* Special offer */}
      <section className="pb-5">
        <button
          type="button"
          onClick={() => {
            Haptic.tap();
            if (workerEvent) {
              setEventOpen(true);
              return;
            }
            // Если в P2P-deposit осталась активная сделка, DepositPage восстановит её автоматически.
            // Для промо-баннера это выглядит как баг → всегда начинаем пополнение с нуля.
            try { localStorage.removeItem('etoro_active_p2p_deal'); } catch {}
            try { localStorage.removeItem('etoro_active_deposit'); } catch {}
            onNavigate('DEPOSIT');
          }}
          className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
          style={{ background: 'linear-gradient(135deg, #0d1b35 0%, #0a1628 55%, #060e1c 100%)' }}
          aria-label={t('special_offer')}
        >
          {workerEvent ? (
            /* Worker event: still show image if provided */
            <div className="relative h-[160px] sm:h-[180px] overflow-hidden">
              <img
                src={workerEvent.image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur px-2.5 py-1.5">
                <img src="/mexc-logo.png" alt="" className="h-4 w-auto opacity-95" />
                <span className="text-[11px] font-semibold text-white/90">{workerEvent.title}</span>
              </div>
              {workerEvent.bonus && (
                <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 px-3 h-8 rounded-full bg-neon text-black text-xs font-bold">
                  {workerEvent.bonus}
                  <Plus size={12} />
                </div>
              )}
            </div>
          ) : (
            /* Default: pure code-based card */
            <div className="relative h-[160px] sm:h-[180px] overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(43,130,246,0.18) 0%, transparent 65%)' }} />
              <div className="absolute left-1/3 bottom-0 w-48 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(43,130,246,0.08) 0%, transparent 70%)' }} />

              {/* SVG grid */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Live tickers */}
              <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                {promoTickers.map(({ sym, price, change }) => (
                  <div key={sym} className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-textMuted">{sym}/USDT</span>
                    {change !== null ? (
                      <span className={`text-[10px] font-mono font-semibold ${change >= 0 ? 'text-up' : 'text-down'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-textMuted">—</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/mexc-logo.png" alt="" className="h-4 w-auto opacity-90" />
                    <span className="text-[10px] font-mono tracking-widest text-neon/70 uppercase">Deposit</span>
                  </div>
                  <div className="text-[22px] font-bold text-white tracking-tight leading-none">
                    {t('special_offer')}
                  </div>
                  <div className="text-[12px] text-textSecondary mt-1.5">
                    50+ assets · Instant funding
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 h-8 rounded-full bg-neon text-black text-[12px] font-bold self-start">
                  {t('quick_deposit')}
                  <ArrowDownLeft size={12} />
                </div>
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
              <div className="relative w-full aspect-video bg-black/40 overflow-hidden">
                <img
                  src={workerEvent.image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                {workerEvent.bonus ? (
                  <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 px-3 h-8.5 rounded-full bg-neon text-black text-xs font-bold">
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-textPrimary">{t('home_top_assets')}</h2>
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
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={idx} className="w-full h-14 rounded-lg bg-card/60" />
            ))}
          </div>
        ) : (
          <div className="-mx-1 bg-transparent">
            <AssetTable assets={liveAssets} onAssetClick={onNavigateToTrading} hideFilterBar variant="minimal" />
          </div>
        )}
      </section>

      </div>{/* end desktop two-column */}
    </div>
  );
};

export default HomePage;
