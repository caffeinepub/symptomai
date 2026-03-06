import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { History } from "../backend.d";
import { analyzeSymptoms } from "../utils/symptomAnalyzer";
import { useActor } from "./useActor";

export function useGetHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<History[]>({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getHistory();
      // Sort by timestamp descending (newest first)
      return [...result].sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnalyzeSymptoms() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symptoms: string): Promise<History> => {
      // Run analysis locally — this always succeeds
      const result = analyzeSymptoms(symptoms);

      // Attempt to persist to backend (best-effort — ignore any errors)
      try {
        if (actor) {
          await actor.analyzeSymptoms(symptoms);
        }
      } catch {
        // Backend call failed — silently ignore, local result is sufficient
      }

      // Build a local History object so the UI can display results immediately
      const localHistory: History = {
        id: BigInt(Date.now()),
        symptoms,
        disease: result.disease,
        cause: result.cause,
        precautions: result.precautions,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000), // nanoseconds
      };

      return localHistory;
    },
    onSuccess: (newEntry) => {
      // Immediately insert the new entry into the cached history list
      // so the history panel updates without waiting for a backend refetch
      queryClient.setQueryData<History[]>(["history"], (prev) => {
        const existing = prev ?? [];
        // Avoid duplicates if backend already returned it
        const alreadyExists = existing.some((h) => h.id === newEntry.id);
        if (alreadyExists) return existing;
        return [newEntry, ...existing];
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
