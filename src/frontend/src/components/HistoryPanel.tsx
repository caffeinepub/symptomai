import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  ClipboardList,
  Clock,
  History,
  Loader2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { History as HistoryItem } from "../backend.d";
import { useClearHistory, useGetHistory } from "../hooks/useQueries";

interface HistoryPanelProps {
  onSelectResult: (result: HistoryItem) => void;
}

function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export default function HistoryPanel({ onSelectResult }: HistoryPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: history, isLoading } = useGetHistory();
  const clearMutation = useClearHistory();

  const handleClear = async () => {
    try {
      await clearMutation.mutateAsync();
      setIsDialogOpen(false);
      toast.success("History cleared successfully.");
    } catch {
      toast.error("Failed to clear history.");
    }
  };

  return (
    <motion.section
      className="relative rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      {/* Header */}
      <div className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center">
            <History className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Past Checks
            </h2>
            <p className="text-xs text-muted-foreground">
              {history && history.length > 0
                ? `${history.length} record${history.length !== 1 ? "s" : ""}`
                : "No records yet"}
            </p>
          </div>
        </div>

        {/* Clear button + dialog */}
        {history && history.length > 0 && (
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                data-ocid="history.delete_button"
                variant="outline"
                size="sm"
                className="gap-2 text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-150 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border/60 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-lg">
                  Clear all history?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-sm">
                  This will permanently delete all your past symptom checks.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <Button
                  data-ocid="history.cancel_button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-lg border-border/60 bg-secondary/30 hover:bg-secondary/50"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="history.confirm_button"
                  variant="destructive"
                  onClick={handleClear}
                  disabled={clearMutation.isPending}
                  className="rounded-lg"
                >
                  {clearMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Clearing…
                    </>
                  ) : (
                    "Yes, Clear All"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Content */}
      <div data-ocid="history.list" className="divide-y divide-border/30">
        {isLoading ? (
          // Loading skeletons
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0 bg-muted/40" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3 bg-muted/40" />
                  <Skeleton className="h-3 w-2/3 bg-muted/30" />
                  <Skeleton className="h-3 w-1/4 bg-muted/25" />
                </div>
              </div>
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          // Empty state
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4">
              <ClipboardList className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-display text-base font-medium text-foreground/70 mb-1">
              No previous checks
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your symptom analysis history will appear here after your first
              check.
            </p>
          </div>
        ) : (
          // History items
          <AnimatePresence>
            {history.map((item, index) => (
              <motion.button
                key={item.id.toString()}
                data-ocid={`history.item.${index + 1}`}
                type="button"
                onClick={() => onSelectResult(item)}
                className="w-full text-left px-6 sm:px-8 py-4 hover:bg-secondary/30 transition-all duration-150 group flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Index badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-mono font-bold text-primary">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground truncate">
                      {item.disease || "Analysis complete"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
                    {truncate(item.symptoms, 100)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mt-1" />
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.section>
  );
}
