import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { links } from "@/config";

import { MobileNav } from "./mobile-nav";

export const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/icons/logo.svg"
          alt="Yoom logo"
          width={32}
          height={32}
          className="max-sm:size-10"
        />

        <p className="text-[26px] font-extrabold text-white max-sm:hidden">
          Yoom
        </p>
      </Link>

      <div className="flex-between gap-5">
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>

        <SignedOut>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="rounded-lg bg-dark-3 px-4 py-2 text-sm font-semibold text-white hover:bg-[#252A41]">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-blue-1 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <Link
          href={links.sourceCode}
          target="_blank"
          rel="noreferrer noopener"
          title="Source Code"
        >
          <Image src="/icons/github.svg" alt="GitHub" height={80} width={80} />
        </Link>

        <MobileNav />
      </div>
    </nav>
  );
};
