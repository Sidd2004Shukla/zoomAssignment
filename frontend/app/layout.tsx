import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

import "react-datepicker/dist/react-datepicker.css";

import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0E78F9",
  colorScheme: "dark",
};

export const metadata: Metadata = siteConfig;

const AppLayout = ({ children }: Readonly<PropsWithChildren>) => {
  return (
    <html lang="en">
      <body className={cn("bg-white", inter.className)}>
        <ClerkProvider
          appearance={{
            layout: {
              socialButtonsVariant: "iconButton",
            },
            variables: {
              colorText: "#111827",
              colorPrimary: "#2d6cdf",
              colorBackground: "#ffffff",
              colorInputBackground: "#f8fafc",
              colorInputText: "#111827",
            },
          }}
        >
          {children}
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
};

export default AppLayout;
