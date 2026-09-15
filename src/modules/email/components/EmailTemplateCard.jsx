import { FiMoreVertical } from "react-icons/fi";

const EmailTemplateCard = ({ item = {}, isMenuOpen = false, menuRef, onToggleMenu, onEdit, onAttach, onDelete, onView }) => (
  <div
    data-testid="email-card"
    className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
  >
    <div className="absolute top-4 right-4">
      <FiMoreVertical
        data-testid="email-card-menu-btn"
        className="cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={() => onToggleMenu?.(item)}
      />
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-6 right-0 z-50 w-32 rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <button
            type="button"
            data-testid="email-edit-btn"
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            onClick={() => onEdit?.(item)}
          >
            Edit
          </button>
          <button
            type="button"
            data-testid="email-attach-btn"
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            onClick={() => onAttach?.(item)}
          >
            Attach
          </button>
          <button
            type="button"
            data-testid="email-delete-btn"
            className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
            onClick={() => onDelete?.(item)}
          >
            Delete
          </button>
        </div>
      )}
    </div>

    <h2 className="mb-2 text-lg font-bold text-gray-800">{item.templateName}</h2>
    <div className="space-y-3 text-sm text-gray-600">
      <div>
        <p className="font-medium text-gray-700">Subject</p>
        <p>{item.subject}</p>
      </div>
      <div>
        <p className="font-medium text-gray-700">Application</p>
        <p>{item.email}</p>
      </div>
      <div>
        <p className="font-medium text-gray-700">Email Type</p>
        <p>{item.emailType}</p>
      </div>
    </div>
    <button
      type="button"
      data-testid="email-view-btn"
      onClick={() => onView?.(item)}
      className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
    >
      View Details
    </button>
  </div>
);

export default EmailTemplateCard;
