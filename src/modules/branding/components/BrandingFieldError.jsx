const BrandingFieldError = ({ message = "" }) =>
  message ? (
    <p role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  ) : null;

export default BrandingFieldError;
