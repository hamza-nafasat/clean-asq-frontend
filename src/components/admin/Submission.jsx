import { submissionData } from '@/data/data';
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import Button from '../shared/small/Button';
import { useBranding } from '@/hooks/BrandingContext';

function Submission() {
  const { logo } = useBranding();

  return (
    <div className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {submissionData?.map((form, index) => {
        const colors = form?.branding?.colors;

        return (
          <div
            key={index}
            className="relative flex min-w-0 flex-col rounded-[8px] border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6"
          >
            <img
              src={form?.branding?.selectedLogo || logo}
              width={50}
              height={50}
              alt="logo"
              referrerPolicy="no-referrer"
            />

            {/* Menu icon */}
            <div className="absolute top-3 right-3 cursor-pointer sm:top-4 sm:right-4">{/* <CiMenuKebab /> */}</div>
            <div className="flex items-start gap-2 md:gap-4">
              {/* <CardIcon /> */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base leading-tight font-bold break-words text-gray-700 sm:text-lg md:text-2xl">
                    {form?.name}
                  </h2>
                </div>
                <div className="mt-1 truncate text-xs text-gray-500 sm:text-sm">Created from CSV import</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-700 md:mt-3 md:text-base">
              <div className="flex items-center gap-1 md:gap-2">
                <FaCheck className="text-primary" />
                <span>{form?.sections?.length} form sections</span>
              </div>{' '}
              <div className="flex items-center gap-1 md:gap-2">
                <FaCheck className="text-primary" />
                <span>AI-assisted completion available</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-gray-500">Applicants: {form?.sections?.length}</span>
              <span className="text-gray-500">
                Created:{' '}
                {new Date(form?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="mt-3 flex w-full flex-col items-start justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
              <Button
                label="Start Application"
                onClick={() => navigate(`/application-form/${form?._id}`)}
                style={{
                  backgroundColor: colors?.primary,
                  borderColor: colors?.primary,
                  color: colors?.buttonTextPrimary,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '0.6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Submission;
