import React, { useState, useEffect, Children } from 'react';
import Button from '../shared/small/Button';

const Stepper = ({ steps, currentStep, visibleSteps = 5, Children, emptyRequiredFields = [] }) => {
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
      const stepsPerScreen = Math.max(3, Math.floor(windowWidth / 200));
      let start = Math.max(0, currentStep - Math.floor(stepsPerScreen / 2));
      let end = Math.min(totalSteps, start + stepsPerScreen);
      // Adjust start/end if near boundaries
      if (end === totalSteps) start = Math.max(0, end - stepsPerScreen);
      if (start === 0) end = Math.min(totalSteps, start + stepsPerScreen);
      setVisibleStepRange({ start, end });
    }
  }, [currentStep, totalSteps, windowWidth]);

  const displayedSteps = steps.slice(visibleStepRange.start, visibleStepRange.end);
  return (
    <div className="w-full p-4">
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
                      ? `border-primary ${emptyRequiredFields.includes(actualIndex) ? 'bg-[#974748]' : 'bg-primary'}`
                      : actualIndex === currentStep
                        ? 'border-primary'
                        : `!border-gray-300 ${emptyRequiredFields.includes(actualIndex) ? 'bg-[#974748]/30' : ''}`
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
                    <div className="bg-primary h-3 w-3 rounded-full" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Label positioned below */}
                {/* Add empty div for consistent spacing when label is hidden */}
                <div className="fixed top-[166px]">
                  {actualIndex === currentStep && (
                    <div className="text-primary mt-2 text-center text-xs font-medium whitespace-nowrap">{step}</div>
                  )}
                </div>
                {actualIndex !== currentStep && <div className="mt-2 h-[20px]" />}
              </div>

              {/* Connector Line to the right (only if not the last step in view) */}
              {!isLastDisplayedStep && (
                <div
                  className={`h-[2px] flex-auto ${actualIndex < currentStep ? 'bg-primary' : 'bg-gray-300'}`}
                  style={{ marginBottom: '28px' }} // Adjusted margin to align with circle center
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="h-[calc(100vh-420px)]">{Children}</div>

      {/* Navigation Buttons */}
    </div>
  );
};

export default Stepper;
