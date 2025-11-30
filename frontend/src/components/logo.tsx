import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130 24"
      width="130"
      height="24"
      {...props}
    >
      <text
        x="0"
        y="18"
        className="font-headline"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
      >
        CG-LAGBE
      </text>
    </svg>
  );
}
