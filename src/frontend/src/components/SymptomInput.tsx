import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { History } from "../backend.d";
import { useAnalyzeSymptoms } from "../hooks/useQueries";

interface SymptomInputProps {
  onResult: (result: History) => void;
}

const EXAMPLE_SYMPTOMS = [
  "Headache, fever (38.5°C), sore throat, and body aches for 3 days",
  "Persistent dry cough, shortness of breath, and fatigue for a week",
  "Stomach cramps, nausea, and diarrhea after eating",
  "Skin rash, itching, and mild swelling on arms",
];

export default function SymptomInput({ onResult }: SymptomInputProps) {
  const [symptoms, setSymptoms] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const analyzeMutation = useAnalyzeSymptoms();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = symptoms.trim();
    if (!trimmed) {
      toast.error("Please describe your symptoms first.");
      return;
    }
    if (trimmed.length < 10) {
      toast.error("Please provide more detail about your symptoms.");
      return;
    }

    try {
      // analyzeMutation now returns a History object directly from local analysis
      const result = await analyzeMutation.mutateAsync(trimmed);
      onResult(result);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Analysis failed. Please try again.");
    }
  };

  const handleExampleClick = (example: string) => {
    setSymptoms(example);
    textareaRef.current?.focus();
  };

  const charCount = symptoms.length;
  const isLoading = analyzeMutation.isPending;
  const hasError = analyzeMutation.isError;

  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="p-6 sm:p-8">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Describe Your Symptoms
              </h2>
              <p className="text-sm text-muted-foreground">
                Be as specific as possible for better results
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                data-ocid="symptom.textarea"
                placeholder="Describe your symptoms in detail, e.g. I have a headache, fever, and sore throat for 2 days..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={isLoading}
                rows={5}
                className="resize-none bg-secondary/40 border-border/60 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50 text-sm leading-relaxed transition-all duration-200 rounded-xl font-body"
                aria-label="Symptom description"
              />
              {/* Character count */}
              <div className="absolute bottom-3 right-3 text-xs font-mono text-muted-foreground/50">
                {charCount} chars
              </div>
            </div>

            {/* Error state */}
            <AnimatePresence>
              {hasError && (
                <motion.div
                  data-ocid="symptom.error_state"
                  className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Analysis failed. Please check your input and try again.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <Button
              type="submit"
              data-ocid="symptom.submit_button"
              disabled={isLoading || !symptoms.trim()}
              className="w-full sm:w-auto px-8 py-3 h-12 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-glow hover:shadow-glow-strong disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  <span data-ocid="symptom.loading_state">Analyzing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-4 h-4" />
                  Analyze Symptoms
                  <ChevronRight className="ml-1 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Example symptoms */}
          <div className="mt-6 pt-5 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SYMPTOMS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-150 truncate max-w-[200px] sm:max-w-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title={example}
                >
                  {example.length > 40 ? `${example.slice(0, 40)}…` : example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
