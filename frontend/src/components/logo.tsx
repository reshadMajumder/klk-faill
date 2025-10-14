
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <BookOpen className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-semibold tracking-tight">
        CG Swap
      </span>
    </Link>
  );
}
