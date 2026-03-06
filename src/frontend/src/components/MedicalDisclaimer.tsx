import { TriangleAlert } from "lucide-react";
import { motion } from "motion/react";

export default function MedicalDisclaimer() {
  return (
    <motion.div
      className="flex gap-3 p-4 rounded-xl border border-warning/30 bg-warning/8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="alert"
      aria-label="Medical disclaimer"
    >
      <div className="flex-shrink-0 mt-0.5">
        <TriangleAlert className="w-4 h-4 text-warning" />
      </div>
      <p className="text-sm text-warning/90 leading-relaxed">
        <span className="font-semibold">Medical Disclaimer: </span>
        This tool is for informational purposes only and does not constitute
        medical advice. Always consult a qualified healthcare professional for
        diagnosis and treatment.
      </p>
    </motion.div>
  );
}
