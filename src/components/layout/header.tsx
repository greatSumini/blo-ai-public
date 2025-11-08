"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/brand/logo";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sidebar />
        </div>
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
            afterSignOutUrl="/sign-in"
          />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="default"
              className="h-10 bg-[#3BA2F8] hover:bg-[#2E91E5] px-6 font-semibold"
            >
              로그인
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
