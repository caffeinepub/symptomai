import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Info, ShieldCheck, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import type { History } from "../backend.d";

interface ResultCardProps {
  result: History;
}

const resultSections = [
  {
    key: "disease" as keyof History,
    label: "Condition / Disease",
    Icon: Stethoscope,
    iconClass: "text-chart-1",
    iconBg: "bg-chart-1/15 border-chart-1/30",
    borderClass: "border-l-chart-1/60",
    description: "Possible condition based on your symptoms",
  },
  {
    key: "cause" as keyof History,
    label: "Likely Cause",
    Icon: Info,
    iconClass: "text-info",
    iconBg: "bg-info/15 border-info/30",
    borderClass: "border-l-info/60",
    description: "What may be causing your symptoms",
  },
  {
    key: "precautions" as keyof History,
    label: "Precautions to Take",
    Icon: ShieldCheck,
    iconClass: "text-success",
    iconBg: "bg-success/15 border-success/30",
    borderClass: "border-l-success/60",
    description: "Steps to manage your condition",
  },
];

function parsePrecautions(text: string): string[] {
  // Try to split by numbered list, bullet points, or semicolons
  const numbered = text.match(/\d+\.\s+([^\n]+)/g);
  if (numbered && numbered.length > 1) {
    return numbered.map((s) => s.replace(/^\d+\.\s+/, "").trim());
  }
  const bullets = text.split(/[•\-\*]\s+/).filter(Boolean);
  if (bullets.length > 1) {
    return bullets.map((s) => s.trim());
  }
  const semicolons = text.split(/[;,]/).filter((s) => s.trim().length > 8);
  if (semicolons.length > 1) {
    return semicolons.map((s) => s.trim());
  }
  return [text];
}

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <motion.section
      data-ocid="result.card"
      className="relative rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-4 flex flex-wrap items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/25 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
            Analysis Results
          </h2>
          <p className="text-xs text-muted-foreground">
            Based on the symptoms you described
          </p>
        </div>
        <div className="hidden sm:block ml-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI Analysis
          </span>
        </div>
      </div>

      {/* Symptom summary */}
      <div className="px-4 sm:px-8 pb-4">
        <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            Symptoms Analyzed
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {result.symptoms}
          </p>
        </div>
      </div>

      <Separator className="opacity-40" />

      {/* Result sections */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {resultSections.map(
          ({ key, label, Icon, iconClass, iconBg, description }, index) => {
            const value = result[key] as string;
            const isPrecautions = key === "precautions";
            const items = isPrecautions ? parsePrecautions(value) : null;

            return (
              <motion.div
                key={key}
                className={`flex gap-4 pl-4 border-l-2 ${
                  index === 0
                    ? "border-l-chart-1/60"
                    : index === 1
                      ? "border-l-info/60"
                      : "border-l-success/60"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.15 }}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${iconBg}`}
                >
                  <Icon className={`w-4.5 h-4.5 ${iconClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-2">
                    {description}
                  </p>

                  {isPrecautions && items && items.length > 1 ? (
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-foreground leading-relaxed"
                        >
                          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-success/70" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed">
                      {value}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          },
        )}
      </div>
    </motion.section>
  );
}
