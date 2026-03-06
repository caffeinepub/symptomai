// Compatibility wrapper that re-exports useActor with the platform-injected
// _initializeAccessControlWithSecret method included in the actor type.
// This method is injected at runtime by the Caffeine actor proxy and cannot
// be declared in the protected backend.ts file.
import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

export type backendInterfaceWithAdmin = backendInterface & {
  _initializeAccessControlWithSecret(secret: string): Promise<void>;
};

export function useActorCompat() {
  const result = useActor();
  return {
    ...result,
    actor: result.actor as backendInterfaceWithAdmin | null,
  };
}
