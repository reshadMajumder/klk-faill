
import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="text-muted-foreground mt-2 text-sm">
              The peer-to-peer learning platform.
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/contributions" className="hover:text-primary transition-colors">Discover</Link></li>
                <li><Link href="/top-contributors" className="hover:text-primary transition-colors">Top Contributors</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
             <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
           <p>
            &copy; {new Date().getFullYear()} Jahidul hassan reshad. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
