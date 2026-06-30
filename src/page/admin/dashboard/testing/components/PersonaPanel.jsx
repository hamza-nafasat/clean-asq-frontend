import { useState } from "react";
import { FiChevronDown, FiEye, FiEyeOff } from "react-icons/fi";

export default function PersonaPanel({
  personas,
  selectedPersona,
  onPersonaChange,
  credentials,
  onCredentialsChange,
  formUrl,
  onFormUrlChange,
  baseUrl = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const selected = personas.find((p) => p.id === selectedPersona) || personas[0];

  return (
    <div className="space-y-4">
      {/* Test Account */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Test Account</h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          The credentials used to log in when running tests that require authentication.
        </p>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => onCredentialsChange({ ...credentials, email: e.target.value })}
              placeholder="admin@yourdomain.com"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => onCredentialsChange({ ...credentials, password: e.target.value })}
                placeholder="Password"
                className="w-full rounded-md border border-gray-200 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form URL */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Application Form URL</h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Used for applicant flow and AI chat tests. Leave blank to auto-detect
          the first available form, or add a path to target a specific one.
        </p>
        <div className="flex items-stretch rounded-md border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
          {baseUrl && (
            <span className="shrink-0 bg-gray-50 border-r border-gray-200 px-3 py-2 text-sm text-gray-400 font-mono select-none flex items-center">
              {baseUrl}
            </span>
          )}
          <input
            type="text"
            value={formUrl.startsWith(baseUrl) ? formUrl.slice(baseUrl.length) : formUrl}
            onChange={(e) => {
              const path = e.target.value;
              onFormUrlChange(path ? baseUrl + (path.startsWith("/") ? path : "/" + path) : "");
            }}
            placeholder="/application-form/your-token-here"
            className="flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none bg-white"
          />
        </div>
        {!formUrl && (
          <p className="text-[11px] text-gray-400 mt-1.5">
            Blank = server will auto-detect the first available form.
          </p>
        )}
      </div>

      {/* Test Persona */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Test Persona</h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          The persona provides fake applicant data (name, email, phone, etc.) used
          to fill application forms during testing.
        </p>
        <div className="space-y-2">
          {personas.map((p) => (
            <label
              key={p.id}
              className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                selectedPersona === p.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="persona"
                value={p.id}
                checked={selectedPersona === p.id}
                onChange={() => onPersonaChange(p.id)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{p.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
