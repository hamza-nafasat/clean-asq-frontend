import { Fragment, useEffect, useState } from "react";

const WIDE_SCREEN_WIDTH = 1440;
const MIN_STEPS_PER_SCREEN = 3;
const PIXELS_PER_STEP = 200;
const WIDE_PIXELS_PER_STEP = 100;

const getStepCircleClasses = (actualIndex, currentStep, isEmptyRequired) => {
  if (actualIndex < currentStep) return `border-accent ${isEmptyRequired ? "bg-[#974748]" : "bg-accent"}`;
  if (actualIndex === currentStep) return "border-accent bg-accent";
  return `border-gray-300 ${isEmptyRequired ? "bg-[#974748]/30" : "bg-white"}`;
};

// window of steps around the current one
const getVisibleStepRange = (windowWidth, currentStep, totalSteps) => {
  const pixelsPerStep = windowWidth >= WIDE_SCREEN_WIDTH ? WIDE_PIXELS_PER_STEP : PIXELS_PER_STEP;
  const stepsPerScreen = Math.max(MIN_STEPS_PER_SCREEN, Math.floor(windowWidth / pixelsPerStep));
  const maxStart = Math.max(0, totalSteps - stepsPerScreen);
  const start = Math.min(maxStart, Math.max(0, currentStep - Math.floor(stepsPerScreen / 2)));
  return { start, end: Math.min(totalSteps, start + stepsPerScreen) };
};

const Stepper = ({ steps = [], currentStep, children, emptyRequiredFields = [], headerActions }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleStepRange = getVisibleStepRange(windowWidth, currentStep, steps.length);
  const displayedSteps = steps.slice(visibleStepRange.start, visibleStepRange.end);

  return (
    <div className="w-full p-4">
      {/* Stepper header */}
      <div className="mb-8 flex items-center justify-between overflow-x-auto overflow-y-hidden">
        {displayedSteps.map((step, index) => {
          const actualIndex = visibleStepRange.start + index;
          const isLastDisplayedStep = index === displayedSteps.length - 1;
          return (
            <Fragment key={actualIndex}>
              <div className={`relative flex flex-col items-center ${actualIndex === currentStep ? "-top-3.5" : ""}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${getStepCircleClasses(
                    actualIndex,
                    currentStep,
                    emptyRequiredFields.includes(actualIndex),
                  )}`}
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

                <div className="mt-2">
                  <div
                    title={step}
                    className={`text-center text-xs font-medium xl:max-w-10 cursor-pointer xl:truncate transition-colors duration-200 ${actualIndex === currentStep ? "text-accent" : "text-gray-400"} `}
                  >
                    {step}
                  </div>
                </div>
                {actualIndex !== currentStep && <div className="mt-2 h-5" />}
              </div>

              {/* Connector line */}
              {!isLastDisplayedStep && (
                <div
                  className={`h-0.5 flex-auto ${actualIndex < currentStep ? "bg-accent" : "bg-gray-300"}`}
                  style={{ marginBottom: "48px" }}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Actions between the step nav and the content */}
      {headerActions && <div className="flex justify-end mb-2">{headerActions}</div>}

      <div>{children}</div>
    </div>
  );
};

export default Stepper;
