import { useBranding } from "@/hooks/BrandingContext";

function Footer() {
  const { applicationFooterText } = useBranding();

  return (
    <div className="bg-footer flex h-20 w-full flex-col items-center justify-between gap-2 rounded-t-md border-t-2 px-4 py-4 shadow md:h-16 md:flex-row md:gap-0 md:px-4 xl:px-20">
      {/* Left side */}
      <div className="flex">
        <div className="text-footer-text"> © {new Date().getFullYear()}</div>
      </div>
      {/* center side */}
      <div className="text-footer-text max-w-4xl text-xl font-semibold">{applicationFooterText}</div>

      {/* Right side (links) */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-2">
        <div className="text-footer-text hover:text-secondary cursor-pointer">Privacy Policy</div>
        <div className="text-footer-text hover:text-secondary cursor-pointer">Terms of Service</div>
        <div className="text-footer-text hover:text-secondary cursor-pointer">Help Center</div>
      </div>
    </div>
  );
}

export default Footer;
