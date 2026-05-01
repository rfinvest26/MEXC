import React, { createContext, useContext } from 'react';
import { supabase } from './supabase';
import { nftTickerForListing, type NftListingRow } from './nftCatalog';

export type RpcNftPolicyRow = {
  nft_listing_id?: string;
  spot_ticker?: string | null;
  custom_price_eth?: number | string | null;
};

const Ctx = createContext<Record<string, number>>({});

export function NftReferrerPriceProvider({
  map,
  children,
}: {
  map: Record<string, number>;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={map}>{children}</Ctx.Provider>;
}

export function useNftReferrerPriceMap(): Record<string, number> {
  return useContext(Ctx);
}

function normalizeRpcNftPolicyRows(data: unknown): RpcNftPolicyRow[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as RpcNftPolicyRow[];
  if (typeof data === 'string') {
    try {
      return normalizeRpcNftPolicyRows(JSON.parse(data) as unknown);
    } catch {
      return [];
    }
  }
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    for (const k of ['rows', 'result', 'data', 'items', 'overrides', 'policies'] as const) {
      const v = o[k];
      if (Array.isArray(v)) return v as RpcNftPolicyRow[];
    }
    const looksLikeRow =
      typeof o.spot_ticker === 'string' ||
      o.nft_listing_id != null ||
      o.custom_price_eth != null;
    if (looksLikeRow) return [o as RpcNftPolicyRow];
    const vals = Object.values(o);
    if (vals.length > 0 && vals.every((x) => x != null && typeof x === 'object')) {
      const asRows = vals as RpcNftPolicyRow[];
      if (asRows.some((r) => typeof (r as { spot_ticker?: unknown }).spot_ticker === 'string')) {
        return asRows;
      }
    }
    console.warn('[get_referrer_nft_policy_overrides] unexpected response shape', data);
  }
  return [];
}

export async function fetchReferrerNftPriceMap(viewerUid: number | null | undefined): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (!Number.isFinite(viewerUid ?? NaN) || (viewerUid ?? 0) <= 0) return out;
  const { data, error } = await supabase.rpc('get_referrer_nft_policy_overrides', {
    p_viewer_uid: viewerUid,
  });
  if (error || data == null) return out;
  const rows = normalizeRpcNftPolicyRows(data);
  for (const r of rows) {
    const t = (r.spot_ticker ?? '').trim();
    const p = Number(r.custom_price_eth);
    if (!t || !Number.isFinite(p) || p <= 0) continue;
    out[t] = p;
  }
  return out;
}

export function enrichNftListingRow(row: NftListingRow, map: Record<string, number>): NftListingRow {
  const custom = map[nftTickerForListing(row)];
  if (!Number.isFinite(custom) || custom <= 0) return row;
  return { ...row, priceEth: custom };
}

export function enrichNftListings(rows: NftListingRow[], map: Record<string, number>): NftListingRow[] {
  return rows.map((r) => enrichNftListingRow(r, map));
}
