const DemoHeading = ({ heading = "", subheading = "" }) => (
  <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
    <div>
      <h1 className="text-xl font-bold text-gray-800">{heading}</h1>
      <p className="text-sm text-gray-500 mt-0.5">{subheading}</p>
    </div>
  </header>
);

export default DemoHeading;
