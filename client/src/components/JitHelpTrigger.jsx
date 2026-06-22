import { useState, useEffect, useRef } from 'react';

export default function JitHelpTrigger({
  storageKey,
  title,
  description,
  placement = 'bottom',
  widthClass = 'w-60'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Automatically trigger on first visit if not yet dismissed
    if (storageKey) {
      const completed = localStorage.getItem(storageKey);
      if (completed !== 'true') {
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    // Close tooltip if clicking outside
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  // Tooltip position classes
  const getPositionClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-2.5 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2.5 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2.5 top-1/2 -translate-y-1/2';
      case 'bottom-right':
        return 'top-full mt-2.5 left-0';
      case 'bottom-left':
        return 'top-full mt-2.5 right-0';
      case 'bottom':
      default:
        return 'top-full mt-2.5 left-1/2 -translate-x-1/2';
    }
  };

  // Arrow position classes
  const getArrowClasses = () => {
    switch (placement) {
      case 'top':
        return '-bottom-1.25 left-1/2 -translate-x-1/2 border-b border-r';
      case 'left':
        return '-right-1.25 top-1/2 -translate-y-1/2 border-t border-r';
      case 'right':
        return '-left-1.25 top-1/2 -translate-y-1/2 border-b border-l';
      case 'bottom-right':
        return '-top-1.25 left-3 border-t border-l';
      case 'bottom-left':
        return '-top-1.25 right-3 border-t border-l';
      case 'bottom':
      default:
        return '-top-1.25 left-1/2 -translate-x-1/2 border-t border-l';
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center ml-2 select-none z-30 align-middle">
      {/* Help Trigger Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-extrabold transition-all cursor-pointer ${isOpen
          ? 'bg-slate-900 text-white border border-slate-800 scale-110 shadow-xs'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 border border-gray-200'
          }`}
        aria-label={`Help about ${title}`}
        title="Click for feature guide"
      >
        ?
      </button>

      {/* JIT Tooltip Modal */}
      {isOpen && (
        <div
          className={`absolute ${getPositionClasses()} ${widthClass} bg-slate-800 border border-slate-700 text-white rounded-xl p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
        >
          {/* Arrow */}
          <div className={`absolute w-2.5 h-2.5 bg-slate-800 border-slate-700 rotate-45 pointer-events-none ${getArrowClasses()}`} />

          {/* Tooltip Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold tracking-tight text-white">{title}</span>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-200 hover:text-white transition-colors p-0.5 cursor-pointer text-xs leading-none"
                aria-label="Dismiss guide"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-[10px] text-slate-300 leading-relaxed mb-3 select-text">
              {description}
            </p>

            {/* CTA action */}
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[9px] font-bold bg-white hover:bg-slate-100 text-slate-950 px-2.5 py-1 rounded-md cursor-pointer transition-all shadow-xs"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
