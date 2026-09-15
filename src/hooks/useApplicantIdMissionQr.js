import { useCallback, useState } from "react";
import { useGetIdMissionSessionMutation } from "@/redux/apis/applicant.apis";
import { QR_FETCH_TIMEOUT_MS } from "@/modules/applicant/utils/applicant.constants";

// IDMission QR code and web link for the applicant ID check
const useApplicantIdMissionQr = () => {
  const [webLink, setWebLink] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [qrFetchError, setQrFetchError] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [getIdMissionSession] = useGetIdMissionSessionMutation();

  const getQrAndWebLink = useCallback(async () => {
    setQrLoading(true);
    setQrFetchError(false);
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      setQrLoading(false);
      setQrFetchError(true);
    }, QR_FETCH_TIMEOUT_MS);
    try {
      const res = await getIdMissionSession().unwrap();
      clearTimeout(timeoutId);
      if (!timedOut) {
        if (res.success) {
          setQrCode(res.data?.customerData?.qrCode);
          setWebLink(res.data?.customerData?.kycUrl);
        } else {
          setQrFetchError(true);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (!timedOut) {
        console.error("Get ID Mission session error:", error);
        setQrFetchError(true);
      }
    } finally {
      setQrLoading(false);
    }
  }, [getIdMissionSession]);

  return { webLink, qrCode, qrFetchError, qrLoading, setQrLoading, setQrFetchError, getQrAndWebLink };
};

export default useApplicantIdMissionQr;
