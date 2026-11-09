import { describe, expect, it } from "vitest";
import {
  businessContact,
  getWhatsAppHref,
  normalizePhoneNumber,
} from "./contact";

describe("business contact", () => {
  it("keeps the displayed phone and normalizes it for WhatsApp", () => {
    expect(businessContact.displayPhone).toBe("+94 77 231 0421");
    expect(normalizePhoneNumber(businessContact.displayPhone)).toBe(
      "94772310421"
    );
    expect(businessContact.telHref).toBe("tel:+94772310421");
    expect(businessContact.whatsappHref).toBe("https://wa.me/94772310421");
  });

  it("adds an encoded optional WhatsApp prefill without auto-sending", () => {
    const message = "Hi FinzProperty, I have a question about this listing.";
    expect(getWhatsAppHref(message)).toBe(
      `https://wa.me/94772310421?text=${encodeURIComponent(message)}`
    );
    expect(getWhatsAppHref()).toBe("https://wa.me/94772310421");
  });
});
