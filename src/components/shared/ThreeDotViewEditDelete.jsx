export const ThreeDotEditViewDelete = ({ row, buttons }) => {
  return (
    <div className="fixed z-10 mt-2 min-w-[120px] rounded border bg-white shadow-lg">
      {buttons?.map((button, index) => (
        <button
          key={index}
          className="flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100"
          onClick={() => button.onClick(row)}
        >
          {button.icon}
          {button.name}
        </button>
      ))}
    </div>
  );
};
