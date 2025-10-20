import AllSubmissionDraft from '@/components/admin/AllSubmissionDraft';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { useGetMyAllDraftsAndSubmittionsQuery } from '@/redux/apis/formApis';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function DraftSubmission() {
  // const { user } = useSelector(state => state.auth);
  const { data, isLoading } = useGetMyAllDraftsAndSubmittionsQuery();
  // if (!user?._id) return Navigate(`/application-form/${formId}`);
  if (isLoading) return <CustomLoading />;
  return (
    <div>
      <AllSubmissionDraft forms={data?.data} />
    </div>
  );
}

export default DraftSubmission;
