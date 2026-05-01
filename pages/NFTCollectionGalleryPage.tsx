import React, { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { getNftListingsForCollection, type NftListingRow } from '../lib/nftCatalog';
import { enrichNftListings, useNftReferrerPriceMap } from '../lib/nftReferrerPricing';
import { Haptic } from '../utils/haptics';

/** Снизу оставляем место под fixed bottom-nav + safe-area (+ запас под баннер P2P над навбаром). */
const GALLERY_SCROLL_BOTTOM_PADDING =
  'pb-[calc(8.25rem+env(safe-area-inset-bottom,0px))]';

type GallerySort = 'floorAsc' | 'floorDesc' | 'tokenId';

interface NFTCollectionGalleryPageProps {
  collectionSlug: string;
  collectionName: string;
  coverUrl?: string;
  itemCount?: number;
  floorEth?: number;
  onBack: () => void;
  onOpenListing: (row: NftListingRow) => void;
}

const NFTCollectionGalleryPage: React.FC<NFTCollectionGalleryPageProps> = ({
  collectionSlug,
  collectionName,
  coverUrl: coverProp,
  itemCount: itemCountProp,
  floorEth: floorProp,
  onBack,
  onOpenListing,
}) => {
  const { t } = useLanguage();

  const refPrices = useNftReferrerPriceMap();
  const listings = useMemo(
    () => enrichNftListings(getNftListingsForCollection(collectionSlug), refPrices),
    [collectionSlug, refPrices]
  );

  const [sort, setSort] = useState<GallerySort>('floorAsc');

  const sortedListings = useMemo(() => {
    const rows = [...listings];
    switch (sort) {
      case 'floorDesc':
        rows.sort((a, b) => b.priceEth - a.priceEth);
        break;
      case 'floorAsc':
        rows.sort((a, b) => a.priceEth - b.priceEth);
        break;
      case 'tokenId':
        rows.sort((a, b) =>
          a.codeKey.localeCompare(b.codeKey, undefined, {
            numeric: true,
            sensitivity: 'base',
          })
        );
        break;
      default:
        break;
    }
    return rows;
  }, [listings, sort]);

  const coverUrl = coverProp ?? listings[0]?.imageUrl;
  const itemCount = itemCountProp ?? listings.length;

  const priceRollup = useMemo(() => {
    if (!listings.length) return { floor: floorProp ?? 0, high: 0, avg: 0 };
    let sum = 0;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const r of listings) {
      const p = r.priceEth;
      sum += p;
      min = Math.min(min, p);
      max = Math.max(max, p);
    }
    const fallbackFloor = Number.isFinite(min) ? min : 0;
    const floor =
      typeof floorProp === 'number' && Number.isFinite(floorProp)
        ? floorProp
        : fallbackFloor;
    return {
      floor,
      high: Number.isFinite(max) ? max : 0,
      avg: listings.length ? sum / listings.length : 0,
    };
  }, [listings, floorProp]);

  const fmtEth = (n: number) =>
    Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—';

  const statRow = (label: string, valueMono: React.ReactNode) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-1.5 last:border-0 last:pb-0">
      <span className="text-[10px] text-textMuted shrink-0">{label}</span>
      <span className="text-[11px] font-mono font-semibold text-neon tabular-nums tracking-tight text-right min-w-0 truncate">
        {valueMono}
      </span>
    </div>
  );

  const sortChip = (
    key: GallerySort,
    label: string
  ) => {
    const on = sort === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => {
          Haptic.tap();
          setSort(key);
        }}
        className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
          on
            ? 'bg-neon/20 text-neon ring-1 ring-inset ring-neon/35'
            : 'bg-white/[0.04] text-textSubtle hover:text-textSecondary hover:bg-white/[0.06]'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="bg-background animate-fade-in">
      <div className="max-w-2xl w-full mx-auto">
        <PageHeader title={collectionName} onBack={onBack} />
      </div>

      {/* Hero: края по ширине экрана, без карточной «рамки» */}
      <section
        aria-label={collectionName}
        className="relative w-screen max-w-[100vw] left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-row gap-2 sm:gap-3 items-stretch min-h-[5.25rem] sm:min-h-[5.75rem] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] py-2.5 bg-gradient-to-r from-black/45 via-black/25 to-transparent">
          <div className="relative w-[24vw] max-w-[5.5rem] sm:w-[5.75rem] sm:max-w-[6.5rem] shrink-0 rounded-lg overflow-hidden bg-black/35">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent" />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 sm:gap-2 py-0">
            <div className="min-w-0 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-semibold text-textSecondary leading-snug line-clamp-2">
                {collectionName}
              </p>
              <p className="text-[9px] text-textMuted font-mono tracking-tight truncate opacity-75">
                {collectionSlug}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-textMuted">
              <span className="tabular-nums">
                <span className="font-bold text-textPrimary">{itemCount}</span> {t('nft_items')}
              </span>
              <span className="text-textMuted/85 hidden sm:inline">{t('nft_gallery_hint')}</span>
            </div>

            <div className="flex flex-col gap-1.5 pr-1 max-w-[18rem] sm:max-w-none">
              {statRow(
                `${t('nft_gallery_stat_floor')} (ETH)`,
                <>{fmtEth(priceRollup.floor)} ETH</>
              )}
              {statRow(`${t('nft_gallery_stat_high')} (ETH)`, <>{fmtEth(priceRollup.high)} ETH</>)}
              {statRow(`${t('nft_gallery_stat_avg')} (ETH)`, <>{fmtEth(priceRollup.avg)} ETH</>)}
            </div>

            <p className="text-[9px] text-textMuted/90 leading-snug sm:hidden">{t('nft_gallery_hint')}</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent" aria-hidden />
      </section>

      <div className={`max-w-2xl w-full mx-auto px-4 pt-4 space-y-4 ${GALLERY_SCROLL_BOTTOM_PADDING}`}>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
          {sortChip('floorAsc', t('markets_nft_sort_floor_low'))}
          {sortChip('floorDesc', t('markets_nft_sort_floor_high'))}
          {sortChip('tokenId', t('markets_nft_sort_alpha'))}
        </div>

        {sortedListings.length === 0 ? (
          <p className="text-sm text-textMuted text-center py-14">{t('nothing_found')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5 pb-2">
            {sortedListings.map((row) => (
              <button
                key={`${row.codeKey}-${row.collectionSlug}`}
                type="button"
                onClick={() => {
                  Haptic.tap();
                  onOpenListing(row);
                }}
                aria-label={`${collectionName} ${row.codeDisplay}`}
                className="group rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.09] shadow-md shadow-black/25 text-left active:scale-[0.985] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-neon/35"
              >
                <div className="aspect-square bg-black/50 relative overflow-hidden">
                  <img
                    src={row.imageUrl}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/92 via-black/35 to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 ring-1 ring-white/12 shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-neon tabular-nums tracking-tight">
                      {row.priceEth.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                      <span className="text-textMuted font-medium"> ETH</span>
                    </span>
                  </div>
                  <span className="absolute bottom-3 left-3 right-[4.75rem] font-mono text-[13px] sm:text-[14px] font-bold text-white leading-tight tracking-tight drop-shadow-md">
                    {row.codeDisplay}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCollectionGalleryPage;
