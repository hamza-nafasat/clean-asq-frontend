import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import { LoadingWithTimer } from "./components/ApplicantLoadingWithTimer";
import TextField from "@/components/shared/TextField";
import { socket } from "@/lib/socket";
import { useGetMyProfileFirstTimeMutation, useUpdateMyProfileMutation } from "@/redux/apis/auth.apis";
import { useGetBeneficialOwnersDataQuery, useUpdateBeneficialOwnersMutation } from "@/redux/apis/form.apis";
import { useGetIdMissionSessionMutation } from "@/redux/apis/applicant.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import { ID_MISSION_SOCKET_EVENTS } from "@/modules/applicant/utils/applicant.constants";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdVerifiedUser } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdditionalOwnersForm = () => {
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get("userId");
  const submitId = queryParams.get("submitId");
  const email = queryParams.get("email");
  const [form, setForm] = useState({
    name: "",
    email: "",
    ssn: "",
    percentage: "",
  });
  const [qrCode, setQrCode] = useState("");
  const [webLink, setWebLink] = useState("");
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerified, setIdMissionVerified] = useState(false);

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetBeneficialOwnersDataQuery({ userId, submitId, email }, { skip: !user });
  const [getIdMissionSession, { isLoading: getQrAndWebLinkLoading }] = useGetIdMissionSessionMutation();
  const [updateBeneficialOwners, { isLoading: updateLoading }] = useUpdateBeneficialOwnersMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const userRef = useRef(user);
  userRef.current = user;
  const getUserProfileRef = useRef(getUserProfile);
  getUserProfileRef.current = getUserProfile;
  const updateMyProfileRef = useRef(updateMyProfile);
  updateMyProfileRef.current = updateMyProfile;

  const updateBeneficialOwnersHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await updateBeneficialOwners({ userId, submitId, form }).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || "Failed to update beneficial owners");
    }
  };

  const getQrAndWebLink = useCallback(async () => {
    try {
      const res = await getIdMissionSession().unwrap();
      console.log("session id is ", res);
      if (res.success) {
        setQrCode(res.data?.customerData?.qrCode);
        setWebLink(res.data?.customerData?.kycUrl);
      }
    } catch (error) {
      console.log("Error fetching session ID:", error);
    }
  }, [getIdMissionSession]);

  useEffect(() => {
    if (data?.data) {
      setForm({
        name: data?.data?.name,
        email: data?.data?.email,
        ssn: data?.data?.ssn,
        percentage: data?.data?.percentage,
        idMissionData: "",
        isVerified: "",
      });
    }
  }, [data]);

  // get qr and session id
  useEffect(() => {
    if (!qrCode || !webLink) {
      getQrAndWebLink();
    }
  }, [getQrAndWebLink, qrCode, webLink]);

  // get user when he logged in
  useEffect(() => {
    getUserProfile()
      .then((res) => {
        if (res?.data?.success) dispatch(userExist(res.data.data));
        else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()));
  }, [getUserProfile, dispatch]);

  // registers once - uses refs
  useEffect(() => {
    const handleProcessingStarted = () => setIsIdMissionProcessing(true);

    const handleVerified = async (data) => {
      const currentUser = userRef.current;
      if (currentUser?._id && data?.Form_Data?.FullName) {
        try {
          const res = await updateMyProfileRef.current({
            _id: currentUser._id,
            firstName: data?.Form_Data?.FullName?.split(" ")[0],
            lastName: data?.Form_Data?.FullName?.split(" ")[1],
          }).unwrap();
          if (!res.success) toast.error(res.message);
          else {
            const profile = await getUserProfileRef.current();
            if (profile?.data?.success) dispatch(userExist(profile.data.data));
            else dispatch(userNotExist());
          }
        } catch (error) {
          console.error("Sync profile error:", error);
        }
      }

      setIsIdMissionProcessing(false);
      setIdMissionVerified(true);
      setForm((prev) => ({ ...prev, isVerified: true, idMissionData: data }));
      setQrCode("");
      setWebLink("");
    };

    const handleFailed = (data) => {
      setForm((prev) => ({ ...prev, isVerified: false, idMissionData: data }));
      setQrCode("");
      setWebLink("");
    };

    socket.on(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED, handleProcessingStarted);
    socket.on(ID_MISSION_SOCKET_EVENTS.VERIFIED, handleVerified);
    socket.on(ID_MISSION_SOCKET_EVENTS.FAILED, handleFailed);

    // remove only this component's listeners
    return () => {
      socket.off(ID_MISSION_SOCKET_EVENTS.PROCESSING_STARTED, handleProcessingStarted);
      socket.off(ID_MISSION_SOCKET_EVENTS.VERIFIED, handleVerified);
      socket.off(ID_MISSION_SOCKET_EVENTS.FAILED, handleFailed);
    };
  }, [dispatch]);

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <p className="text-textPrimary text-[18px] font-semibold">Please log in to open your owner details.</p>
        <Button label="Log in" onClick={() => navigate("/login")} />
      </div>
    );
  }

  return isLoading || getQrAndWebLinkLoading ? (
    <CustomLoading />
  ) : (
    <div className="flex flex-col p-4">
      <h1 className="text-textPrimary text-start text-2xl font-semibold">Additional Owners Form</h1>
      <p className="text-textPrimary mt-10 text-[18px] font-semibold">
        Please submit this form with the required information.
      </p>

      {qrCode && webLink && !idMissionVerified ? (
        isIdMissionProcessing ? (
          <LoadingWithTimer setIsProcessing={setIsIdMissionProcessing} />
        ) : (
          <>
            <div className="mt-4 flex w-full flex-col items-center gap-4">
              <img className="h-57.5 w-57.5" src={`data:image/jpeg;base64,${qrCode}`} alt="qr code " />
            </div>
            {/* <div className="mt-4 flex w-full flex-col items-center gap-4">
              <Button
                className="max-w-100"
                label={'Open LInk in New Tab'}
                onClick={() => {
                  window.open(webLink, '_blank');
                }}
                rightIcon={MdVerifiedUser}
              />
            </div> */}
          </>
        )
      ) : (
        <div className="flex flex-col items-center gap-3">
          <form className="flex w-full flex-col items-center justify-center gap-4">
            <TextField
              type="text"
              label={"Name"}
              placeholder="Enter your Name"
              value={form?.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="max-w-125"
            />
            <TextField
              type="email"
              label={"Email"}
              placeholder="Enter your email"
              value={form?.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="max-w-125"
            />
            <TextField
              label={"SSN"}
              type="text"
              placeholder="Enter your ssn"
              formatting="3,2,4"
              value={form?.ssn}
              onChange={(e) => setForm({ ...form, ssn: e.target.value })}
              className="max-w-125"
            />
            <TextField
              label={"Percentage"}
              type="number"
              placeholder="Enter your percentage"
              value={form?.percentage}
              onChange={(e) => setForm({ ...form, percentage: e.target.value })}
              className="max-w-125"
            />
            <Button
              disabled={updateLoading}
              onClick={updateBeneficialOwnersHandler}
              className={`min-w-32.5 py-2 ${updateLoading ? "cursor-not-allowed opacity-30" : ""}`}
              label={"Submit"}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default AdditionalOwnersForm;
