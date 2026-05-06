import React, { useState, useEffect } from 'react';

const SplashScreen: React.FC = () => {
  const [status, setStatus] = useState('Initializing system...');

  useEffect(() => {
    const statuses = [
      'Connecting to secure server...',
      'Fetching market data...',
      'Loading account assets...',
      'Verifying security protocols...',
      'Finalizing setup...'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length) {
        setStatus(statuses[i]);
        i++;
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070B12]">
      <div className="relative flex flex-col items-center">
        {/* Premium Glow effect */}
        <div className="absolute inset-0 bg-accent/10 blur-[80px] rounded-full scale-150 animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center">
          <img 
            src="/mexc-logo.png" 
            alt="MEXC" 
            className="w-56 h-auto animate-fade-in"
          />
          
          <div className="mt-16 flex flex-col items-center gap-6">
            {/* Minimalist Premium Spinner */}
            <div className="relative w-48 h-[1px] bg-white/5 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-accent animate-[loading-bar_2.5s_infinite_ease-in-out]" />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent/80 animate-pulse">
                {status}
              </span>
              <span className="text-[9px] text-textSubtle/50 uppercase tracking-[0.1em]">
                MEXC Global • Secure Environment
              </span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 0.9; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default SplashScreen;
