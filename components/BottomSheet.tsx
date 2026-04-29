import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Z_INDEX } from '../constants/zIndex';
import { Haptic } from '../utils/haptics';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Тип нижнего шита:
   * - 'partial' — быстрые действия, небольшие подтверждения (30–60% высоты)
   * - 'expandable' — панели с большим количеством контента (40–90% высоты)
   * - 'fullscreen' — выбор/флоу на весь экран (100% высоты)
   * По умолчанию partial.
   */
  variant?: 'partial' | 'expandable' | 'fullscreen';
  /** Закрывать по клику на затемнённый фон. По умолчанию true — удобно для подтверждений и форм. */
  closeOnBackdrop?: boolean;
  /** Дополнительный класс для панели контента */
  contentClassName?: string;
  /** Показывать иконку закрытия в правом верхнем углу (для expandable‑листов). По умолчанию false. */
  showCloseButton?: boolean;
  /** Зафиксировать шапку (header) при прокрутке контента. По умолчанию true. */
  stickyHeader?: boolean;
  /** Доп. классы для шапки */
  headerClassName?: string;
  /** Доп. классы для заголовка */
  titleClassName?: string;
  /** Показывать нижний разделитель в шапке. По умолчанию true. */
  showHeaderDivider?: boolean;
  /** Центрировать заголовок. По умолчанию true. */
  centerTitle?: boolean;
  /** Показать верхний drag-handle. По умолчанию true (кроме fullscreen). */
  showHandle?: boolean;
  /** Блокировать скролл приложения под шитом. По умолчанию true. */
  lockScroll?: boolean;
}

/**
 * Единый fullscreen bottom sheet: поверх страницы и навбара (z-index 60).
 * Красивое открытие (backdrop + slide-up 300ms), закрытие по клику на пустую область.
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  children,
  variant = 'partial',
  closeOnBackdrop = true,
  contentClassName = '',
  showCloseButton = false,
  stickyHeader = true,
  headerClassName = '',
  titleClassName = '',
  showHeaderDivider = true,
  centerTitle = true,
  showHandle,
  lockScroll = true,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (closeOnBackdrop) {
      Haptic.light();
      onClose();
    }
  };

  const handleClose = () => {
    Haptic.tap();
    onClose();
  };

  useEffect(() => {
    if (!open) return undefined;
    if (!lockScroll) return undefined;
    const root = typeof document !== 'undefined' ? document.getElementById('root') : null;
    const main = typeof document !== 'undefined' ? (document.querySelector('main') as HTMLElement | null) : null;

    const prevRootOverflowY = root?.style.overflowY;
    const prevMainOverflowY = main?.style.overflowY;
    const prevMainTouchAction = main?.style.touchAction;

    // В приложении скролл обычно живёт в <main>, поэтому блокируем именно его.
    if (root) root.style.overflowY = 'hidden';
    if (main) {
      main.style.overflowY = 'hidden';
      main.style.touchAction = 'none';
    }
    return () => {
      if (root) root.style.overflowY = prevRootOverflowY || '';
      if (main) {
        main.style.overflowY = prevMainOverflowY || '';
        main.style.touchAction = prevMainTouchAction || '';
      }
    };
  }, [open, lockScroll]);

  if (!open) return null;

  const panelHeights =
    variant === 'fullscreen'
      ? 'h-[100dvh] max-h-[100dvh] min-h-[100dvh] border-0'
      : variant === 'partial'
      ? 'max-h-[60vh] min-h-[26vh]'
      : 'max-h-[90vh] min-h-[34vh]';

  const panelBase =
    variant === 'fullscreen'
      ? 'w-full bg-background shadow-2xl animate-sheet-up overflow-hidden flex flex-col'
      : 'w-full max-w-md bg-background rounded-t-3xl shadow-2xl animate-sheet-up overflow-hidden flex flex-col';

  const overlayAlign = variant === 'fullscreen' ? 'items-stretch' : 'items-end';

  const effectiveShowHandle = showHandle ?? variant !== 'fullscreen';

  return (
    <div
      className={`fixed inset-0 flex ${overlayAlign} justify-center bg-black/75 animate-fade-in transition-opacity duration-200`}
      style={{
        zIndex: variant === 'fullscreen' ? Z_INDEX.fullscreen : Z_INDEX.modal,
        paddingBottom: variant === 'fullscreen' ? undefined : 'env(safe-area-inset-bottom)',
        paddingLeft: variant === 'fullscreen' ? undefined : 'env(safe-area-inset-left)',
        paddingRight: variant === 'fullscreen' ? undefined : 'env(safe-area-inset-right)',
        paddingTop: variant === 'fullscreen' ? undefined : 'env(safe-area-inset-top)',
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bottom-sheet-title"
    >
      <div
        className={`${panelBase} ${panelHeights} ${variant === 'fullscreen' ? '' : 'pb-safe'} ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle для partial/expandable типов */}
        {effectiveShowHandle && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="h-1 w-10 rounded-full bg-white/15" aria-hidden />
          </div>
        )}
        <div
          className={[
            'bg-background',
            stickyHeader ? 'sticky top-0 z-10' : '',
            variant === 'fullscreen' ? 'px-4 pt-3 pb-2.5 min-h-[52px]' : 'px-4 pb-2 min-h-[40px]',
            showHeaderDivider ? 'hairline-bottom' : '',
            headerClassName,
          ].join(' ')}
        >
          <div className="relative flex items-center justify-center min-h-[40px]">
            <h3
              id="bottom-sheet-title"
              className={[
                'text-textPrimary truncate',
                variant === 'fullscreen' ? 'text-base font-bold' : 'text-sm font-semibold',
                centerTitle ? 'text-center max-w-[72%]' : 'text-left w-full pr-12',
                titleClassName,
              ].join(' ')}
            >
              {title}
            </h3>
            {(variant === 'expandable' || variant === 'fullscreen' || variant === 'partial') && showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-0 top-1/2 -translate-y-1/2 touch-target h-9 w-9 rounded-2xl text-textMuted hover:text-textPrimary hover:bg-card/40 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Закрыть"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
        <div className={variant === 'fullscreen' ? 'flex-1 min-h-0 overflow-y-auto scroll-app p-3 space-y-4' : 'flex-1 min-h-0 overflow-y-auto scroll-app p-3 space-y-4'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
