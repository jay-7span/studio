import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 13.8141 21.5148 15.5115 20.6687 17" />
      <path d="M12 6V12L16 14" />
      <path d="M18 17L20.5 19.5" />
      <path d="M17.5 20.5L19.5 18.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
