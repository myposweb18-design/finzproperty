import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const STORAGE_KEY = "finzproperty:visitor-state";
type LocalState = {
  favoriteIds: number[];
  compareIds: number[];
  recentIds: number[];
};
const EMPTY_STATE: LocalState = {
  favoriteIds: [],
  compareIds: [],
  recentIds: [],
};
let state: LocalState = EMPTY_STATE;
const listeners = new Set<() => void>();
let hydrated = false;

function readState(): LocalState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "null"
    ) as Partial<LocalState> | null;
    return {
      favoriteIds: Array.isArray(parsed?.favoriteIds)
        ? parsed.favoriteIds.filter(Number.isInteger)
        : [],
      compareIds: Array.isArray(parsed?.compareIds)
        ? parsed.compareIds.filter(Number.isInteger).slice(0, 4)
        : [],
      recentIds: Array.isArray(parsed?.recentIds)
        ? parsed.recentIds.filter(Number.isInteger).slice(0, 12)
        : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = readState();
}

function persist(next: LocalState) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage can be unavailable */
    }
  }
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureHydrated();
  return state;
}

function getServerSnapshot() {
  return EMPTY_STATE;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    state = readState();
    listeners.forEach(listener => listener());
  });
}

export function useVisitorState() {
  const local = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const favouritesQuery = trpc.marketplace.favourites.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
    staleTime: 30_000,
  });
  const favouriteMutation = trpc.marketplace.toggleFavourite.useMutation();

  const toggleFavorite = useCallback(
    async (id: number) => {
      if (!isAuthenticated) {
        const favoriteIds = local.favoriteIds.includes(id)
          ? local.favoriteIds.filter(item => item !== id)
          : [...local.favoriteIds, id];
        persist({ ...local, favoriteIds });
        return;
      }
      try {
        await favouriteMutation.mutateAsync({ propertyId: id });
        await utils.marketplace.favourites.invalidate();
        await utils.portal.summary.invalidate();
      } catch {
        toast.error(
          "We couldn't update your saved properties. Please try again."
        );
      }
    },
    [favouriteMutation, isAuthenticated, local, utils]
  );

  const toggleCompare = useCallback(
    (id: number) => {
      if (local.compareIds.includes(id)) {
        persist({
          ...local,
          compareIds: local.compareIds.filter(item => item !== id),
        });
        return;
      }
      if (local.compareIds.length >= 4) {
        toast.info("Compare up to 4 properties at a time.");
        return;
      }
      persist({ ...local, compareIds: [...local.compareIds, id] });
    },
    [local]
  );

  const recordView = useCallback((id: number) => {
    ensureHydrated();
    if (state.recentIds[0] === id) return;
    persist({
      ...state,
      recentIds: [id, ...state.recentIds.filter(item => item !== id)].slice(
        0,
        12
      ),
    });
  }, []);

  const clearComparison = useCallback(() => {
    persist({ ...local, compareIds: [] });
  }, [local]);

  return {
    favoriteIds: isAuthenticated
      ? (favouritesQuery.data ?? [])
      : local.favoriteIds,
    compareIds: local.compareIds,
    recentIds: local.recentIds,
    toggleFavorite,
    toggleCompare,
    recordView,
    clearComparison,
    favoritesLoading: isAuthenticated && favouritesQuery.isLoading,
    favoritesError: isAuthenticated ? favouritesQuery.error : null,
  };
}
