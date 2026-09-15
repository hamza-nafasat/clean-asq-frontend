import { useMemo } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { DEFAULT_BRANDING_THEME, setBrandingValue } from "@/redux/slices/branding.slice";

const BRANDING_KEYS = Object.keys(DEFAULT_BRANDING_THEME);

const useBranding = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const theme = useSelector((state) => state.branding.theme);

  // one stable setter per key: setPrimaryColor, setLogo, …
  const setters = useMemo(() => {
    // TODO(human): build { setName, setPrimaryColor, … } from BRANDING_KEYS
    return {};
  }, [dispatch, store]);

  return { ...theme, ...setters };
};

export default useBranding;
