import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import AuthFullScreenLayout from '../components/AuthFullScreenLayout';
import { useWebAuth } from '../context/WebAuthContext';
import { useToast } from '../context/ToastContext';

interface RegisterPageProps {
  onBack: () => void;
  onSuccess: () => void;
  onGoLogin?: () => void;
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());
}

const inputClass =
  'w-full h-12 px-0 bg-transparent border-b border-white/[0.15] text-[15px] text-white placeholder-neutral-500 outline-none transition-all focus:border-[#1a70ff] rounded-none';

const errorInputClass = 'border-red-500 focus:border-red-500';

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onSuccess, onGoLogin }) => {
  const { register } = useWebAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [confirmPassError, setConfirmPassError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPassError(null);
    setConfirmPassError(null);
    const em = email.trim().toLowerCase();
    const pw = password;
    const cpw = confirmPassword;
    let hasError = false;
    if (!em) { setEmailError('Please enter your email'); hasError = true; }
    else if (!isValidEmail(em)) { setEmailError('Invalid email address'); hasError = true; }
    if (!pw) { setPassError('Please enter your password'); hasError = true; }
    else if (pw.length < 6) { setPassError('Password must be at least 6 characters'); hasError = true; }
    if (!cpw) { setConfirmPassError('Please confirm your password'); hasError = true; }
    else if (pw !== cpw) { setConfirmPassError('Passwords do not match'); hasError = true; }

    if (hasError) return;

    setLoading(true);
    try {
      const { ok, error } = await register(em, pw, '', '');
      if (ok) {
        toast.show('Registration successful', 'success');
        onSuccess();
      } else {
        const msg = error || 'Registration failed';
        toast.show(msg, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFullScreenLayout
      onBack={onBack}
      title="Create Account"
      subtitle="Register with your email to start trading"
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label className="block text-[13px] font-medium text-neutral-400 mb-1">Email</label>
          <input
            id="reg-email"
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
            id="reg-pass"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Please enter your password"
            className={`${inputClass} ${passError ? errorInputClass : ''}`}
          />
          {passError ? <p className="mt-1.5 text-[12px] text-red-500">{passError}</p> : null}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-neutral-400 mb-1">Confirm Password</label>
          <input
            id="reg-confirm-pass"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Please confirm your password"
            className={`${inputClass} ${confirmPassError ? errorInputClass : ''}`}
          />
          {confirmPassError ? <p className="mt-1.5 text-[12px] text-red-500">{confirmPassError}</p> : null}
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[46px] rounded bg-[#1a70ff] text-white text-[16px] font-bold hover:bg-[#1a70ff]/90 active:bg-[#1a70ff]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Sign Up
          </button>
        </div>

        <p className="text-center text-[13px] text-neutral-400 pt-6">
          Already have an account?{' '}
          <button type="button" className="text-[#1a70ff] font-medium" onClick={onGoLogin}>
            Log In
          </button>
        </p>
      </form>
    </AuthFullScreenLayout>
  );
};

export default RegisterPage;
