import { cn } from "@/lib/utils";

const AuthLayout = ({ heroTitle, heroHighlight, heroText, className = "", children }) => (
  <main className="montserrat-font flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-white md:flex-row">
    <section className="hidden flex-col justify-center md:mt-1 md:flex">
      <p className="mb-8 text-4xl font-bold">
        {heroTitle} <span className="text-secondary">{heroHighlight}</span>
      </p>
      <p className="mb-8 max-w-md text-lg font-semibold text-gray-500">{heroText}</p>
    </section>

    <section
      className={cn("flex w-full max-w-md flex-col justify-center rounded-xl bg-white p-10 shadow-2xl md:w-1/2", className)}
    >
      {children}
    </section>
  </main>
);

export default AuthLayout;
