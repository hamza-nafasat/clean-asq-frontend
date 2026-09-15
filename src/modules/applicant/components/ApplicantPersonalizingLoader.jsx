const ApplicantPersonalizingLoader = () => (
  <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
    <div className="spinner"></div>
    <p className="animate-fade-in-out text-center text-lg font-medium text-gray-700 dark:text-gray-300">
      We are personalizing the form for you, please wait...
    </p>
  </div>
);

export default ApplicantPersonalizingLoader;
