export const businessContact = {
  displayPhone: "+94 77 231 0421",
  phone: "+94772310421",
  telHref: "tel:+94772310421",
  whatsappHref: "https://wa.me/94772310421",
} as const;

export function normalizePhoneNumber(phone: string) {
  return phone.replace(/\D/g, "").replace(/^00/, "");
}

export function getWhatsAppHref(message?: string) {
  const trimmedMessage = message?.trim();
  if (!trimmedMessage) return businessContact.whatsappHref;
  return `${businessContact.whatsappHref}?text=${encodeURIComponent(message ?? "")}`;
}

export const whatsappHrefForMessage = getWhatsAppHref;
