
import { SiteHeader } from "@/components/site-header";
import { AppFooter } from "@/components/footer";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 py-6 sm:py-8 lg:py-12">{children}</main>
      <AppFooter />
    </div>
  );
}
