import React from 'react';
import { PageView } from '../types';
import { Haptic } from '../utils/haptics';
import { useLanguage } from '../context/LanguageContext';
import { ArrowDownLeft, ArrowUpRight, Scan, User } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (page: PageView) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const actions: { labelKey: string; icon: React.ElementType; highlight: boolean; target: PageView }[] = [
    { labelKey: 'quick_deposit', icon: ArrowDownLeft, highlight: true, target: 'DEPOSIT' },
    { labelKey: 'quick_withdraw', icon: ArrowUpRight, highlight: false, target: 'WITHDRAW' },
    { labelKey: 'quick_scan', icon: Scan, highlight: false, target: 'QR_SCANNER' },
    { labelKey: 'profile', icon: User, highlight: false, target: 'PROFILE' },
  ];

  return (
    <div className="flex justify-between items-start gap-2 px-4 lg:px-6 mb-6 max-w-2xl mx-auto lg:max-w-4xl">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.labelKey}
            type="button"
            onClick={() => { Haptic.tap(); onNavigate(action.target); }}
            className="touch-target flex flex-col items-center flex-1 min-w-0 gap-2 active:scale-[0.95] transition-transform focus:outline-none"
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                action.highlight
                  ? 'bg-neon text-black'
                  : 'bg-surface text-textPrimary hover:bg-surfaceElevated'
              }`}
            >
              <Icon size={20} />
            </div>
            <span className="text-[11px] font-medium text-textSecondary text-center leading-tight">
              {t(action.labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
