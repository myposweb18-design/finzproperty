import { useId, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { AdvancedFilters } from "./AdvancedFilters";
import { countAdvancedFilters, validateSearchFilters } from "@shared/searchUi";
import type { SearchFilters } from "@shared/search";
export function FilterDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onApply,
  onReset,
  appliedCount = 0,
  matchingCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onApply: () => boolean | void;
  onReset: () => void;
  appliedCount?: number;
  matchingCount?: number;
}) {
  const id = useId();
  const [error, setError] = useState("");
  const openingFilters = useRef<SearchFilters>({ ...value });
  function apply(e: React.FormEvent) {
    e.preventDefault();
    const failure = validateSearchFilters(value);
    if (failure) {
      setError(failure);
      return;
    }
    setError("");
    if (onApply() !== false) onOpenChange(false);
  }
  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setError("");
        if (next) openingFilters.current = { ...value };
        else onChange({ ...openingFilters.current });
        onOpenChange(next);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="fp-button inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8c59c] bg-[#fff8e8] px-4 text-sm font-semibold text-[#816128] transition-colors duration-200 hover:bg-[#f9efda]"
        >
          <SlidersHorizontal size={17} />
          More filters
          {appliedCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#0b1f33] px-1 text-[10px] text-white">
              {appliedCount}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-[860px] flex-col gap-0 overflow-hidden rounded-2xl border-[#e7e2d9] p-0 text-[#0b1f33] sm:max-w-[860px]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#ece7df] px-5 py-5 sm:px-7">
          <div>
            <DialogTitle className="font-display text-2xl font-semibold">
              Fine-tune your search
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-5 text-[#75818a]">
              Choose your budget, space and must-have features.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close more filters"
            className="fp-button grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4f1eb] text-[#526570]"
          >
            <X size={18} />
          </DialogClose>
        </div>
        <form
          id={id}
          onSubmit={apply}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7"
        >
          <AdvancedFilters
            value={value}
            onChange={next => {
              setError("");
              onChange(next);
            }}
          />
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-[#fff1ed] p-3 text-sm text-[#a44e43]"
            >
              {error}
            </p>
          )}
        </form>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#ece7df] bg-[#fffdf9] px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={() => {
              onReset();
              setError("");
            }}
            className="fp-button min-h-11 rounded-xl border px-4 text-sm font-semibold text-[#657580]"
          >
            Reset filters
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#879199] sm:block">
              {matchingCount === undefined
                ? `${countAdvancedFilters(value)} selected criteria`
                : `${matchingCount} matching records`}
            </span>
            <button
              form={id}
              type="submit"
              className="fp-button min-h-11 rounded-xl bg-[#0b1f33] px-5 text-sm font-semibold text-white"
            >
              Apply filters
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
