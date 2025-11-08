import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Searchify</h1>
          <p className="text-sm text-gray-600">AI 기반 콘텐츠 생성 플랫폼</p>
        </div>
        <SignUp appearance={clerkAppearance} />
      </div>
    </div>
  );
}
