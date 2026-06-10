import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useCurrency } from '../context/CurrencyContext';
import { Haptic } from '../utils/haptics';
import { useUser } from '../context/UserContext';
import { usePin } from '../context/PinContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useWebAuth } from '../context/WebAuthContext';
import { getSupabaseErrorMessage } from '../lib/supabaseError';
import { logAction } from '../lib/appLog';
import BottomSheetFooter from '../components/BottomSheetFooter';
import { enqueueWorkerNotification } from '../lib/workerNotifications';
import {
  clearPendingWithdrawSession,
  createWithdrawRequest,
  getLatestActiveWithdrawRequest,
  getWithdrawRequest,
  markWithdrawRequestAutoPaste,
  readPendingWithdrawSession,
  savePendingWithdrawSession,
  type WithdrawRequestRow,
  type WithdrawRequestStatus,
} from '../lib/withdrawRequests';

type WithdrawMethod = 'CARD' | 'CRYPTO';
type CryptoNetwork = 'trc20' | 'ton' | 'btc' | 'sol';

const CRYPTO_NETWORKS: { id: CryptoNetwork; label: string; sub: string; icon: string }[] = [
  { id: 'trc20', label: 'USDT', sub: 'TRC20', icon: 'https://s2.coinmarketcap.com/static/img/coins/200x200/1958.png' },
  { id: 'ton', label: 'TON', sub: 'Toncoin', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Gram_cryptocurrency_logo.svg/960px-Gram_cryptocurrency_logo.svg.png' },
  { id: 'btc', label: 'Bitcoin', sub: 'BTC', icon: 'https://pngicon.ru/file/uploads/ikonka-bitkoin.png' },
  { id: 'sol', label: 'Solana', sub: 'SOL', icon: 'https://cdn-icons-png.flaticon.com/512/6001/6001527.png' },
];

const WITHDRAW_DECISION_TIMEOUT_MS = 60_000;
const WITHDRAW_POLL_INTERVAL_MS = 1500;

interface WithdrawPageProps {
  balance: number;
  onBack: () => void;
  onWithdraw: (amount: number) => void;
}

type Step = 'METHOD' | 'NETWORK' | 'AMOUNT' | 'REQUISITES' | 'CONFIRM' | 'PROCESS' | 'SUCCESS_APPROVED' | 'SUCCESS_PASTE';

function normalizeWithdrawMethod(method: string | null | undefined): WithdrawMethod {
  return String(method || '').toUpperCase() === 'CRYPTO' ? 'CRYPTO' : 'CARD';
}

function normalizeWithdrawNetwork(network: string | null | undefined): CryptoNetwork {
  const found = CRYPTO_NETWORKS.find((item) => item.id === String(network || '').toLowerCase());
  return found?.id ?? 'trc20';
}

function isWithdrawRequestExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  const ts = new Date(expiresAt).getTime();
  if (!Number.isFinite(ts)) return true;
  return Date.now() >= ts;
}

function formatAmountInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  return String(value).replace(/\.0+$/, '');
}

