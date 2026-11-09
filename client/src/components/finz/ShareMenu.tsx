import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
export function ShareMenu({
  title = "FinzProperty search",
}: {
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const u = encodeURIComponent(url),
    t = encodeURIComponent(title);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs"
      >
        <Share2 size={14} />
        Share
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 grid w-48 gap-1 rounded-xl border bg-white p-3 shadow-xl">
          {[
            { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
            {
              name: "Facebook",
              href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
            },
            {
              name: "X",
              href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
            },
            {
              name: "LinkedIn",
              href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
            },
            {
              name: "Telegram",
              href: `https://t.me/share/url?url=${u}&text=${t}`,
            },
            { name: "Email", href: `mailto:?subject=${t}&body=${u}` },
          ].map(s => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-xs hover:bg-[#f4f1eb]"
            >
              {s.name}
            </a>
          ))}
          <button
            onClick={() => {
              void navigator.clipboard
                .writeText(url)
                .then(() => {
                  toast.success("Link copied");
                  setOpen(false);
                })
                .catch(() =>
                  toast.error(
                    "Clipboard unavailable. Copy the address from your browser."
                  )
                );
            }}
            className="rounded-lg px-3 py-2 text-left text-xs hover:bg-[#f4f1eb]"
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
