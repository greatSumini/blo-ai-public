import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import type { CurrentUserSnapshot } from "../types";

export const loadCurrentUser = async (): Promise<CurrentUserSnapshot> => {
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
};
