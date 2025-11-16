import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background transition-colors duration-300">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center motion-reduce:transition-none">
          <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-2 leading-tight">
            Searchify
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            AI 기반 콘텐츠 생성 플랫폼
          </p>
        </div>
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}

