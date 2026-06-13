// Shared auth-form helpers (used by LoginPage + RegisterPage).

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());
}

export const AUTH_INPUT_CLASS =
  'w-full h-12 px-4 bg-surface border border-border rounded-xl text-[15px] text-textPrimary placeholder-textMuted outline-none transition-colors focus:border-textMuted';

export const AUTH_INPUT_ERROR_CLASS = 'border-down focus:border-down';

export const AUTH_LABEL_CLASS = 'block text-[13px] font-medium text-textSecondary mb-1';

export const AUTH_SUBMIT_CLASS =
  'w-full h-12 rounded-xl bg-neon text-white text-[16px] font-bold hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
