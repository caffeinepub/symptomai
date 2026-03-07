import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { History } from "../backend.d";
import type { ImageData } from "../utils/geminiAnalyzer";
import { analyzeSymptomsSmart } from "../utils/geminiAnalyzer";
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
    mutationFn: async (
      payload:
        | {
            symptoms: string;
            age?: string;
            gender?: string;
            imageData?: ImageData;
          }
        | string,
    ): Promise<History> => {
      // Support both old string API and new object API
      const symptoms = typeof payload === "string" ? payload : payload.symptoms;
      const age = typeof payload === "object" ? payload.age : undefined;
      const gender = typeof payload === "object" ? payload.gender : undefined;
      const imageData =
        typeof payload === "object" ? payload.imageData : undefined;

      // Call Gemini AI (with image support)
      const result = await analyzeSymptomsSmart(
        symptoms,
        age,
        gender,
        imageData,
      );

      // Persist to backend in the background — do NOT await, so UI is not blocked
      if (actor) {
        actor.analyzeSymptoms(symptoms).catch(() => {
          // Backend call failed — silently ignore, local result is sufficient
        });
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
