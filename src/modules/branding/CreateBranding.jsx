import { useParams } from "react-router-dom";
import BrandingEditor from "./components/BrandingEditor";

const CreateBranding = () => {
  const { brandingId } = useParams();
  return <BrandingEditor brandingId={brandingId} />;
};

export default CreateBranding;
