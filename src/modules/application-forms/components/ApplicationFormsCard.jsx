import { MoreVertical } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearSavedFormData } from "@/redux/slices/form.slice";
import Button from "@/components/shared/Button";
import { LAYOUT_ROUTES } from "@/constants";
import {
  APPLICATION_FORMS_ROUTES,
  CREATED_DATE_OPTIONS,
  DATE_LOCALE,
  DEFAULT_HEADER_BACKGROUND,
} from "../utils/application-forms.constants";
import { getFormButtonStyle } from "../utils/application-forms.utils2";

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

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target) && !menuButtonRef.current?.contains(event.target)) {
        onCloseMenu?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, onCloseMenu]);

  const handleStartApplication = () => {
    dispatch(clearSavedFormData());
    navigate(`${LAYOUT_ROUTES.APPLICATION_FORM}/${form?.branding?.name}/${form?._id}`);
  };

  return (
    <article className="relative flex min-w-0 flex-col rounded-xl border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6">
      <header className="flex justify-between">
        <div
          className="flex h-25 max-h-25 w-62.5 max-w-62.5 items-center justify-center rounded-lg px-3"
          style={{
            background: form?.branding?.colors?.headerBackground || DEFAULT_HEADER_BACKGROUND,
          }}
        >
          <img
            src={form?.branding?.selectedLogo || logo}
            alt="logo"
            className="h-full max-w-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative">
          <button
            type="button"
            ref={menuButtonRef}
            onClick={() => onToggleMenu?.(form?._id)}
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            aria-label="Actions"
          >
            <MoreVertical size={18} />
          </button>
          {isMenuOpen && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-50 rounded border bg-white shadow-lg">
              <button type="button" className={MENU_ITEM_CLASSES} onClick={() => onUpdateForm?.(form)}>
                Update Form
              </button>
              <button type="button" className={MENU_ITEM_CLASSES} onClick={() => onSetBranding?.(form)}>
                Set Branding
              </button>
              <button type="button" className={MENU_ITEM_CLASSES} onClick={() => onSetLocation?.(form)}>
                Set Location
              </button>
              <button
                type="button"
                className={MENU_ITEM_CLASSES}
                onClick={() => navigate(`${APPLICATION_FORMS_ROUTES.MANAGE_RULES}/${form?._id}`)}
              >
                Manage Rules
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 cursor-pointer"
                onClick={() => onDelete?.(form?._id)}
              >
                Delete Form
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex items-start gap-2 md:gap-4">
        <div className="mt-4 min-w-0 flex-1">
          <div className="flex flex-col item-start justify-between gap-2">
            <h2 className="text-base leading-tight font-bold wrap-break-word text-gray-700 sm:text-lg md:text-2xl">
              {form?.name}
            </h2>
            <p className="text-sm leading-tight font-bold wrap-break-word text-gray-400">{form?.headerText}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-gray-500">
          Created: {new Date(form?.createdAt).toLocaleDateString(DATE_LOCALE, CREATED_DATE_OPTIONS)}
        </span>
      </div>
      <footer className="mt-3 flex h-full w-full flex-col items-start justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
        <Button
          label="Start Application"
          onClick={handleStartApplication}
          className="self-end"
          style={getFormButtonStyle(form?.branding)}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        />
      </footer>
    </article>
  );
};

export default ApplicationFormsCard;
