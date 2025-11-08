import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import type { CurrentUserSnapshot } from "../types";

export const loadCurrentUser = async (): Promise<CurrentUserSnapshot> => {
  try {
    const user = await currentUser();

    if (user) {
      return {
        status: "authenticated",
        user: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? null,
          appMetadata: {},
          userMetadata: {},
        },
      };
    }

    return { status: "unauthenticated", user: null };
  } catch (error) {
    // If currentUser() fails (e.g., called outside clerkMiddleware scope),
    // treat as unauthenticated
    console.warn("Failed to load current user:", error);
    return { status: "unauthenticated", user: null };
  }
};
