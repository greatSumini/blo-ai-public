import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AfterAuthPage() {
  const { userId, sessionClaims } = await auth();

  // 인증되지 않은 경우 로그인 페이지로 리디렉트
  if (!userId) {
    redirect("/sign-in");
  }

  // 온보딩 완료 여부 확인
  const onboardingCompleted = sessionClaims?.metadata?.onboardingCompleted === true;

  if (onboardingCompleted) {
    // 온보딩 완료 시 대시보드로 리디렉트
    redirect("/dashboard");
  } else {
    // 온보딩 미완료 시 온보딩 페이지로 리디렉트
    redirect("/auth/onboarding");
  }
}
