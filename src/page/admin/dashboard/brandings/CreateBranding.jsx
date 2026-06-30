import { useParams } from 'react-router-dom';
import GlobalBrandingPage from '../../../../components/admin/brandings/globalBranding/GlobalBrandingPage';

const CreateBranding = () => {
  const brandingId = useParams()?.brandingId;
  return <div>{brandingId ? <GlobalBrandingPage brandingId={brandingId} /> : <GlobalBrandingPage />}</div>;
};

export default CreateBranding;
