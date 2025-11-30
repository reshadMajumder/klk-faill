
"use client";

import { SiteHeader } from "@/components/site-header";
import { AppFooter } from "@/components/footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {

  return (
      <div className="flex flex-col min-h-screen">
          <SiteHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          <AppFooter />
      </div>
  );
}
