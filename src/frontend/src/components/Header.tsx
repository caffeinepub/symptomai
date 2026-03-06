import { Activity } from "lucide-react";
import { motion } from "motion/react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse-glow">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <span className="font-display text-xl font-semibold text-gradient-primary">
                Synapse
              </span>
              <div className="hidden sm:block text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                AI Health Assistant
              </div>
            </div>
          </motion.div>

          {/* Status badge */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-success/30 bg-success/10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">AI Online</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
