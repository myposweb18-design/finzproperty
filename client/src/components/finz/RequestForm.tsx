import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";

export type RequestType =
  | "contact"
  | "project"
  | "valuation"
  | "wanted"
  | "service"
  | "mortgage"
  | "event";

export type RequestField = {
  name: string;
  label: string;
  type?: "text" | "select";
  placeholder?: string;
  options?: readonly string[];
  required?: boolean;
};

export type RequestFormProps = {
  type: RequestType;
  propertyId?: number;
  developmentId?: number;
  heading?: string;
  initialMessage?: string;
  onSuccess?: (requestId: number) => void;
  consentRequired?: boolean;
  topicOptions?: readonly string[];
  extraFields?: readonly RequestField[];
};

type FormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  topic: string;
  extras: Record<string, string>;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RequestForm({
  type,
  propertyId,
  developmentId,
  heading = "Tell us what you need",
  initialMessage = "",
  onSuccess,
  consentRequired = false,
  topicOptions,
  extraFields = [],
}: RequestFormProps) {
  const [values, setValues] = useState<FormValues>(() => ({
    name: "",
    email: "",
    phone: "",
    message: initialMessage,
    topic: topicOptions?.[0] ?? "",
    extras: Object.fromEntries(extraFields.map(field => [field.name, ""])),
  }));
  const [consented, setConsented] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receiptId, setReceiptId] = useState<number>();
  const submitRequest = trpc.portal.submitRequest.useMutation({
    onSuccess: result => {
      setReceiptId(result.id);
      onSuccess?.(result.id);
    },
  });

  useEffect(() => {
    setValues(current => ({ ...current, message: initialMessage }));
  }, [initialMessage]);

  const requestLabel = useMemo(() => {
    if (type === "wanted") return "private property-match brief";
    if (type === "event") return "event interest";
    if (type === "service" || type === "valuation" || type === "mortgage")
      return "assistance request";
    return "request";
  }, [type]);

  function updateValue(field: keyof Omit<FormValues, "extras">, value: string) {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
  }

  function updateExtra(name: string, value: string) {
    setValues(current => ({
      ...current,
      extras: { ...current.extras, [name]: value },
    }));
    setErrors(current => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (values.name.trim().length < 2)
      nextErrors.name = "Please enter at least 2 characters.";
    if (!emailPattern.test(values.email.trim()))
      nextErrors.email = "Enter a valid email address.";
    if (values.phone.trim().length > 40)
      nextErrors.phone = "Use 40 characters or fewer.";
    if (values.message.trim().length < 10)
      nextErrors.message = "Please add at least 10 characters.";
    if (values.message.length > 4000)
      nextErrors.message = "Keep the message within 4,000 characters.";
    for (const field of extraFields) {
      if (field.required && !values.extras[field.name]?.trim()) {
        nextErrors[field.name] = `Please provide ${field.label.toLowerCase()}.`;
      }
    }
    if (consentRequired && !consented)
      nextErrors.consent =
        "Please confirm that you have read the terms and privacy notice.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    const details = extraFields
      .map(
        field =>
          `${field.label}: ${values.extras[field.name]?.trim() || "Not provided"}`
      )
      .join("\n");
    const topic = values.topic ? `Topic: ${values.topic}\n` : "";
    const message = [topic, details, values.message.trim()]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 4000);
    submitRequest.mutate({
      type,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      message,
      propertyId,
      developmentId,
    });
  }

  if (receiptId !== undefined) {
    return (
      <div
        className="rounded-[22px] border border-[#d6e5d8] bg-[#f4faf4] p-6"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-[#3d7b53]" size={21} />
          <div>
            <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-[#173d28]">
              Your {requestLabel} is stored for review.
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#4f6d59]">
              Request ID{" "}
              <span className="font-semibold text-[#173d28]">#{receiptId}</span>
              . This receipt confirms storage for admin review; it does not
              confirm provider availability, an appointment, or automatic email
              or WhatsApp delivery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[22px] border border-[#e7e2d9] bg-white p-5 sm:p-7"
      noValidate
    >
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
          Private request
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
          {heading}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#71808b]">
          Stored in the FinzProperty portal for admin review. We do not promise
          a provider match or send this automatically to email or WhatsApp.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {topicOptions && topicOptions.length > 0 && (
          <label className="text-sm font-medium text-[#243948]">
            What is this about?
            <select
              value={values.topic}
              onChange={event => updateValue("topic", event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-[#ddd7cd] bg-[#fffdf9] px-3 text-sm font-normal"
              aria-label="Request topic"
            >
              {topicOptions.map(option => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="text-sm font-medium text-[#243948]">
          Name <span className="text-[#a25d4b]">*</span>
          <input
            value={values.name}
            onChange={event => updateValue("name", event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-[#ddd7cd] bg-[#fffdf9] px-3 text-sm font-normal"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <span className="mt-1 block text-xs text-[#a25d4b]">
              {errors.name}
            </span>
          )}
        </label>
        <label className="text-sm font-medium text-[#243948]">
          Email <span className="text-[#a25d4b]">*</span>
          <input
            type="email"
            value={values.email}
            onChange={event => updateValue("email", event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-[#ddd7cd] bg-[#fffdf9] px-3 text-sm font-normal"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <span className="mt-1 block text-xs text-[#a25d4b]">
              {errors.email}
            </span>
          )}
        </label>
        <label className="text-sm font-medium text-[#243948]">
          Phone <span className="font-normal text-[#8b969b]">(optional)</span>
          <input
            value={values.phone}
            onChange={event => updateValue("phone", event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-[#ddd7cd] bg-[#fffdf9] px-3 text-sm font-normal"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && (
            <span className="mt-1 block text-xs text-[#a25d4b]">
              {errors.phone}
            </span>
          )}
        </label>
        {extraFields.map(field => (
          <label
            className="text-sm font-medium text-[#243948]"
            key={field.name}
          >
            {field.label}{" "}
            {field.required && <span className="text-[#a25d4b]">*</span>}
            {field.type === "select" ? (
              <select
                value={values.extras[field.name] ?? ""}
                onChange={event => updateExtra(field.name, event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#ddd7cd] bg-[#fffdf9] px-3 text-sm font-normal"
                aria-invalid={Boolean(errors[field.name])}
              >
                <option value="">Select an option</option>
                {field.options?.map(option => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={values.extras[field.name] ?? ""}
                onChange={event => updateExtra(field.name, event.target.value)}
                placeholder={field.placeholder}
                className="mt-2 h-11 w-full rounded-xl border border-[#ddd7cd] bg-[#fffdf9] px-3 text-sm font-normal"
                aria-invalid={Boolean(errors[field.name])}
              />
            )}
            {errors[field.name] && (
              <span className="mt-1 block text-xs text-[#a25d4b]">
                {errors[field.name]}
              </span>
            )}
          </label>
        ))}
        <label className="text-sm font-medium text-[#243948] sm:col-span-2">
          Message <span className="text-[#a25d4b]">*</span>
          <textarea
            value={values.message}
            onChange={event => updateValue("message", event.target.value)}
            maxLength={4000}
            rows={5}
            className="mt-2 w-full resize-y rounded-xl border border-[#ddd7cd] bg-[#fffdf9] px-3 py-3 text-sm font-normal leading-6"
            aria-invalid={Boolean(errors.message)}
          />
          <span className="mt-1 flex justify-between text-xs font-normal text-[#8b969b]">
            <span>
              {errors.message ?? "A little context helps us review it."}
            </span>
            <span>{values.message.length}/4000</span>
          </span>
        </label>
      </div>
      {consentRequired && (
        <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#5f6d75]">
          <input
            type="checkbox"
            checked={consented}
            onChange={event => {
              setConsented(event.target.checked);
              setErrors(current => ({ ...current, consent: "" }));
            }}
            className="mt-1 size-4 accent-[#0b1f33]"
          />{" "}
          <span>
            I have read and accept the{" "}
            <Link
              href="/terms"
              className="font-semibold text-[#8d6a2d] underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#8d6a2d] underline"
            >
              Privacy notice
            </Link>
            .
          </span>
        </label>
      )}
      {errors.consent && (
        <p className="mt-2 text-xs text-[#a25d4b]">{errors.consent}</p>
      )}
      {submitRequest.error && (
        <p
          className="mt-4 rounded-xl bg-[#fff2ef] px-3 py-2 text-sm text-[#a25d4b]"
          role="alert"
        >
          We could not store this request. Please check the fields and try
          again.
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[#8b969b]">
          No automatic outbound message is sent. A receipt appears here after
          storage.
        </p>
        <button
          type="submit"
          disabled={submitRequest.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0b1f33] px-5 text-sm font-semibold text-white transition hover:bg-[#173b59] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitRequest.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {submitRequest.isPending ? "Storing…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
