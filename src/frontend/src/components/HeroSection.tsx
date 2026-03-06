import { motion } from "motion/react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-20">
      {/* Subtle background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(/assets/generated/symptom-hero-bg.dim_1200x600.jpg)",
          opacity: 0.15,
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 max-w-4xl flex flex-col items-center text-center">
        {/* Status pill */}
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-medium tracking-wide mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          AI-Powered Symptom Analysis
        </motion.div>

        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-gradient-primary">Describe Symptoms.</span>
          <br />
          <span className="text-foreground">Get Instant Insights.</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Synapse analyzes your symptoms with advanced AI to surface possible
          conditions, causes, and precautions — in seconds.
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="flex items-center gap-8 sm:gap-12 mt-8 flex-wrap justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          {[
            { label: "Conditions Covered", value: "500+" },
            { label: "Response Time", value: "<5s" },
            { label: "Accuracy", value: "High" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary">
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
