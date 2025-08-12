export const ThreeDotEditViewDelete = ({ row, buttons }) => {
  return (
    <div className="fixed z-10 mt-2 min-w-[120px] rounded border bg-white shadow-lg">
      {buttons?.map((button, index) => (
        <button
          key={index}
          className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 ${button?.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={() => button.onClick(row)}
          disabled={button?.disabled || false}
        >
          {button.icon}
          {button.name}
        </button>
      ))}
    </div>
  );
};
