import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { LoadingWithTimer } from '@/components/shared/small/LoadingWithTimer';
import TextField from '@/components/shared/small/TextField';
import { socket } from '@/main';
import { useGetMyProfileFirstTimeMutation, useUpdateMyProfileMutation } from '@/redux/apis/authApis';
import { useGetBeneficialOwnersDataQuery, useUpdateBeneficialOwnersMutation } from '@/redux/apis/formApis';
import { useGetIdMissionSessionMutation } from '@/redux/apis/idMissionApis';
import { userExist, userNotExist } from '@/redux/slices/authSlice';
import React, { useCallback, useEffect, useState } from 'react';
import { MdVerifiedUser } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AdditionalOwnersForm = () => {
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get('userId');
  const submitId = queryParams.get('submitId');
  const email = queryParams.get('email');
  const [form, setForm] = useState({
    name: '',
    email: '',
    ssn: '',
    percentage: '',
  });
  const [qrCode, setQrCode] = useState('');
  const [webLink, setWebLink] = useState('');
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerified, setIdMissionVerified] = useState(false);

  const { data, isLoading } = useGetBeneficialOwnersDataQuery({ userId, submitId, email });
  const { user } = useSelector(state => state.auth);
  const [getIdMissionSession, { isLoading: getQrAndWebLinkLoading }] = useGetIdMissionSessionMutation();
  const [updateBeneficialOwners, { isLoading: updateLoading }] = useUpdateBeneficialOwnersMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();

  console.log('data', data);

  const updateBeneficialOwnersHandler = async e => {
    e.preventDefault();

    try {
      const res = await updateBeneficialOwners({ userId, submitId, form }).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || 'Failed to update beneficial owners');
    }
  };

  const getQrAndWebLink = useCallback(async () => {
    try {
      const res = await getIdMissionSession().unwrap();
      console.log('session id is ', res);
      if (res.success) {
        setQrCode(res.data?.customerData?.qrCode);
        setWebLink(res.data?.customerData?.kycUrl);
      }
    } catch (error) {
      console.log('Error fetching session ID:', error);
    }
  }, [getIdMissionSession]);

  useEffect(() => {
    if (data?.data) {
      setForm({
        name: data?.data?.name,
        email: data?.data?.email,
        ssn: data?.data?.ssn,
        percentage: data?.data?.percentage,
        idMissionData: '',
        isVerified: '',
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
      .then(res => {
        if (res?.data?.success) dispatch(userExist(res.data.data));
        else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()));
  }, [getUserProfile, dispatch]);

  // check and get socket events
  useEffect(() => {
    // Setup listener ONCE when component mounts
    socket.on('idMission_processing_started', data => {
      console.log('you start id mission verification', data);
      setIsIdMissionProcessing(true);
    });
    socket.on('idMission_verified', async data => {
      if (user?._id && data?.Form_Data?.FullName) {
        const res = await updateMyProfile({
          _id: user?._id,
          firstName: data?.Form_Data?.FullName?.split(' ')[0],
          lastName: data?.Form_Data?.FullName?.split(' ')[1],
        }).unwrap();
        if (!res.success) return toast.error(res.message);
        else {
          await getUserProfile()
            .then(res => {
              if (res?.data?.success) dispatch(userExist(res.data.data));
            })
            .catch(() => dispatch(userNotExist()));
        }
      }

      console.log('You are verified successfully', data);
      setIsIdMissionProcessing(false);
      setIdMissionVerified(true);
      setForm(prev => ({
        ...prev,
        isVerified: true,
        idMissionData: data,
      }));
      setQrCode('');
      setWebLink('');
    });
    socket.on('idMission_failed', async data => {
      console.log('you start id mission failed', data);
      setForm(prev => ({
        ...prev,
        isVerified: false,
        idMissionData: data,
      }));
      setQrCode('');
      setWebLink('');
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off('idMission_processing_started');
      socket.off('idMission_verified');
      socket.off('idMission_failed');
    };
  }, [dispatch, form, getUserProfile, updateMyProfile, user?._id]);

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
              <img className="h-[230px] w-[230px]" src={`data:image/jpeg;base64,${qrCode}`} alt="qr code " />
            </div>
            {/* <div className="mt-4 flex w-full flex-col items-center gap-4">
              <Button
                className="max-w-[400px]"
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
              label={'Name'}
              placeholder="Enter your Name"
              value={form?.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="max-w-[500px]"
            />
            <TextField
              type="email"
              label={'Email'}
              placeholder="Enter your email"
              value={form?.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="max-w-[500px]"
            />
            <TextField
              label={'SSN'}
              type="text"
              placeholder="Enter your ssn"
              value={form?.ssn}
              onChange={e => setForm({ ...form, ssn: e.target.value })}
              className="max-w-[500px]"
            />
            <TextField
              label={'Percentage'}
              type="number"
              placeholder="Enter your percentage"
              value={form?.percentage}
              onChange={e => setForm({ ...form, percentage: e.target.value })}
              className="max-w-[500px]"
            />
            <Button
              disabled={updateLoading}
              onClick={updateBeneficialOwnersHandler}
              className={`min-w-[130px] py-[8px] ${updateLoading ? 'cursor-not-allowed opacity-30' : ''}`}
              label={'Submit'}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default AdditionalOwnersForm;
