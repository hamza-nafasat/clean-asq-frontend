import { useSelector } from "react-redux";
import MyProfileDetailsForm from "./components/MyProfileDetailsForm";
import MyProfilePasswordForm from "./components/MyProfilePasswordForm";

const MyProfile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <article className="mt-5 w-full">
      <MyProfileDetailsForm key={user?._id} user={user} />
      <MyProfilePasswordForm />
    </article>
  );
};

export default MyProfile;
