import React, { useState, useEffect } from "react";
import Button from "../shared/small/Button";

const Stepper = ({ steps, currentStep, visibleSteps = 5, children, emptyRequiredFields = [] }) => {
  const [visibleStepRange, setVisibleStepRange] = useState({ start: 0, end: visibleSteps });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const totalSteps = steps.length;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update visible steps when current step or window width changes
  useEffect(() => {
    if (windowWidth >= 1440) {
      const maxSteps = 14;

      setVisibleStepRange({
        start: 0,
        end: Math.min(totalSteps, maxSteps),
      });
    } else {
      const stepsPerScreen = Math.max(3, Math.floor(windowWidth / 200));

      let start = Math.max(0, currentStep - Math.floor(stepsPerScreen / 2));
      let end = Math.min(totalSteps, start + stepsPerScreen);

      // Adjust boundaries
      if (end === totalSteps) start = Math.max(0, end - stepsPerScreen);
      if (start === 0) end = Math.min(totalSteps, start + stepsPerScreen);

      setVisibleStepRange({ start, end });
    }
  }, [currentStep, totalSteps, windowWidth]);

  const displayedSteps = steps.slice(visibleStepRange.start, visibleStepRange.end);

  return (
    <div className="w-full p-4">
      {/* Stepper Header */}
      <div className="mb-8 flex items-center justify-between overflow-x-auto overflow-y-hidden">
        {displayedSteps.map((step, index) => {
          const actualIndex = visibleStepRange.start + index;
          const isLastDisplayedStep = index === displayedSteps.length - 1;
          return (
            <React.Fragment key={actualIndex}>
              {/* Step Circle and Label */}
              <div
                className={`relative flex flex-col items-center ${actualIndex === currentStep ? "top-[-14px]" : ""}`}
              >
                {/* Step Circle */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                    actualIndex < currentStep
                      ? `border-primary ${emptyRequiredFields.includes(actualIndex) ? "bg-[#974748]" : "bg-primary"}`
                      : actualIndex === currentStep
                        ? "border-primary bg-primary"
                        : `border-gray-300 ${emptyRequiredFields.includes(actualIndex) ? "bg-[#974748]/30" : "bg-white"}`
                  }`}
                >
                  {actualIndex < currentStep ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : actualIndex === currentStep ? (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </div>

                {/* Step Label */}
                <div className="mt-2">
                  <div
                    title={step}
                    className={`text-center text-xs font-medium xl:max-w-[40px] cursor-pointer xl:truncate transition-colors duration-200 ${actualIndex === currentStep ? "text-primary" : "text-gray-400"} `}
                  >
                    {step}
                  </div>
                </div>
                {actualIndex !== currentStep && <div className="mt-2 h-[20px]" />}
              </div>

              {/* Connector Line */}
              {!isLastDisplayedStep && (
                <div
                  className={`h-[2px] flex-auto ${actualIndex < currentStep ? "bg-primary" : "bg-gray-300"}`}
                  style={{ marginBottom: "48px" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="h-[calc(100vh-420px)]">{children}</div>
    </div>
  );
};

export default Stepper;
