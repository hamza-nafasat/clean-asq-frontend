import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearSavedFormData } from "@/redux/slices/form.slice";
import { FiMoreVertical } from "react-icons/fi";
import { cn } from "@/lib/utils";
import usePermission from "@/hooks/usePermission";
import Button from "@/components/shared/Button";
import { LAYOUT_ROUTES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { CREATED_DATE_OPTIONS, DATE_LOCALE } from "../utils/applicationForms.constants";
import { getFormButtonStyle } from "../utils/applicationForms.branding.utils";

const MENU_ITEM_CLASSES = "block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer";

const ApplicationFormsCard = ({
  form = {},
  logo = "",
  isMenuOpen = false,
  onToggleMenu,
  onCloseMenu,
  onUpdateForm,
  onSetBranding,
  onSetLocation,
  onDelete,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const canUpdateForm = usePermission(PERMISSIONS.UPDATE_FORM);
  const canUpdateBranding = usePermission(PERMISSIONS.UPDATE_BRANDING);
  const canReadBranding = usePermission(PERMISSIONS.READ_BRANDING);
  const canSetBranding = canUpdateBranding && canReadBranding;
  const canReadRule = usePermission(PERMISSIONS.READ_RULE);
  const canDeleteForm = usePermission(PERMISSIONS.DELETE_FORM);
  const hasMenu = canUpdateForm || canSetBranding || canReadRule || canDeleteForm;

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target) && !menuButtonRef.current?.contains(event.target)) {
        onCloseMenu?.();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseMenu?.();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, onCloseMenu]);

  const handleStartApplication = () => {
    dispatch(clearSavedFormData());
    navigate(`${LAYOUT_ROUTES.APPLICATION_FORM}/${form?.branding?.name}/${form?._id}`);
  };

  return (
    <article className="relative flex min-w-0 flex-col rounded-xl border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6">
      <header className="flex justify-between">
        <div
          className="flex h-25 max-h-25 w-62.5 max-w-62.5 items-center justify-center rounded-lg bg-gray-100 px-3"
          style={{ background: form?.branding?.colors?.headerBackground }}
        >
          <img
            src={form?.branding?.selectedLogo || logo}
            alt={form?.name ? `${form.name} logo` : ""}
            className="h-full max-w-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        {hasMenu && (
          <div className="relative">
            <button
              type="button"
              ref={menuButtonRef}
              onClick={() => onToggleMenu?.(form?._id)}
              className="cursor-pointer rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <FiMoreVertical size={18} />
            </button>
            {isMenuOpen && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-50 rounded border bg-white shadow-lg">
                {canUpdateForm && (
                  <button type="button" className={MENU_ITEM_CLASSES} onClick={() => onUpdateForm?.(form)}>
                    Update Form
                  </button>
                )}
                {canSetBranding && (
                  <button type="button" className={MENU_ITEM_CLASSES} onClick={() => onSetBranding?.(form)}>
                    Set Branding
                  </button>
                )}
                {canUpdateForm && (
                  <button type="button" className={MENU_ITEM_CLASSES} onClick={() => onSetLocation?.(form)}>
                    Set Location
                  </button>
                )}
                {canReadRule && (
                  <button
                    type="button"
                    className={MENU_ITEM_CLASSES}
                    onClick={() => navigate(`${LAYOUT_ROUTES.MANAGE_RULES}/${form?._id}`)}
                  >
                    Manage Rules
                  </button>
                )}
                {canDeleteForm && (
                  <button
                    type="button"
                    className={cn(MENU_ITEM_CLASSES, "text-red-500")}
                    onClick={() => onDelete?.(form?._id)}
                  >
                    Delete Form
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="mt-4 flex min-w-0 flex-col items-start justify-between gap-2">
        <h2 className="text-base leading-tight font-bold wrap-break-word text-gray-700 sm:text-lg md:text-2xl">
          {form?.name}
        </h2>
        <p className="text-sm leading-tight font-bold wrap-break-word text-gray-400">{form?.headerText}</p>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Created: {new Date(form?.createdAt).toLocaleDateString(DATE_LOCALE, CREATED_DATE_OPTIONS)}
      </p>
      <footer className="mt-3 flex h-full w-full flex-col items-start justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
        <Button
          label="Start Application"
          onClick={handleStartApplication}
          className="self-end hover:opacity-60"
          style={getFormButtonStyle(form?.branding)}
        />
      </footer>
    </article>
  );
};

export default ApplicationFormsCard;
