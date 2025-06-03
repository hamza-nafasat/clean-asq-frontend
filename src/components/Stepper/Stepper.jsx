import React, { useState, useEffect, Children } from 'react';

const Stepper = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  visibleSteps = 5, // Number of steps to show at once on mobile
  Children,
}) => {
  const [visibleStepRange, setVisibleStepRange] = useState({ start: 0, end: visibleSteps });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const totalSteps = steps.length;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update visible steps when current step or window width changes
  useEffect(() => {
    if (windowWidth >= 1440) {
      // Show all steps on screens 1440px and above
      setVisibleStepRange({ start: 0, end: totalSteps });
    } else {
      // Calculate visible steps based on screen width
      const stepsPerScreen = Math.max(3, Math.floor(windowWidth / 200)); // At least 3 steps, or more based on screen width

      // Ensure current step is always visible and reasonably centered
      let start = Math.max(0, currentStep - Math.floor(stepsPerScreen / 2));
      let end = Math.min(totalSteps, start + stepsPerScreen);

      // Adjust start/end if near boundaries
      if (end === totalSteps) {
        start = Math.max(0, end - stepsPerScreen);
      }
      if (start === 0) {
        end = Math.min(totalSteps, start + stepsPerScreen);
      }

      setVisibleStepRange({ start, end });
    }
  }, [currentStep, totalSteps, windowWidth]);

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    onComplete();
  };

  const displayedSteps = steps.slice(visibleStepRange.start, visibleStepRange.end);

  return (
    <div className="w-full">
      {/* Stepper Container */}
      <div className="mb-8 flex items-center justify-between overflow-x-auto">
        {displayedSteps.map((step, index) => {
          const actualIndex = visibleStepRange.start + index;
          const isLastDisplayedStep = index === displayedSteps.length - 1;

          return (
            <React.Fragment key={actualIndex}>
              {/* Step Circle and Label */}
              <div
                className={`relative flex flex-col items-center ${actualIndex === currentStep ? 'top-[-14px]' : ''}`}
              >
                {/* Step Circle */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    actualIndex < currentStep
                      ? 'border-[#15A090] bg-[#15A090]'
                      : actualIndex === currentStep
                        ? 'border-[#15A090]'
                        : 'border-gray-300'
                  }`}
                >
                  {/* Circle content */}
                  {actualIndex < currentStep ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : actualIndex === currentStep ? (
                    <div className="h-3 w-3 rounded-full bg-[#15A090]" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Label positioned below */}
                {/* Add empty div for consistent spacing when label is hidden */}
                <div className="fixed top-[166px]">
                  {actualIndex === currentStep && (
                    <div className="mt-2 text-center text-xs font-medium whitespace-nowrap text-[#15A090]">{step}</div>
                  )}
                </div>
                {actualIndex !== currentStep && <div className="mt-2 h-[20px]" />}
              </div>

              {/* Connector Line to the right (only if not the last step in view) */}
              {!isLastDisplayedStep && (
                <div
                  className={`h-[2px] flex-auto ${actualIndex < currentStep ? 'bg-[#15A090]' : 'bg-gray-300'}`}
                  style={{ marginBottom: '28px' }} // Adjusted margin to align with circle center
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {Children}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-end gap-5">
        {currentStep > 0 && (
          <button
            onClick={handlePrevious}
            className="rounded bg-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-300"
          >
            &lt; Previous
          </button>
        )}
        {currentStep < totalSteps - 1 ? (
          <button
            onClick={handleNext}
            className="rounded bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
          >
            Next &gt;
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="rounded bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default Stepper;
