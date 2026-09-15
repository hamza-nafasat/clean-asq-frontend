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

    socket.on(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED, () => setIsIdMissionProcessing(true));
    socket.on(ID_MISSION_SOCKET_EVENTS.VERIFIED, async (data) => {
      if (data?.sectionKey !== sectionKey) return;
      applyResult(data);
    });
    socket.on(ID_MISSION_SOCKET_EVENTS.FAILED, async (data) => {
      if (data?.sectionKey !== sectionKey) return;
      applyResult(data, { nameField: "name", issuerField: "idIssuer", isRawStreet: true });
    });
    socket.on(ID_MISSION_SOCKET_EVENTS.OTHER, async (data) => {
      if (data?.sectionKey !== sectionKey) return;
      setIsIdMissionProcessing(false);
      if (data?.Metadata?.sectionKey !== sectionKey) return;
      applyResult(data, { isRawStreet: true });
    });

    return () => {
      socket.off(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED);
      socket.off(ID_MISSION_SOCKET_EVENTS.VERIFIED);
      socket.off(ID_MISSION_SOCKET_EVENTS.FAILED);
      socket.off(ID_MISSION_SOCKET_EVENTS.OTHER);
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
