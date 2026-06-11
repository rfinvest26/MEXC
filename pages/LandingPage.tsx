import React, { useState } from 'react';
import LegalDocModal, { LegalDocId } from '../components/LegalDocModal';
import PromoLandingContent from '../components/PromoLandingContent';
import AssetTable from '../components/AssetTable';
import { useLiveAssets } from '../utils/useLiveAssets';
import { MOCK_ASSETS, ETORO_LOGO_URL } from '../constants';

interface LandingPageProps {
  refId: string;
  bonus: number | null;
  onLogin: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ refId, bonus, onLogin, onRegister }) => {
  const [legal, setLegal] = useState<LegalDocId | null>(null);
  const liveAssets = useLiveAssets(MOCK_ASSETS);


  return (
    <div className="h-[100dvh] bg-[#0b0e11] text-white flex flex-col relative">
      {/* Nav */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 w-full bg-[#0b0e11] sticky top-0 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <img src={ETORO_LOGO_URL} alt="Logo" width={24} height={24} className="object-contain" />
          <span className="text-[17px] font-bold text-white tracking-tight">MEXC</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLogin}
            className="text-[14px] font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="px-3 py-1.5 rounded text-[14px] font-medium bg-[#1a70ff] text-white hover:bg-[#1a70ff]/90 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content scrollable area */}
      <main className="relative z-10 flex-1 w-full mx-auto px-4 pb-28 pt-8 overflow-y-auto">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <h1 className="text-[28px] sm:text-[36px] font-bold text-white leading-tight mb-2">
            Lowest Fees<br />Highest Returns
          </h1>
          <p className="text-[14px] sm:text-[16px] text-neutral-400 max-w-md mx-auto mb-6">
            Join the world's leading crypto exchange
          </p>
          <div className="flex justify-center max-w-xs mx-auto">
            <button
              type="button"
              onClick={onRegister}
              className="w-full py-3.5 rounded-lg bg-[#1a70ff] text-white font-bold text-[15px] hover:bg-[#1a70ff]/90 transition-colors"
            >
              Sign Up Now
            </button>
          </div>
          {refId ? (
            <p className="mt-4 text-[12px] text-[#1a70ff]">
              {bonus 
                ? `You received a ${bonus.toLocaleString()} bonus from your referral link!` 
                : 'You have successfully applied the referral link.'}
            </p>
          ) : null}
        </section>

        {/* Top Assets Table */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-white">Trending Markets</h2>
            <button type="button" onClick={onRegister} className="text-[13px] text-neutral-400 hover:text-white transition-colors">
              View All &gt;
            </button>
          </div>
          <div className="bg-[#11131a] rounded-xl border border-white/[0.02] overflow-hidden">
            <AssetTable assets={liveAssets.slice(0, 5)} onAssetClick={onRegister} hideFilterBar variant="minimal" />
          </div>
        </section>

        {/* Promo Blocks from Screenshot */}
        <PromoLandingContent onAction={onRegister} />
        
        {/* Footer Links */}
        <section className="mt-8 mb-4 border-t border-white/[0.05] pt-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[12px] text-neutral-500">
            <button type="button" onClick={() => setLegal('tos')}>Terms of Service</button>
            <button type="button" onClick={() => setLegal('privacy')}>Privacy Policy</button>
            <button type="button" onClick={() => setLegal('aml')}>AML/KYC</button>
            <button type="button" onClick={() => setLegal('cookies')}>Cookies</button>
          </div>
          <p className="text-center text-[12px] text-neutral-600 mt-6">&copy; {new Date().getFullYear()} MEXC</p>
        </section>
      </main>

      {/* Fixed Sticky Footer for Sign Up (like the screenshot) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b0e11]/95 backdrop-blur-xl border-t border-white/[0.05] p-4 z-30 pb-safe">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px bg-white/10 w-8" />
          <span className="text-[11px] text-[#f0b90b] font-medium">$10,000 New User Rewards</span>
          <div className="h-px bg-white/10 w-8" />
        </div>
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={onRegister}
            className="flex-1 py-3 rounded-xl bg-[#1a70ff] text-white font-bold text-[15px] hover:bg-[#1a70ff]/90 transition-colors"
          >
            Sign Up Now
          </button>
          <div className="flex rounded-xl bg-[#1a1d26] overflow-hidden flex-none">
            <button type="button" onClick={onRegister} className="px-4 flex items-center justify-center hover:bg-white/5 border-r border-white/5">
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/>
              </svg>
            </button>
            <button type="button" onClick={onRegister} className="px-4 flex items-center justify-center hover:bg-white/5">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.365 14.613c-.021-2.453 2.036-3.666 2.128-3.722-1.159-1.688-2.96-1.921-3.606-1.946-1.522-.153-2.977.892-3.755.892-.777 0-1.964-.871-3.218-.847-1.611.026-3.097.934-3.929 2.37-1.686 2.91-.43 7.214 1.214 9.574.805 1.156 1.748 2.451 3 2.404 1.205-.05 1.664-.784 3.12-.784 1.455 0 1.884.784 3.146.759 1.288-.025 2.099-1.168 2.898-2.321.924-1.344 1.306-2.646 1.326-2.715-.028-.01-2.527-.962-2.324-3.664zm-2.046-5.467c.664-.799 1.111-1.912.989-3.023-.96.039-2.115.637-2.796 1.433-.541.628-1.077 1.761-.933 2.853 1.072.083 2.076-.465 2.74-1.263z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <LegalDocModal doc={legal} onClose={() => setLegal(null)} />
    </div>
  );
};

export default LandingPage;
