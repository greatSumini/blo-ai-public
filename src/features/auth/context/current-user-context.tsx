"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import type {
  CurrentUserContextValue,
  CurrentUserSnapshot,
} from "../types";

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

type CurrentUserProviderProps = {
  children: ReactNode;
  initialState: CurrentUserSnapshot;
};

export const CurrentUserProvider = ({
  children,
  initialState,
}: CurrentUserProviderProps) => {
  const queryClient = useQueryClient();
  const { user: clerkUser, isLoaded } = useUser();
  const [snapshot, setSnapshot] = useState<CurrentUserSnapshot>(initialState);

  const refresh = useCallback(async () => {
    if (!isLoaded) return;

    const nextSnapshot: CurrentUserSnapshot = clerkUser
      ? {
          status: "authenticated",
          user: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
            appMetadata: {},
            userMetadata: {},
          },
        }
      : { status: "unauthenticated", user: null };

    setSnapshot(nextSnapshot);
    queryClient.setQueryData(["currentUser"], nextSnapshot);
  }, [clerkUser, isLoaded, queryClient]);

  const value = useMemo<CurrentUserContextValue>(() => {
    const currentSnapshot: CurrentUserSnapshot = clerkUser
      ? {
          status: "authenticated",
          user: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
            appMetadata: {},
            userMetadata: {},
          },
        }
      : isLoaded
        ? { status: "unauthenticated", user: null }
        : snapshot;

    return {
      ...currentSnapshot,
      refresh,
      isAuthenticated: currentSnapshot.status === "authenticated",
      isLoading: !isLoaded,
    };
  }, [clerkUser, isLoaded, refresh, snapshot]);

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserContext = () => {
  const value = useContext(CurrentUserContext);

  if (!value) {
    throw new Error("CurrentUserProvider가 트리 상단에 필요합니다.");
  }

  return value;
};
