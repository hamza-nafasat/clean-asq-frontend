import { ApplicationPdfViewCommonProps } from '@/page/admin/userApplicationForms/ApplicationVerification/ApplicationPdfView';
import React from 'react'

const AppViewer = ({ data }) => {
  const userId = data?.user?._id;
  const pdfId = data?.form?._id;

  return (
    <div className="flex w-full">
      <ApplicationPdfViewCommonProps userId={userId} pdfId={pdfId} className="rounded-lg!" isEditAble={true} />
    </div>
  )
}

export { AppViewer };