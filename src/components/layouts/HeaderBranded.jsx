import BrandLogo from "@/components/shared/BrandLogo";
import HeaderUserMenu from "@/components/layouts/HeaderUserMenu";
import { HEADER_ALIGNMENTS } from "@/constants";

const DEFAULT_HEADER_PADDING = 8;
const DEFAULT_HEADER_TEXT_SIZE = 24;

const HeaderBranded = ({
  headerAlignment,
  formHeaderText,
  formHeaderTextSize,
  appHeaderPadding,
  logoProps = {},
  user,
  userMenuProps = {},
}) => {
  const headerTextStyle = { fontSize: `${formHeaderTextSize || DEFAULT_HEADER_TEXT_SIZE}px` };
  const logo = <BrandLogo {...logoProps} />;
  const userMenu = user && <HeaderUserMenu user={user} {...userMenuProps} />;
  const logoBox = <div className="my-4 flex w-75 items-center">{logo}</div>;
  const userMenuBox = <div className="flex w-75 items-center gap-4 px-6 py-2">{userMenu}</div>;
  const headerText = formHeaderText && (
    <h6 className="text-header-text max-w-3xl font-semibold" style={headerTextStyle}>
      {formHeaderText}
    </h6>
  );

  const renderContent = () => {
    if (headerAlignment === HEADER_ALIGNMENTS.CENTER) {
      return (
        <>
          <div className="flex w-75 items-center gap-4 rounded-bl-[20px] px-6 py-2"></div>
          <div className="my-4 flex max-w-3xl flex-col items-center">
            {logo}
            <h6 className="font-semibold text-header-text" style={headerTextStyle}>
              {formHeaderText}
            </h6>
          </div>
          <div className="mx-6 flex w-75 items-center gap-4 p-2">{userMenu}</div>
        </>
      );
    }
    if (headerAlignment === HEADER_ALIGNMENTS.LEFT) {
      return (
        <>
          {logoBox}
          {headerText}
          {userMenuBox}
        </>
      );
    }
    return (
      <>
        {userMenuBox}
        {headerText}
        {logoBox}
      </>
    );
  };

  return (
    <div
      className="bg-header flex min-h-20 items-center justify-between gap-8 rounded-md shadow"
      style={{ padding: `${appHeaderPadding ?? DEFAULT_HEADER_PADDING}px 8px` }}
    >
      {renderContent()}
    </div>
  );
};

export default HeaderBranded;
