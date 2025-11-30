
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Mail, Phone } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t bg-background text-foreground">
      <div className="container py-12 md:py-20 lg:py-24">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div>
            <h3 className="text-lg font-medium">Experience liftoff</h3>
          </div>
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Download</Link></li>
                <li><Link href="/contributions" className="text-sm text-muted-foreground hover:text-primary">Contributions</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Docs</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Use Cases</Link></li>
                 <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-2">
              <h4 className="font-semibold mb-4">Contact</h4>
               <ul className="space-y-3">
                 <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href="mailto:hi@reshad.dev" className="text-sm text-muted-foreground hover:text-primary">hi@reshad.dev</a>
                 </li>
                 <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">+8801627076527</span>
                 </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center my-24">
          <span className="text-8xl md:text-9xl font-bold tracking-tighter font-headline">
            CG-LAGBE
          </span>
        </div>

      </div>
      <div className="border-t">
        <div className="container flex items-center justify-between py-6 text-sm">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-auto" />
            <span className="hidden sm:inline">&copy; {new Date().getFullYear()} CG-LAGBE. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
