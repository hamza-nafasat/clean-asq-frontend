import { useSelector } from "react-redux";
import MyProfileDetailsForm from "./components/MyProfileDetailsForm";
import MyProfilePasswordForm from "./components/MyProfilePasswordForm";

const MyProfile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-8">
      <MyProfileDetailsForm key={user?._id} user={user} />
      <MyProfilePasswordForm />
    </article>
  );
};

export default MyProfile;
