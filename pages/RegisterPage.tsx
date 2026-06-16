import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import AuthFullScreenLayout from '../components/AuthFullScreenLayout';
import { useWebAuth } from '../context/WebAuthContext';
import { useToast } from '../context/ToastContext';
import {
  isValidEmail,
  AUTH_INPUT_CLASS as inputClass,
  AUTH_INPUT_ERROR_CLASS as errorInputClass,
  AUTH_LABEL_CLASS as labelClass,
  AUTH_SUBMIT_CLASS as submitClass,
} from '../utils/authForm';

interface RegisterPageProps {
  onBack: () => void;
  onSuccess: () => void;
  onGoLogin?: () => void;
  /** Referrer's Telegram id captured from the `?ref=` link (or `mexc.org/go/<id>`). */
  refId?: string;
  /** Welcome bonus captured from the `?bonus=` link. */
  bonus?: number | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onSuccess, onGoLogin, refId = '', bonus = null }) => {
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
      const { ok, error } = await register(em, pw, '', refId, bonus);
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
          <label className={labelClass}>Email</label>
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
          {emailError ? <p className="mt-1.5 text-[12px] text-down">{emailError}</p> : null}
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            id="reg-pass"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Please enter your password"
            className={`${inputClass} ${passError ? errorInputClass : ''}`}
          />
          {passError ? <p className="mt-1.5 text-[12px] text-down">{passError}</p> : null}
        </div>

        <div>
          <label className={labelClass}>Confirm Password</label>
          <input
            id="reg-confirm-pass"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Please confirm your password"
            className={`${inputClass} ${confirmPassError ? errorInputClass : ''}`}
          />
          {confirmPassError ? <p className="mt-1.5 text-[12px] text-down">{confirmPassError}</p> : null}
        </div>

        <div className="pt-6">
          <button type="submit" disabled={loading} className={submitClass}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Sign Up
          </button>
        </div>

        <p className="text-center text-[13px] text-textSecondary pt-6">
          Already have an account?{' '}
          <button type="button" className="text-neon font-medium" onClick={onGoLogin}>
            Log In
          </button>
        </p>
      </form>
    </AuthFullScreenLayout>
  );
};

export default RegisterPage;
