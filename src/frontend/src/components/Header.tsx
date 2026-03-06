import { Button } from "@/components/ui/button";
import { Activity, Loader2, LogIn, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-4)}`;
}

export default function Header() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const isLoading = isLoggingIn || isInitializing;
  const principalId = isAuthenticated
    ? identity.getPrincipal().toString()
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="font-display text-lg sm:text-xl font-semibold text-gradient-primary truncate block">
                Synapse
              </span>
              <div className="hidden sm:block text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                AI Health Assistant
              </div>
            </div>
          </motion.div>

          {/* Right side: Status + Auth */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 min-w-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* AI Online badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-success/25 bg-success/8 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
              <span className="text-xs text-success font-medium hidden sm:inline">
                AI Online
              </span>
            </div>

            {/* Auth section */}
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {isInitializing ? "Loading…" : "Signing in…"}
                </span>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* User badge */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-5 h-5 rounded-full bg-primary/25 border border-primary/40 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-primary/80">
                    {truncatePrincipal(principalId!)}
                  </span>
                </div>
                {/* Logout button */}
                <Button
                  data-ocid="header.logout_button"
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                data-ocid="header.login_button"
                variant="outline"
                size="sm"
                onClick={login}
                className="h-8 px-3 text-xs border-border bg-transparent hover:bg-primary/10 hover:border-primary/50 hover:text-primary rounded-lg gap-1.5 transition-all duration-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
