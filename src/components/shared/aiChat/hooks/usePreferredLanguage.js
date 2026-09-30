import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useUpdateMyProfileMutation } from "@/redux/apis/auth.apis";
import { userExist } from "@/redux/slices/auth.slice";
import { DEFAULT_LANGUAGE_CODE } from "@/lib/languages.js";

// chat language, saved to the signed-in account
const usePreferredLanguage = (user) => {
  const dispatch = useDispatch();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  // english until another is chosen
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || DEFAULT_LANGUAGE_CODE);

  // adopt the account's saved language
  useEffect(() => {
    if (user?.preferredLanguage) setPreferredLanguage(user.preferredLanguage);
  }, [user?.preferredLanguage]);

  const handleSelectPreferredLanguage = (code) => {
    setPreferredLanguage(code);
    if (user?._id) {
      updateMyProfile({ preferredLanguage: code })
        .unwrap()
        .then(() => dispatch(userExist({ ...user, preferredLanguage: code })))
        .catch((error) => console.error("Save preferred language error:", error));
    }
  };

  return { preferredLanguage, handleSelectPreferredLanguage };
};

export default usePreferredLanguage;
