import { TriangleAlert } from "lucide-react";
import { motion } from "motion/react";

export default function MedicalDisclaimer() {
  return (
    <motion.div
      className="flex gap-3 p-4 rounded-xl border border-border/50 border-l-4 border-l-warning bg-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="alert"
      aria-label="Medical disclaimer"
    >
      <div className="flex-shrink-0 mt-0.5">
        <TriangleAlert className="w-4 h-4 text-warning" />
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground/80">
          Medical Disclaimer:{" "}
        </span>
        This tool is for informational purposes only and does not constitute
        medical advice. Always consult a qualified healthcare professional for
        diagnosis and treatment.
      </p>
    </motion.div>
  );
}