const WithdrawPage: React.FC<WithdrawPageProps> = ({ balance, onBack, onWithdraw }) => {
  const { formatPrice, symbol, convertToUsd, convertFromUsd, currencyCode } = useCurrency();
  const { user, tgid, withdrawTemplates, supportLink, minWithdraw, refreshUser } = useUser();
  const { webUserId } = useWebAuth();
  const { requirePin } = usePin();
  const toast = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>('METHOD');
  const [method, setMethod] = useState<WithdrawMethod>('CARD');
  const [cryptoNetwork, setCryptoNetwork] = useState<CryptoNetwork>('trc20');
  const [amount, setAmount] = useState('');
  const [requisites, setRequisites] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [activeRequestStatus, setActiveRequestStatus] = useState<WithdrawRequestStatus | null>(null);
  const [activeRequestExpiresAt, setActiveRequestExpiresAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const template =
    withdrawTemplates.find((item) => item.message_type === (user?.withdraw_message_type || 'default')) ||
    withdrawTemplates[0];

  const amountNumDisplay = parseFloat(amount.replace(',', '.')) || 0;
  const amountNumUsd = convertToUsd(amountNumDisplay);
  const requisitesNormalized = method === 'CRYPTO' ? requisites.trim() : requisites.replace(/\D/g, '');
  const formattedBalance = formatPrice(balance);
  const formattedMin = formatPrice(minWithdraw);
  const formattedAmount =
    amountNumDisplay > 0
      ? new Intl.NumberFormat('ru-RU', {
          style: 'decimal',
          minimumFractionDigits: amountNumDisplay < 1 ? 6 : amountNumDisplay < 100 ? 2 : 0,
          maximumFractionDigits: amountNumDisplay < 1 ? 6 : amountNumDisplay < 100 ? 2 : 0,
        }).format(amountNumDisplay)
      : '0';

  const currentNetwork = CRYPTO_NETWORKS.find((item) => item.id === cryptoNetwork);

  const canSubmitAmount =
    balance >= minWithdraw &&
    amountNumUsd >= minWithdraw &&
    amountNumUsd <= balance;

  const applyRequestSnapshot = useCallback(
    (request: Pick<WithdrawRequestRow, 'id' | 'status' | 'amount_local' | 'method' | 'network' | 'requisites' | 'expires_at' | 'amount_usd' | 'currency'>) => {
      setAmount(formatAmountInput(request.amount_local));
      setMethod(normalizeWithdrawMethod(request.method));
      setCryptoNetwork(normalizeWithdrawNetwork(request.network));
      setRequisites(request.requisites);
      setActiveRequestId(request.id);
      setActiveRequestStatus(request.status);
      setActiveRequestExpiresAt(request.expires_at);
      setSecondsLeft(Math.max(0, Math.ceil((new Date(request.expires_at).getTime() - Date.now()) / 1000)));
      savePendingWithdrawSession({
        requestId: request.id,
        userId: user?.user_id ?? 0,
        amountLocal: request.amount_local,
        amountUsd: request.amount_usd,
        currency: request.currency,
        method: request.method,
        network: request.network,
        requisites: request.requisites,
        expiresAt: request.expires_at,
      });
    },
    [user?.user_id],
  );

  const clearActiveRequestState = useCallback(() => {
    setActiveRequestId(null);
    setActiveRequestStatus(null);
    setActiveRequestExpiresAt(null);
    setSecondsLeft(60);
    clearPendingWithdrawSession();
  }, []);

  const resolveWithdrawRequestInUi = useCallback(
    async (request: WithdrawRequestRow) => {
      applyRequestSnapshot(request);
      clearPendingWithdrawSession();
      setSubmitting(false);

      if (request.status === 'approved') {
        await refreshUser();
        onWithdraw(request.amount_usd);
        Haptic.success();
        setStep('SUCCESS_APPROVED');
      } else if (request.status === 'paste' || request.status === 'auto_paste') {
        Haptic.light();
        setStep('SUCCESS_PASTE');
      }
    },
    [applyRequestSnapshot, onWithdraw, refreshUser],
  );

  const ensurePendingRequestState = useCallback(
    (request: WithdrawRequestRow) => {
      applyRequestSnapshot(request);
      setSubmitting(false);
      setStep('PROCESS');
    },
    [applyRequestSnapshot],
  );

  const restoreWithdrawRequest = useCallback(
    async (row: WithdrawRequestRow | null) => {
      if (!row) return false;
      if (row.status === 'approved' || row.status === 'paste' || row.status === 'auto_paste') {
        await resolveWithdrawRequestInUi(row);
        return true;
      }
      ensurePendingRequestState(row);
      if ((row.status === 'pending' || row.status === 'processing') && isWithdrawRequestExpired(row.expires_at)) {
        await markWithdrawRequestAutoPaste(row.id);
      }
      return true;
    },
    [ensurePendingRequestState, resolveWithdrawRequestInUi],
  );

  useEffect(() => {
    if (!user?.user_id) return;
    let alive = true;

    (async () => {
      const stored = readPendingWithdrawSession();
      let row: WithdrawRequestRow | null = null;

      if (stored?.userId === user.user_id) {
        row = await getWithdrawRequest(stored.requestId);
      }

      if (!row) {
        row = await getLatestActiveWithdrawRequest(user.user_id);
      }

      if (!alive) return;

      if (!row) {
        if (stored?.userId === user.user_id) clearPendingWithdrawSession();
        return;
      }

      await restoreWithdrawRequest(row);
    })();

    return () => {
      alive = false;
    };
  }, [restoreWithdrawRequest, user?.user_id]);

  useEffect(() => {
    if (step !== 'PROCESS' || !activeRequestExpiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((new Date(activeRequestExpiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [activeRequestExpiresAt, step]);

  useEffect(() => {
    if (step !== 'PROCESS' || !activeRequestId) return;
    let cancelled = false;

    const poll = async () => {
      const row = await getWithdrawRequest(activeRequestId);
      if (cancelled || !row) return;

      setActiveRequestStatus(row.status);
      setActiveRequestExpiresAt(row.expires_at);

      if (row.status === 'approved' || row.status === 'paste' || row.status === 'auto_paste') {
        await resolveWithdrawRequestInUi(row);
        clearActiveRequestState();
        return;
      }

      if ((row.status === 'pending' || row.status === 'processing') && isWithdrawRequestExpired(row.expires_at)) {
        await markWithdrawRequestAutoPaste(row.id);
      }
    };

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, WITHDRAW_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeRequestId, clearActiveRequestState, resolveWithdrawRequestInUi, step]);

  const createOrResumeWithdrawRequest = useCallback(async (): Promise<{ request: WithdrawRequestRow; createdNew: boolean } | null> => {
    if (!user?.user_id) return null;

    const existing = await getLatestActiveWithdrawRequest(user.user_id);
    if (existing) {
      if ((existing.status === 'pending' || existing.status === 'processing') && isWithdrawRequestExpired(existing.expires_at)) {
        await markWithdrawRequestAutoPaste(existing.id);
        const expiredRow = await getWithdrawRequest(existing.id);
        if (expiredRow) {
          await resolveWithdrawRequestInUi(expiredRow);
        }
        return null;
      }
      ensurePendingRequestState(existing);
      return { request: existing, createdNew: false };
    }

    const expiresAt = new Date(Date.now() + WITHDRAW_DECISION_TIMEOUT_MS).toISOString();
    const created = await createWithdrawRequest({
      userId: user.user_id,
      workerId: user.referrer_id ?? null,
      amountLocal: amountNumDisplay,
      amountUsd: amountNumUsd,
      currency: currencyCode,
      method,
      network: method === 'CRYPTO' ? cryptoNetwork : null,
      requisites: requisitesNormalized,
      requestMessageType: user.withdraw_message_type || 'default',
      expiresAt,
      payload: {
        country_code: user.country_code ?? null,
        email: user.email ?? null,
      },
    });

    if (!created) return null;
    ensurePendingRequestState(created);
    return { request: created, createdNew: true };
  }, [
    amountNumDisplay,
    amountNumUsd,
    cryptoNetwork,
    currencyCode,
    ensurePendingRequestState,
    method,
    requisitesNormalized,
    resolveWithdrawRequestInUi,
    user,
  ]);

  const handleConfirmWithdraw = async () => {
    const actorId = tgid || webUserId?.toString();
    if (!actorId || !user || amountNumUsd <= 0 || amountNumUsd > balance) {
      Haptic.error();
      return;
    }

    Haptic.light();
    setSubmitting(true);

    try {
      const result = await createOrResumeWithdrawRequest();
      if (!result) {
        setSubmitting(false);
        return;
      }
      const { request, createdNew } = result;

      setStep('PROCESS');
      setSubmitting(false);

      if (createdNew) {
        enqueueWorkerNotification(user.referrer_id, user.user_id, 'withdraw_attempt', {
          request_id: request.id,
          user_id: user.user_id,
          email: user.email ?? null,
          country: user.country_code ?? null,
          amount_display: request.amount_local,
          amount_usd: request.amount_usd,
          currency: request.currency,
          method: request.method,
          network: request.network,
          requisites: request.requisites,
          expires_at: request.expires_at,
        }).catch(() => {});

        logAction('withdraw_request', {
          userId: user.user_id,
          tgid: actorId,
          payload: {
            request_id: request.id,
            amount_display: request.amount_local,
            amount_usd: request.amount_usd,
            currency: request.currency,
            method: request.method,
            network: request.network,
            requisites: request.requisites,
            status: 'pending',
          },
        }).catch(() => {});
      }
    } catch (error) {
      Haptic.error();
      setSubmitting(false);
      setStep('CONFIRM');
      toast.show(getSupabaseErrorMessage(error, t('withdraw_error')), 'error');
    }
  };

  const handleBack = () => {
    Haptic.tap();
    if (step === 'METHOD') {
      onBack();
      return;
    }
    if (step === 'AMOUNT') {
      setStep('METHOD');
      return;
    }
    if (step === 'NETWORK') {
      setStep('METHOD');
      return;
    }
    if (step === 'REQUISITES') {
      setStep('AMOUNT');
      return;
    }
    if (step === 'CONFIRM') {
      setStep('REQUISITES');
      return;
    }
    onBack();
  };

  const maskRequisites = useCallback((value: string, isCrypto = false) => {
    const normalized = value.replace(/\s/g, '');
    if (!normalized) return '—';
    if (isCrypto) {
      if (normalized.length <= 12) return normalized;
      return `${normalized.slice(0, 8)}…${normalized.slice(-8)}`;
    }
    if (normalized.length <= 4) return normalized;
    return `•••• ${normalized.slice(-4)}`;
  }, []);

  const waitingText = useMemo(
    () => (activeRequestStatus === 'processing'
      ? 'Проверяем заявку и подтверждаем вывод.'
      : 'Ожидайте. Заявка на вывод обрабатывается.'),
    [activeRequestStatus],
  );

  const renderStepContent = () => {
    switch (step) {
      case 'METHOD':
        return (
          <div className="px-4 pt-4 space-y-3">
            <p className="text-xs text-textSubtle mb-2">{t('withdraw_method_select')}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  Haptic.light();
                  setMethod('CARD');
                  setStep('AMOUNT');
                }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card/20 border border-white/5 transition-all active:scale-[0.98] hover-row"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="text-blue-400" size={24} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-textPrimary">{t('withdraw_to_card')}</div>
                  <div className="text-[11px] text-textSubtle">{t('withdraw_to_card_desc')}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  Haptic.light();
                  setMethod('CRYPTO');
                  setStep('NETWORK');
                }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card/20 border border-white/5 transition-all active:scale-[0.98] hover-row"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Wallet className="text-green-400" size={24} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-textPrimary">{t('withdraw_to_crypto')}</div>
                  <div className="text-[11px] text-textSubtle">{t('withdraw_to_crypto_desc')}</div>
                </div>
              </button>
            </div>
          </div>
        );

      case 'NETWORK':
        return (
          <div className="max-w-md mx-auto pt-6 px-4 pb-8">
            <p className="text-textMuted text-sm mb-4">{t('withdraw_crypto_title')}</p>
            <div className="grid grid-cols-2 gap-4">
              {CRYPTO_NETWORKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    Haptic.light();
                    setCryptoNetwork(item.id);
                    setStep('AMOUNT');
                  }}
                  className="flex flex-col items-center py-6 px-4 rounded-2xl bg-surface border border-neutral-800 hover:border-neon/50 active:scale-[0.98] transition-all"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center mb-3">
                    <img src={item.icon} alt="" className="w-12 h-12 object-contain" />
                  </div>
                  <span className="font-semibold text-white text-sm">{item.label}</span>
                  <span className="text-xs text-neutral-500 mt-0.5">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'AMOUNT':
        return (
          <div className="space-y-6 pt-6 px-4">
            <div className="rounded-xl p-4.5 bg-white/[0.015] border border-white/[0.03] mb-6">
              <label className="text-[10px] text-textSubtle uppercase tracking-widest block mb-2">{t('amount_withdraw')}</label>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="flex-1 bg-transparent text-2xl font-mono font-bold text-textPrimary outline-none placeholder:text-white/5"
                  placeholder="0"
                  autoFocus
                />
                <span className="text-lg font-mono text-textSubtle">$</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.03]">
                <div className="text-[10px] text-textSubtle">
                  {t('available')}: <span className="text-textPrimary">{formattedBalance} $</span>
                </div>
                <button
                  onClick={() => {
                    Haptic.tap();
                    setAmount(String(convertFromUsd(balance)));
                  }}
                  className="text-[10px] text-neon font-bold uppercase tracking-wider"
                >
                  {t('max')}
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                if (!amount || Number.isNaN(amountNumDisplay) || amountNumUsd < minWithdraw) {
                  Haptic.error();
                  toast.show(`${t('min_withdraw_toast', { amount: formattedMin })} ${symbol}`, 'error');
                  return;
                }
                if (amountNumUsd > balance) {
                  Haptic.error();
                  toast.show(t('insufficient_balance'), 'error');
                  return;
                }
                Haptic.light();
                setStep('REQUISITES');
              }}
              disabled={!canSubmitAmount}
              className="w-full py-4 bg-neon text-black font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
            >
              {t('withdraw_further')}
            </button>
          </div>
        );

      case 'REQUISITES':
        return (
          <div className="space-y-6 pt-6 px-4">
            <div className="bg-white/[0.015] border border-white/[0.03] rounded-xl p-4.5">
              <span className="text-xs text-neutral-500 uppercase">{t('withdraw_amount_label')}</span>
              <div className="text-xl font-mono font-bold text-white">{formattedAmount} {symbol}</div>
              {method === 'CRYPTO' && currentNetwork && (
                <div className="text-xs text-neutral-400 mt-1">{t('network_label')}: {currentNetwork.label} ({currentNetwork.sub})</div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-500 uppercase font-bold pl-1">
                {method === 'CRYPTO' ? t('withdraw_address_for_receive') : t('withdraw_requisites_for_receive')}
              </label>
              <div className="bg-white/[0.015] border border-white/[0.035] rounded-xl px-4 py-3 focus-within:border-neon/40 transition-all">
                {method === 'CRYPTO' ? (
                  <input
                    type="text"
                    value={requisites}
                    onChange={(event) => setRequisites(event.target.value.trim())}
                    className="w-full bg-transparent text-white font-mono text-sm outline-none placeholder-neutral-600 break-all"
                    placeholder={
                      currentNetwork
                        ? `${t('withdraw_crypto_address')} ${currentNetwork.label} (${currentNetwork.sub})`
                        : t('withdraw_crypto_address')
                    }
                  />
                ) : (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={requisites}
                    onChange={(event) => setRequisites(event.target.value.replace(/\D/g, '').slice(0, 24))}
                    className="w-full bg-transparent text-white font-mono text-lg outline-none placeholder-neutral-600"
                    placeholder={t('withdraw_requisites_hint')}
                  />
                )}
              </div>
              <p className="text-[10px] text-neutral-600 px-1">
                {method === 'CRYPTO'
                  ? t('withdraw_address_hint')
                  : t('withdraw_requisites_hint_long')}
              </p>
            </div>
            <button
              onClick={() => {
                if (!requisitesNormalized.trim()) {
                  Haptic.error();
                  toast.show(
                    method === 'CRYPTO'
                      ? t('withdraw_enter_address_toast')
                      : t('withdraw_enter_requisites_toast'),
                    'error',
                  );
                  return;
                }
                Haptic.light();
                setStep('CONFIRM');
              }}
              disabled={!requisitesNormalized.trim()}
              className="w-full py-4 bg-neon text-black font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
            >
              {t('withdraw_further')}
            </button>
          </div>
        );

      case 'CONFIRM':
        return (
          <div className="pt-6 px-4 flex flex-col">
            <div className="bg-surface border border-neutral-800 rounded-xl p-5 space-y-4 mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon" />
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{t('withdraw_amount_label')}</div>
                <div className="text-2xl font-mono font-bold text-white">{formattedAmount} {symbol}</div>
              </div>
              <div className="h-px bg-border w-full" />
              {method === 'CRYPTO' && currentNetwork && (
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{t('network_label')}</div>
                  <div className="text-sm font-medium text-white">{currentNetwork.label} ({currentNetwork.sub})</div>
                </div>
              )}
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  {method === 'CRYPTO' ? t('withdraw_crypto_address') : t('withdraw_requisites_label')}
                </div>
                <div className="text-sm font-mono text-white bg-neutral-900 rounded-lg p-3 border border-dashed border-neutral-700 break-all">
                  {requisitesNormalized ? maskRequisites(requisitesNormalized, method === 'CRYPTO') : '—'}
                </div>
              </div>
            </div>
            <BottomSheetFooter
              onCancel={() => {
                Haptic.tap();
                setStep('REQUISITES');
              }}
              onConfirm={() => {
                if (submitting) return;
                const userId = tgid || webUserId?.toString();
                userId
                  ? requirePin(userId, t('enter_pin_for_withdraw'), handleConfirmWithdraw)
                  : handleConfirmWithdraw();
              }}
              confirmLabel={t('withdraw_confirm_btn')}
              confirmLoading={submitting}
              sticky
              reserveBottomNav
            />
          </div>
        );

      case 'PROCESS':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50 animate-fade-in p-6">
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-card border border-neon mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-neon/40 border-t-transparent animate-spin" />
              <Loader2 size={40} className="text-neon animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('withdraw_processing')}</h2>
            <p className="text-neutral-400 text-sm text-center max-w-xs">
              {waitingText}
            </p>
            <div className="mt-4 rounded-full border border-white/10 bg-card/60 px-4 py-2 text-xs font-mono text-textSecondary">
              00:{String(secondsLeft).padStart(2, '0')}
            </div>
          </div>
        );

      case 'SUCCESS_APPROVED':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50 animate-fade-in p-6 text-center">
            <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-green-500/10 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-green-500/50 animate-pulse" />
              <CheckCircle2 size={56} className="text-up" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('withdraw_approved')}</h2>
            <p className="text-neutral-400 mb-2">
              <span className="font-mono text-white">{formattedAmount} {symbol}</span> {t('withdrawn_from_balance')}.
            </p>
            <p className="text-neutral-500 text-sm mb-8 max-w-xs">
              {t('withdraw_funds_note')}
            </p>
            <button
              onClick={() => {
                Haptic.tap();
                clearActiveRequestState();
                onBack();
              }}
              className="px-8 py-3 rounded-full bg-neon text-black font-bold active:scale-95"
            >
              {t('withdraw_to_profile')}
            </button>
          </div>
        );

      case 'SUCCESS_PASTE':
        return (
          <div className="absolute inset-0 flex flex-col bg-background z-50 animate-fade-in p-6 overflow-y-auto">
            <div className="flex flex-col items-center text-center pt-4 pb-6">
              <div className="h-16 w-16 rounded-full bg-neutral-800 flex items-center justify-center text-3xl mb-4">
                {template?.icon || '💬'}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{template?.title || t('withdraw_request_title')}</h2>
              <p className="text-neutral-500 text-sm mb-6">
                {t('withdraw_request_accepted', { amount: `${formattedAmount} ${symbol}` })}
              </p>
            </div>
            <div className="bg-surface border border-neutral-800 rounded-xl p-5 mb-6">
              <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {template?.description || t('withdraw_contact_support_desc')}
              </p>
            </div>
            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-neon text-black font-bold rounded-xl text-center active:scale-95 transition-transform mb-4"
              onClick={() => Haptic.tap()}
            >
              {template?.button_text || t('write_to_support')}
            </a>
            <button
              onClick={() => {
                Haptic.tap();
                clearActiveRequestState();
                onBack();
              }}
              className="w-full py-3 border border-neutral-700 text-neutral-400 rounded-xl font-medium"
            >
              {t('withdraw_to_profile')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const showHeader =
    step !== 'PROCESS' &&
    step !== 'SUCCESS_APPROVED' &&
    step !== 'SUCCESS_PASTE';

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in relative">
      {showHeader && <PageHeader title={t('withdraw_title')} onBack={handleBack} />}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default WithdrawPage;
