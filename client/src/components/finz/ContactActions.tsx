import { MessageCircle, Phone } from "lucide-react";
import { businessContact, getWhatsAppHref } from "@shared/contact";
import { cn } from "@/lib/utils";

type ContactActionsProps = {
  variant?: "light" | "dark";
  message?: string;
  className?: string;
};

export function ContactActions({
  variant = "light",
  message,
  className,
}: ContactActionsProps) {
  const dark = variant === "dark";
  const actionClass = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
    dark
      ? "border-white/20 text-white hover:border-[#d8b66a] hover:bg-white/10"
      : "border-[#dcd5c9] text-[#0b1f33] hover:border-[#b99a5d] hover:bg-[#f7f5f0]"
  );
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a
        href={businessContact.telHref}
        aria-label={`Call ${businessContact.displayPhone}`}
        className={actionClass}
      >
        <Phone size={16} aria-hidden="true" />
        Call {businessContact.displayPhone}
      </a>
      <a
        href={getWhatsAppHref(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${businessContact.displayPhone}`}
        className={cn(
          actionClass,
          dark
            ? "hover:border-[#8db89a]"
            : "hover:border-[#8db89a] hover:bg-[#f1f8f2]"
        )}
      >
        <MessageCircle size={16} aria-hidden="true" />
        WhatsApp {businessContact.displayPhone}
      </a>
    </div>
  );
}
