import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { socket } from "@/lib/socket";
import { useGetMyProfileFirstTimeMutation, useUpdateMyProfileMutation } from "@/redux/apis/auth.apis";
import { userExist } from "@/redux/slices/auth.slice";
import { updateFormState } from "@/redux/slices/form.slice";
import {
  ID_MISSION_SOCKET_EVENTS,
  ID_MISSION_VERIFICATION_RESULTS,
  SECTION_KEYS,
} from "@/modules/applicant/utils/applicant.constants";
import {
  hasUsableIdMissionData,
  mapWebhookToIdMissionData,
  splitIdMissionName,
} from "@/modules/applicant/utils/applicant.utils5";

// IDMission webhook events for the ID Mission step, attached once on mount
const useApplicantIdMissionSocket = ({
  idMissionScanAppliedRef,
  idMissionManualEntryRef,
  setIdMissionVerifiedData,
  setIdMissionVerified,
  setIdMissionDetailsReady,
  setIsIdMissionProcessing,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const userRef = useRef(user);
  const dispatchRef = useRef(dispatch);
  const getUserProfileRef = useRef(getUserProfile);
  const updateMyProfileRef = useRef(updateMyProfile);
  userRef.current = user;
  dispatchRef.current = dispatch;
  getUserProfileRef.current = getUserProfile;
  updateMyProfileRef.current = updateMyProfile;

  useEffect(() => {
    const mapPayload = (data) =>
      mapWebhookToIdMissionData(data?.Form_Data, { emailFallback: userRef.current?.email || "" });

    // reveal details only when the payload has identity fields
    const revealDetailsWithData = (mapped) => {
      if (!hasUsableIdMissionData(mapped)) return false;
      idMissionScanAppliedRef.current = true;
      idMissionManualEntryRef.current = false;
      // data, flags and loading exit in one paint
      flushSync(() => {
        setIdMissionVerifiedData((prev) => ({
          ...prev,
          ...mapped,
          email: {
            name: "email",
            value: mapped?.email?.value || prev?.email?.value || userRef.current?.email || "",
          },
          signature: mapped?.signature ?? prev?.signature,
          roleFillingForCompany: mapped?.roleFillingForCompany ?? prev?.roleFillingForCompany,
          address2: mapped?.address2 ?? prev?.address2,
        }));
        setIdMissionVerified(true);
        setIdMissionDetailsReady(true);
        setIsIdMissionProcessing(false);
      });
      return true;
    };

    const syncFailedState = async (data) => {
      try {
        unwrapResult(await dispatchRef.current(updateFormState({ data, name: SECTION_KEYS.ID_MISSION })));
      } catch (error) {
        console.error("Sync ID Mission state error:", error);
      }
    };

    const buildFailedResult = (data) => ({
      idMissionVerification: ID_MISSION_VERIFICATION_RESULTS.FAILED,
      verificationStatus: data?.Form_Status || ID_MISSION_VERIFICATION_RESULTS.REJECTED,
      idMissionData: data,
    });

    const handleProcessingStarted = () => setIsIdMissionProcessing(true);

    const handleVerified = async (data) => {
      const f = data?.Form_Data;
      if (!revealDetailsWithData(mapPayload(data))) {
        // keep loading until a payload with fields arrives
        setIsIdMissionProcessing(true);
        return;
      }
      const currentUser = userRef.current;
      if (!currentUser?._id || !f?.FullName) return;
      try {
        const res = await updateMyProfileRef.current({ _id: currentUser._id, ...splitIdMissionName(f) }).unwrap();
        if (res?.success) {
          const profile = await getUserProfileRef.current();
          if (profile?.data?.success) dispatchRef.current(userExist(profile.data.data));
        }
      } catch (error) {
        console.error("Sync profile error:", error);
      }
    };

    const handleFailed = async (data) => {
      revealDetailsWithData(mapPayload(data));
      await syncFailedState(buildFailedResult(data));
    };

    const handleOther = async (data) => {
      if (!revealDetailsWithData(mapPayload(data))) return;
      await syncFailedState({ value: buildFailedResult(data) });
    };

    socket.on(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED, handleProcessingStarted);
    socket.on(ID_MISSION_SOCKET_EVENTS.VERIFIED, handleVerified);
    socket.on(ID_MISSION_SOCKET_EVENTS.FAILED, handleFailed);
    socket.on(ID_MISSION_SOCKET_EVENTS.OTHER, handleOther);

    return () => {
      socket.off(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED, handleProcessingStarted);
      socket.off(ID_MISSION_SOCKET_EVENTS.VERIFIED, handleVerified);
      socket.off(ID_MISSION_SOCKET_EVENTS.FAILED, handleFailed);
      socket.off(ID_MISSION_SOCKET_EVENTS.OTHER, handleOther);
    };
  }, [
    idMissionManualEntryRef,
    idMissionScanAppliedRef,
    setIdMissionDetailsReady,
    setIdMissionVerified,
    setIdMissionVerifiedData,
    setIsIdMissionProcessing,
  ]);
};

export default useApplicantIdMissionSocket;
