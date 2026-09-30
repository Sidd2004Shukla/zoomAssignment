import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const SignInPage = () => {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f8fafc] px-4 py-12">
      <Link href="/" className="mb-4 flex items-center">
        <span className="text-[44px] font-semibold tracking-[-2.5px] text-[#2d6cdf]">
          zoom
        </span>
      </Link>

      {/* Evaluator Banner */}
      <div className="mb-6 flex w-full max-w-[440px] items-center justify-between rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-3.5 text-xs text-[#1e40af]">
        <span>No account required to evaluate all core features.</span>
        <Link
          href="/"
          className="rounded-lg bg-[#2d6cdf] px-3 py-1.5 font-semibold text-white transition hover:bg-[#245bc2]"
        >
          Skip Login &rarr;
        </Link>
      </div>

      <div className="w-full max-w-[440px]">
        <SignIn
          appearance={{
            elements: {
              card: "shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#e5e7eb] rounded-2xl",
              headerTitle: "text-[#111827] text-2xl font-bold",
              headerSubtitle: "text-[#5f6675]",
              formButtonPrimary:
                "bg-[#2d6cdf] hover:bg-[#245bc2] text-sm normal-case font-semibold",
              socialButtonsBlockButton:
                "border border-[#e5e7eb] text-[#202938] hover:bg-[#f6f8fa]",
              footerActionLink: "text-[#2d6cdf] hover:underline font-semibold",
            },
          }}
        />
      </div>
    </main>
  );
};

export default SignInPage;
