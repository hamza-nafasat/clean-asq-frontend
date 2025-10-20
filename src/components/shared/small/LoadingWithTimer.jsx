// import { Button } from '@/components/ui/button';
// import { useEffect, useState } from 'react';

// export const LoadingWithTimer = ({ setIsProcessing }) => {
//   const [seconds, setSeconds] = useState(120);

//   useEffect(() => {
//     if (seconds === 1) return setIsProcessing(false);
//     const timer = setTimeout(() => setSeconds(prev => prev - 1), 1000);
//     return () => clearTimeout(timer);
//   }, [seconds, setIsProcessing]);

//   const formatTime = secs => {
//     const mins = Math.floor(secs / 60);
//     const remSecs = secs % 60;
//     return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
//   };

//   return (
//     <div className="flex h-full flex-col items-center justify-center gap-4">
//       <div className="relative flex">
//         <div className="aspect-square h-32 w-32 animate-spin rounded-full bg-gradient-to-bl from-[#aaaaaa] via-[#ffffff] to-[#aaaaaa] p-3 drop-shadow-2xl md:h-48 md:w-48">
//           <div className="background-blur-md h-full w-full rounded-full bg-slate-100 dark:bg-zinc-900">
//             <div className="relative flex h-full items-center justify-center"></div>
//           </div>
//         </div>
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-semibold text-black dark:text-white">
//           {formatTime(seconds)}
//         </div>
//       </div>
//       <Button className="cursor-pointer" onClick={() => setIsProcessing(false)}>
//         Cancel
//       </Button>
//     </div>
//   );
// };
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export const LoadingWithTimer = ({ setIsProcessing }) => {
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    if (seconds === 1) return setIsProcessing(false);
    const timer = setTimeout(() => setSeconds(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, setIsProcessing]);

  const formatTime = secs => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-6">
      <div className="relative flex">
        <div className="aspect-square h-48 w-48 animate-spin rounded-full bg-gradient-to-bl from-[#aaaaaa] via-[#ffffff] to-[#aaaaaa] p-4 drop-shadow-2xl md:h-64 md:w-64">
          <div className="background-blur-md h-full w-full rounded-full bg-slate-100 dark:bg-zinc-900"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-semibold text-black dark:text-white">
          {formatTime(seconds)}
        </div>
      </div>

      <p className="max-w-md text-center text-lg font-medium text-gray-700 dark:text-gray-300">
        We are personalizing the form for you, please wait.
      </p>

      <Button className="cursor-pointer" onClick={() => setIsProcessing(false)}>
        Cancel
      </Button>
    </div>
  );
};
