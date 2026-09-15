import { useMemo } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { DEFAULT_BRANDING_THEME, setBrandingValue } from "@/redux/slices/branding.slice";

const BRANDING_KEYS = Object.keys(DEFAULT_BRANDING_THEME);

const toSetterName = (key) => `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;

const useBranding = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const theme = useSelector((state) => state.branding.theme);

  // one stable setter per key: setPrimaryColor, setLogo, …
  const setters = useMemo(
    () =>
      Object.fromEntries(
        BRANDING_KEYS.map((key) => [
          toSetterName(key),
          (value) => {
            const current = store.getState().branding.theme[key];
            dispatch(setBrandingValue({ key, value: typeof value === "function" ? value(current) : value }));
          },
        ]),
      ),
    [dispatch, store],
  );

  return { ...theme, ...setters };
};

export default useBranding;
