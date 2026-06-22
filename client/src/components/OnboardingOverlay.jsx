import { useState, useEffect } from 'react';

export default function OnboardingOverlay({ steps, storageKey, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    const targetId = steps[currentStep]?.target;
    if (!targetId) {
      setSpotlightRect(null);
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right,
        });
      } else {
        setSpotlightRect(null);
      }
    };

    const el = document.querySelector(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Wait a moment for scroll to complete
      const timer = setTimeout(updatePosition, 300);

      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onClose();
  };

  // Calculate card positioning based on the highlighted target rect
  const getCardStyle = () => {
    if (!spotlightRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 55,
      };
    }

    const margin = 20;
    const cardWidth = 360;
    const cardHeight = 240; // Estimated max height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top, left;

    // Placed below target if there is room, otherwise above
    if (spotlightRect.bottom + cardHeight + margin < viewportHeight) {
      top = spotlightRect.bottom + margin;
    } else if (spotlightRect.top - cardHeight - margin > 0) {
      top = spotlightRect.top - cardHeight - margin;
    } else {
      top = Math.max(margin, spotlightRect.top + (spotlightRect.height - cardHeight) / 2);
    }

    // Centered relative to target, bounded by screen edges
    left = spotlightRect.left + (spotlightRect.width - cardWidth) / 2;
    left = Math.max(margin, Math.min(left, viewportWidth - cardWidth - margin));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 55,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  if (!steps || steps.length === 0) return null;
  const activeStep = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 select-none overflow-hidden">
      {/* Spotlight Mask */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-40">
        <defs>
          <mask id="onboarding-spotlight-mask">
            {/* White overlay lets colors through (so masks backdrop) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black shape punches a transparent hole */}
            {spotlightRect && (
              <rect
                x={spotlightRect.left - 12}
                y={spotlightRect.top - 12}
                width={spotlightRect.width + 24}
                height={spotlightRect.height + 24}
                rx="12"
                ry="12"
                fill="black"
                className="transition-all duration-300 ease-in-out"
              />
            )}
          </mask>
        </defs>
        {/* Dark backdrop masked to have hole */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.75)"
          mask="url(#onboarding-spotlight-mask)"
          className="pointer-events-auto"
        />
      </svg>

      {/* Floating Tour Card */}
      <div 
        style={getCardStyle()} 
        className="bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl rounded-2xl p-5 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200 text-white"
      >
        <div>
          {/* Header & Icon */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl animate-bounce" role="img" aria-hidden="true">
              {activeStep.icon}
            </span>
            <h4 className="text-base font-bold text-white leading-snug">
              {activeStep.title}
            </h4>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed min-h-[60px] select-text">
            {activeStep.description}
          </p>
        </div>

        {/* Footer controls */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentStep ? 'w-4 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors px-2 py-1 cursor-pointer"
            >
              Skip
            </button>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-[11px] font-semibold text-slate-200 border border-slate-800 hover:bg-white/5 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-950 px-3.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
