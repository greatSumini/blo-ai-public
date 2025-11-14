import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AfterAuthPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const onboardingCompleted = sessionClaims?.metadata?.onboardingCompleted === true;
  if (onboardingCompleted) {
    redirect("/dashboard");
  } else {
    redirect("/auth/onboarding");
  }
}

