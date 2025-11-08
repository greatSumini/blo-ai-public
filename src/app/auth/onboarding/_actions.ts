"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * 온보딩 완료 처리 서버 액션
 * 사용자의 publicMetadata에 onboardingCompleted를 true로 설정
 */
export async function completeOnboarding() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    // Clerk 클라이언트를 사용하여 사용자 메타데이터 업데이트
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingCompleted: true,
      },
    });

    return {
      success: true,
      message: "온보딩이 완료되었습니다.",
    };
  } catch (error) {
    console.error("온보딩 완료 처리 중 오류:", error);
    return {
      success: false,
      error: "온보딩 완료 처리 중 오류가 발생했습니다.",
    };
  }
}
