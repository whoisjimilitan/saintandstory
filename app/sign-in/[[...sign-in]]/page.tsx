import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
            Saint <span className="font-display italic font-normal">&amp;</span> Story
          </p>
          <div className="border-t border-[#0D0D0D] mt-1 mb-1 mx-auto w-20" />
          <p className="font-sans font-medium text-[#0D0D0D] text-[9px] tracking-[0.3em] uppercase">Driver portal</p>
        </div>
        <SignIn fallbackRedirectUrl="/dashboard/admin" />
      </div>
    </div>
  );
}
