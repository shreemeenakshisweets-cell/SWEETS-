import type { SVGProps } from "react";

export function FacebookGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.75h2.6l.39-3.02h-3v-1.93c0-.87.24-1.47 1.5-1.47h1.6V4.14C15.98 4.06 15.08 4 14.02 4c-2.2 0-3.71 1.34-3.71 3.8v2.43H7.7v3.02h2.6V21h3.2Z" />
    </svg>
  );
}

export function WhatsAppGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.47 14.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.68-2.09-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.65-.94-2.26-.24-.6-.5-.51-.68-.52h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.22 5.1 4.51.71.31 1.27.49 1.7.62.72.23 1.36.2 1.88.12.57-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.02 2.5C6.77 2.5 2.5 6.75 2.5 12c0 1.72.46 3.34 1.27 4.74L2.5 21.5l4.9-1.24A9.46 9.46 0 0 0 12.02 21.5c5.25 0 9.5-4.25 9.5-9.5s-4.25-9.5-9.5-9.5Zm0 17.3c-1.6 0-3.1-.44-4.38-1.2l-.31-.19-3.03.77.8-2.95-.2-.32a7.78 7.78 0 0 1-1.2-4.17c0-4.3 3.5-7.8 7.82-7.8 2.09 0 4.05.82 5.53 2.3a7.75 7.75 0 0 1 2.29 5.5c0 4.3-3.5 7.8-7.82 7.8Z" />
    </svg>
  );
}

export function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
