import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "@/lib/socket";
import { useGetIdMissionSessionMutation } from "@/redux/apis/applicant.apis";
import { ID_MISSION_SOCKET_EVENTS } from "@/modules/applicant/utils/applicant.constants";
import {
  buildInitialSectionIdMissionData,
  buildSectionIdMissionData,
} from "@/modules/applicant/utils/applicant.utils6";

// IDMission QR code and webhook data for a section that embeds the ID check
const useApplicantSectionIdMission = (sectionKey) => {
  const { user } = useSelector((state) => state.auth);
  const [qrCode, setQrCode] = useState("");
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState(() =>
    buildInitialSectionIdMissionData(user?.email),
  );
  const [getIdMissionSession, { isLoading: isSessionLoading }] = useGetIdMissionSessionMutation();
  const createdAt = idMissionVerifiedData?.createdAt;

  const getQrAndWebLink = useCallback(async () => {
    try {
      const res = await getIdMissionSession({ sectionKey }).unwrap();
      if (res.success) setQrCode(res.data?.customerData?.qrCode);
    } catch (error) {
      console.error("Get ID Mission session error:", error);
    }
  }, [getIdMissionSession, sectionKey]);

  const loadQrCode = useCallback(() => {
    setIsQrLoading(true);
    getQrAndWebLink().finally(() => setIsQrLoading(false));
  }, [getQrAndWebLink]);

  useEffect(() => {
    const applyResult = (data, shape) => {
      setIsIdMissionProcessing(false);
      setIdMissionVerifiedData(buildSectionIdMissionData(data?.Form_Data, { email: user?.email, createdAt, ...shape }));
    };

    const onProcessingStarted = () => setIsIdMissionProcessing(true);
    const onVerified = (data) => {
      if (data?.sectionKey !== sectionKey) return;
      applyResult(data);
    };
    const onFailed = (data) => {
      if (data?.sectionKey !== sectionKey) return;
      applyResult(data, { nameField: "name", issuerField: "idIssuer", isRawStreet: true });
    };
    const onOther = (data) => {
      if (data?.sectionKey !== sectionKey) return;
      setIsIdMissionProcessing(false);
      if (data?.Metadata?.sectionKey !== sectionKey) return;
      applyResult(data, { isRawStreet: true });
    };

    socket.on(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED, onProcessingStarted);
    socket.on(ID_MISSION_SOCKET_EVENTS.VERIFIED, onVerified);
    socket.on(ID_MISSION_SOCKET_EVENTS.FAILED, onFailed);
    socket.on(ID_MISSION_SOCKET_EVENTS.OTHER, onOther);

    // remove only this hook's listeners
    return () => {
      socket.off(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED, onProcessingStarted);
      socket.off(ID_MISSION_SOCKET_EVENTS.VERIFIED, onVerified);
      socket.off(ID_MISSION_SOCKET_EVENTS.FAILED, onFailed);
      socket.off(ID_MISSION_SOCKET_EVENTS.OTHER, onOther);
    };
  }, [createdAt, sectionKey, user?.email]);

  return {
    idMissionVerifiedData,
    qrCode,
    isQrLoading,
    isSessionLoading,
    isIdMissionProcessing,
    setIsIdMissionProcessing,
    getQrAndWebLink,
    loadQrCode,
  };
};

export default useApplicantSectionIdMission;
