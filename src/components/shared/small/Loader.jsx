import LoaderIcon from '../../../assets/svgs/pages/LoaderIcon';

const Loader = () => {
  return (
    <div className="h-1[100vh] fixed inset-0 z-10 flex w-[100vw] items-center justify-center bg-[#00000080]">
      <LoaderIcon />
    </div>
  );
};

export default Loader;
