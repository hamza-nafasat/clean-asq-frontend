import Button from "./Button";

// underline tabs inside a bordered nav
const UNDERLINE_VARIANT = "underline";
// pill tabs inside a white rounded bar
const PILL_VARIANT = "pill";
// primary / secondary buttons in a row
const BUTTON_VARIANT = "button";

// tabs: [{ value, label, badge }] · lockedTab: while set, only that tab can be selected
const Tabs = ({ variant = UNDERLINE_VARIANT, tabs = [], activeTab, lockedTab = null, onTabChange }) => {
  if (variant === BUTTON_VARIANT) {
    return (
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            label={tab.label}
            variant={activeTab === tab.value ? "primary" : "secondary"}
            onClick={() => onTabChange?.(tab.value)}
          />
        ))}
      </div>
    );
  }

  if (variant === PILL_VARIANT) {
    return (
      <div className="flex space-x-2 bg-white/80 backdrop-blur-md border rounded-lg w-fit p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange?.(tab.value)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300
              ${activeTab === tab.value
                ? 'bg-primary text-white scale-105'
                : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => (!lockedTab || tab.value === lockedTab ? onTabChange?.(tab.value) : null)}
          className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
            activeTab === tab.value ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
          {tab.badge}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
