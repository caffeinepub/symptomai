import { Brain, Dna, HeartPulse } from "lucide-react";
import { motion } from "motion/react";

const floatingIcons = [
  { Icon: Dna, delay: 0, x: "10%", y: "20%", id: "dna" },
  { Icon: Brain, delay: 0.5, x: "85%", y: "30%", id: "brain" },
  { Icon: HeartPulse, delay: 1, x: "75%", y: "70%", id: "heartpulse" },
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "380px" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(/assets/generated/symptom-hero-bg.dim_1200x600.jpg)",
          opacity: 0.35,
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, delay, x, y, id }) => (
        <motion.div
          key={id}
          className="absolute hidden md:flex items-center justify-center w-12 h-12 rounded-2xl border border-primary/20 bg-primary/10 backdrop-blur-sm"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.6, delay },
            scale: { duration: 0.6, delay },
            y: {
              duration: 3,
              delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 max-w-4xl flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-medium tracking-wider uppercase mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Powered by AI
        </motion.div>

        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-gradient-primary">Describe Symptoms.</span>
          <br />
          <span className="text-foreground">Get Instant Insights.</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          SymptomAI analyzes your symptoms with advanced AI to provide potential
          conditions, causes, and precautions — in seconds.
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="flex items-center gap-6 mt-8 flex-wrap justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          {[
            { label: "Conditions Analyzed", value: "500+" },
            { label: "Response Time", value: "<30s" },
            { label: "AI Accuracy", value: "High" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl font-bold text-primary">
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
