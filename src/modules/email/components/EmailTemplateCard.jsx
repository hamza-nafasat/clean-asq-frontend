import { FiMoreVertical } from "react-icons/fi";
import Button from "@/components/shared/Button";

const EmailTemplateCard = ({
  item = {},
  isMenuOpen = false,
  menuRef,
  onToggleMenu,
  onEdit,
  onAttach,
  onDelete,
  onView,
}) => {
  const attachedFormNames = (item.forms || []).map((form) => form?.name).filter(Boolean);

  return (
    <article
      data-testid="email-card"
      className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      {(onEdit || onAttach || onDelete) && (
        <div ref={menuRef} className="absolute top-4 right-4">
          <button
            type="button"
            data-testid="email-card-menu-btn"
            aria-label={`Actions for ${item.templateName}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => onToggleMenu?.(item)}
          >
            <FiMoreVertical size={18} />
          </button>
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute top-6 right-0 z-50 w-32 rounded-md border border-gray-200 bg-white shadow-lg"
            >
              {onEdit && (
                <button
                  type="button"
                  role="menuitem"
                  data-testid="email-edit-btn"
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
              )}
              {onAttach && (
                <button
                  type="button"
                  role="menuitem"
                  data-testid="email-attach-btn"
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={() => onAttach(item)}
                >
                  Attach
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  role="menuitem"
                  data-testid="email-delete-btn"
                  className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                  onClick={() => onDelete(item)}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <h2 className="mb-2 min-w-0 truncate pr-6 text-lg font-bold text-gray-800">{item.templateName}</h2>
      <dl className="space-y-3 text-sm text-gray-600">
        <div>
          <dt className="font-medium text-gray-700">Subject</dt>
          <dd>{item.subject}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">Forms</dt>
          <dd>{attachedFormNames.length ? attachedFormNames.join(", ") : "None"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">Email Type</dt>
          <dd>{item.emailType}</dd>
        </div>
      </dl>
      <Button data-testid="email-view-btn" className="mt-4" label="View Details" onClick={() => onView?.(item)} />
    </article>
  );
};

export default EmailTemplateCard;
