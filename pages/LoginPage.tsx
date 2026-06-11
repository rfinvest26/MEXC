import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import AuthFullScreenLayout from '../components/AuthFullScreenLayout';
import BottomSheet from '../components/BottomSheet';
import { useWebAuth } from '../context/WebAuthContext';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onBack: () => void;
  onSuccess: () => void;
  onGoRegister?: () => void;
  onGoSupport?: () => void;
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());
}

const inputClass =
  'w-full h-12 px-0 bg-transparent border-b border-white/[0.15] text-[15px] text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1a70ff] rounded-none';

const errorInputClass = 'border-red-500 focus:border-red-500';

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onSuccess, onGoRegister, onGoSupport }) => {
  const { login, resendEmailConfirmation } = useWebAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [showForgotSheet, setShowForgotSheet] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setEmailError(null);
    setPassError(null);
    const em = email.trim().toLowerCase();
    const pw = password;
    let hasError = false;
    if (!em) { setEmailError('Please enter your email'); hasError = true; }
    else if (!isValidEmail(em)) { setEmailError('Invalid email address'); hasError = true; }
    if (!pw) { setPassError('Please enter your password'); hasError = true; }
    if (hasError) return;

    setLoading(true);
    try {
      const { ok, error } = await login(em, pw);
      if (ok) {
        onSuccess();
      } else {
        const msg = error || 'Login failed';
        toast.show(msg, 'error');
        setLoginError(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.show(msg, 'error');
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEmailConfirmError = loginError?.toLowerCase().includes('confirm')
    || loginError?.toLowerCase().includes('not confirmed');

  return (
    <>
      <AuthFullScreenLayout
        onBack={onBack}
        title="Log In"
      >
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label className="block text-[13px] font-medium text-neutral-400 mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email"
              className={`${inputClass} ${emailError ? errorInputClass : ''}`}
            />
            {emailError ? <p className="mt-1.5 text-[12px] text-red-500">{emailError}</p> : null}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-400 mb-1">Password</label>
            <input
              id="login-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter your password"
              className={`${inputClass} ${passError ? errorInputClass : ''}`}
            />
            {passError ? <p className="mt-1.5 text-[12px] text-red-500">{passError}</p> : null}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="text-[13px] text-[#1a70ff] hover:text-[#1a70ff]/80 font-medium"
              onClick={() => setShowForgotSheet(true)}
            >
              Forgot Password?
            </button>
          </div>

          {isEmailConfirmError && (
            <div className="rounded-xl bg-[#1a70ff]/10 border border-[#1a70ff]/20 px-4 py-3 mt-4">
              <p className="text-[13px] text-white">{loginError}</p>
              <button
                type="button"
                disabled={resending || !resendEmailConfirmation}
                onClick={async () => {
                  setResending(true);
                  const res = await resendEmailConfirmation?.(email);
                  setResending(false);
                  if (!res?.ok) toast.show(res?.error || 'Error', 'error');
                  else toast.show('Verification email resent', 'success');
                }}
                className="mt-2 text-[13px] font-medium text-[#1a70ff] hover:underline disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend Email'}
              </button>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] rounded bg-[#1a70ff] text-white text-[16px] font-bold hover:bg-[#1a70ff]/90 active:bg-[#1a70ff]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Log In
            </button>
          </div>

          <p className="text-center text-[13px] text-neutral-400 pt-6">
            Don't have an account?{' '}
            <button type="button" className="text-[#1a70ff] font-medium" onClick={onGoRegister}>
              Sign Up
            </button>
          </p>
        </form>
      </AuthFullScreenLayout>

      <BottomSheet
        open={showForgotSheet}
        onClose={() => setShowForgotSheet(false)}
        title="Forgot Password"
        closeOnBackdrop
      >
        <p className="text-[14px] text-neutral-400 leading-relaxed mb-6">
          To reset your password, please contact our support team.
        </p>
        <button
          type="button"
          onClick={() => {
            setShowForgotSheet(false);
            onGoSupport?.();
          }}
          className="w-full h-12 rounded bg-[#1a70ff] text-white text-[15px] font-bold hover:bg-[#1a70ff]/90 transition-colors"
        >
          Contact Support
        </button>
      </BottomSheet>
    </>
  );
};

export default LoginPage;
