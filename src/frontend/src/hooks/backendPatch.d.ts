// Augments backendInterface with platform-injected admin methods.
// These methods are injected at runtime by the Caffeine actor proxy.

import type {} from "../backend.d";

declare module "../backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret: (secret: string) => Promise<void>;
  }
  // Also augment the Backend class so config.ts (which returns Backend) satisfies the interface
  interface Backend {
    _initializeAccessControlWithSecret: (secret: string) => Promise<void>;
  }
}
