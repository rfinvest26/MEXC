import React, { useEffect } from 'react';

interface LoadingScreenProps {
  onAnimationComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onAnimationComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onAnimationComplete?.(), 600);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="h-[100dvh] w-full bg-background flex flex-col items-center justify-center gap-6 overflow-hidden">
      <img
        src="/mexc-logo.png"
        alt="MEXC"
        className="w-32 h-auto animate-premium-logo"
      />
      <div className="flex flex-col items-center gap-3 animate-premium-fade-in">
        <svg className="animate-premium-spin w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <path fill="#2b82f6" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-textMuted">MEXC</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
