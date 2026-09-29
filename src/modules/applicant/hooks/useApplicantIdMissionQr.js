import { useCallback, useRef, useState } from "react";
import { useGetIdMissionSessionMutation } from "@/redux/apis/applicant.apis";
import usePermission from "@/hooks/usePermission";
import { QR_FETCH_TIMEOUT_MS } from "../utils/applicant.constants";
import { PERMISSIONS } from "@/utils/permissions";

// IDMission QR code and web link for the applicant ID check
const useApplicantIdMissionQr = () => {
  const [webLink, setWebLink] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [qrFetchError, setQrFetchError] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  // one paid session request at a time
  const isFetchingRef = useRef(false);
  const [getIdMissionSession] = useGetIdMissionSessionMutation();
  const canUseIdMission = usePermission(PERMISSIONS.ID_MISSION);

  const getQrAndWebLink = useCallback(async () => {
    if (!canUseIdMission || isFetchingRef.current) return;
    isFetchingRef.current = true;
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
      if (timedOut) return;
      if (!res.success) return setQrFetchError(true);
      setQrCode(res.data?.customerData?.qrCode);
      setWebLink(res.data?.customerData?.kycUrl);
    } catch (error) {
      if (timedOut) return;
      console.error("Get ID Mission session error:", error);
      setQrFetchError(true);
    } finally {
      clearTimeout(timeoutId);
      isFetchingRef.current = false;
      setQrLoading(false);
    }
  }, [canUseIdMission, getIdMissionSession]);

  return { webLink, qrCode, qrFetchError, qrLoading, getQrAndWebLink };
};

export default useApplicantIdMissionQr;
