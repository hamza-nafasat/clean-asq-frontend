const FieldSuggestionList = ({ suggestions = [], activeIndex = -1, onPick }) => (
  <div className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
    {suggestions.map((suggestion, index) => (
      <div
        key={index}
        className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${activeIndex === index ? "bg-gray-100 font-medium" : ""}`}
        onMouseDown={() => onPick?.(suggestion)}
      >
        {suggestion}
      </div>
    ))}
  </div>
);

export default FieldSuggestionList;
