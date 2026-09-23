import { cn } from "@/lib/utils";

const DEFAULT_LOGO_MAX_WIDTH = 300;
const DEFAULT_LOGO_MAX_HEIGHT = 100;

const HeaderBrandLogo = ({ logo, maxWidth, maxHeight, onClick }) => {
  if (!logo) return null;

  return (
    <img
      onClick={onClick}
      src={logo || ""}
      alt="Logo"
      className={cn("w-auto object-contain", onClick && "cursor-pointer")}
      style={{
        maxWidth: `${maxWidth ?? DEFAULT_LOGO_MAX_WIDTH}px`,
        maxHeight: `${maxHeight ?? DEFAULT_LOGO_MAX_HEIGHT}px`,
      }}
      referrerPolicy="no-referrer"
    />
  );
};

export default HeaderBrandLogo;
