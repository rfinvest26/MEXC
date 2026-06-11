import React from 'react';

interface PromoLandingContentProps {
  onAction: () => void;
}

const PromoLandingContent: React.FC<PromoLandingContentProps> = ({ onAction }) => {
  return (
    <div className="flex flex-col gap-4 mt-8 pb-32">
      {/* 1. Everyday Airdrops */}
      <div className="bg-[#11131a] rounded-xl p-5 border border-white/[0.02]">
        <h2 className="text-lg font-bold text-center text-white mb-6">
          Everyday Airdrops
        </h2>
        <div className="flex justify-between items-center px-2">
          {/* Launchpool */}
          <button type="button" onClick={onAction} className="flex flex-col items-center flex-1 border-r border-white/5 active:scale-95 transition-transform">
            <div className="w-8 h-8 flex items-center justify-center mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.1685 5.51322L19.2319 5.48529C19.7891 5.23961 20.3546 5.80512 20.1089 6.36224L20.081 6.42562C19.6433 7.41841 19.349 8.52048 19.349 9.6806C19.349 13.916 22.1818 17.5147 26 18.7766L17.7811 20.4485C16.9298 20.6217 16.0376 20.6217 15.1863 20.4485L6.96738 18.7766C10.7856 17.5147 13.6184 13.916 13.6184 9.6806C13.6184 8.52048 13.3241 7.41841 12.8864 6.42562L12.8584 6.36224C12.6128 5.80512 13.1783 5.23961 13.7354 5.48529L13.7988 5.51322C14.7916 5.95085 15.8937 6.24519 17.0538 6.24519C17.7601 6.24519 18.4449 6.15545 19.102 5.98634C19.1241 5.82915 19.1417 5.67145 19.1685 5.51322Z" fill="white"/>
                <path d="M16 2C15.4477 2 15 2.44772 15 3V6C15 6.55228 15.4477 7 16 7C16.5522 7 17 6.55228 17 6V3C17 2.44772 16.5522 2 16 2Z" fill="white"/>
                <path d="M6 12L10.334 5.49842C11.5126 3.73059 14.1593 3.66613 15.4191 5.37397L19.5 10.9062" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-white font-bold text-[15px] flex items-center gap-1">
              1,000%+ APR
              <div className="w-3.5 h-3.5 rounded-full border border-neutral-500 text-neutral-500 flex items-center justify-center text-[10px] font-medium leading-none">i</div>
            </div>
            <div className="text-neutral-500 text-xs mt-1">Launchpool &gt;</div>
          </button>
          
          {/* Kickstarter */}
          <button type="button" onClick={onAction} className="flex flex-col items-center flex-1 active:scale-95 transition-transform">
            <div className="w-8 h-8 flex items-center justify-center mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.5 9H22L16 13.5L18 21L12 16.5L6 21L8 13.5L2 9H9.5L12 2Z" fill="white"/>
              </svg>
            </div>
            <div className="text-white font-bold text-[15px]">16.4% APR</div>
            <div className="text-neutral-500 text-xs mt-1">Kickstarter &gt;</div>
          </button>
        </div>
      </div>

      {/* 2. Xtremely Low Fees */}
      <div className="bg-[#11131a] rounded-xl p-5 border border-white/[0.02]">
        <h2 className="text-lg font-bold text-center text-white mb-4">
          Xtremely Low Fees
        </h2>
        
        <div className="flex justify-center mb-6">
          <div className="bg-[#1a1d26] rounded-full p-1 flex">
            <button type="button" onClick={onAction} className="px-4 py-1.5 rounded-full bg-[#2a2d36] text-white text-sm font-medium">Futures</button>
            <button type="button" onClick={onAction} className="px-4 py-1.5 rounded-full text-neutral-400 text-sm font-medium hover:text-white">Spot</button>
          </div>
        </div>

        <div className="flex justify-between items-end gap-2 h-24">
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="text-white font-semibold text-[13px] mb-2">Maker 0%</div>
            <div className="w-full h-1 bg-transparent" />
          </div>
          <div className="w-px h-12 bg-white/10 mx-2" />
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="text-neutral-500 font-semibold text-[13px] mb-2">Taker 0.02%</div>
            <div className="w-[80px] h-[60px] bg-[#323644] rounded-t flex items-center justify-center">
              <span className="text-white text-[11px] font-medium">0.02%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Liquidity */}
      <div className="bg-[#11131a] rounded-xl p-5 border border-white/[0.02]">
        <h2 className="text-lg font-bold text-center text-white mb-4">
          Comprehensive Liquidity
        </h2>
        
        <div className="flex justify-center mb-6">
          <div className="bg-[#1a1d26] rounded-full p-1 flex">
            <button type="button" onClick={onAction} className="px-4 py-1.5 rounded-full bg-[#2a2d36] text-white text-sm font-medium">Futures</button>
            <button type="button" onClick={onAction} className="px-4 py-1.5 rounded-full text-neutral-400 text-sm font-medium hover:text-white">Spot</button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-white font-medium">
          <button type="button" onClick={onAction} className="w-5 h-5 rounded-full bg-[#627eea] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.944 17.97L4.58013 13.62L11.944 24L19.32 13.62L11.944 17.97Z" fill="white" fillOpacity="0.8"/>
              <path d="M11.944 0L4.58013 12.23L11.944 16.58L19.32 12.23L11.944 0Z" fill="white"/>
            </svg>
          </button>
          <button type="button" onClick={onAction} className="hover:text-white transition-colors">ETH ▼</button> <span className="text-white/20 mx-1">|</span> 1.5x of Industry Peer
        </div>

        <div className="flex justify-center items-end gap-6 h-32">
          <div className="flex flex-col items-center justify-end h-full">
            <div className="w-[60px] h-[100px] bg-[#a9c9f6] rounded-t flex items-start justify-center pt-2 relative">
              <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-[#1a70ff]/20 to-transparent" />
              <span className="text-[#11131a] text-[11px] font-bold z-10">12.87M</span>
            </div>
            <div className="text-white font-bold text-sm mt-3">MEXC</div>
          </div>
          <div className="flex flex-col items-center justify-end h-full">
            <div className="w-[60px] h-[60px] bg-[#323644] rounded-t flex items-start justify-center pt-2">
              <span className="text-white text-[11px] font-medium">8.84M</span>
            </div>
            <div className="text-neutral-500 font-medium text-sm mt-3">B***</div>
          </div>
        </div>
      </div>

      {/* 4. Three Major Measures */}
      <div className="bg-[#11131a] rounded-xl p-6 border border-white/[0.02]">
        <h2 className="text-lg font-bold text-center text-white mb-2 leading-snug">
          Three Major Measures to Safeguard Asset Security
        </h2>
        <div className="flex justify-center gap-1.5 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1a70ff]" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
};

export default PromoLandingContent;
