import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  LogIn,
  Sparkles,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { History } from "../backend.d";
import {
  FREE_USE_LIMIT,
  getFreeUseCount,
  hasReachedFreeLimit,
  incrementFreeUseCount,
} from "../hooks/useFreeUsage";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAnalyzeSymptoms } from "../hooks/useQueries";
import { getPatientProfile, savePatientProfile } from "../utils/patientProfile";

interface SymptomInputProps {
  onResult: (result: History) => void;
}

interface PatientInfo {
  name: string;
  gender: string;
  age: string;
}

const EXAMPLE_SYMPTOMS = [
  "Headache, fever (38.5°C), sore throat, and body aches for 3 days",
  "Persistent dry cough, shortness of breath, and fatigue for a week",
  "Stomach cramps, nausea, and diarrhea after eating",
  "Skin rash, itching, and mild swelling on arms",
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function SymptomInput({ onResult }: SymptomInputProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: "",
    gender: "",
    age: "",
  });
  const [nameError, setNameError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);

  const [symptoms, setSymptoms] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const analyzeMutation = useAnalyzeSymptoms();

  const { identity, login } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const principalId = isAuthenticated
    ? identity.getPrincipal().toString()
    : null;

  // When user logs in, dismiss the gate
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginGate(false);
    }
  }, [isAuthenticated]);

  // Load saved profile on mount when authenticated
  useEffect(() => {
    if (!principalId) return;
    const saved = getPatientProfile(principalId);
    if (saved) {
      setPatientInfo({
        name: saved.name || "",
        gender: saved.gender || "",
        age: saved.age || "",
      });
    }
  }, [principalId]);

  // ── Step 1 validation ────────────────────────────────────────────────────
  const validateStep1 = () => {
    let valid = true;

    if (!patientInfo.name.trim()) {
      setNameError("Please enter your full name.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!patientInfo.gender) {
      setGenderError("Please select your gender.");
      valid = false;
    } else {
      setGenderError("");
    }

    const ageNum = Number(patientInfo.age);
    if (
      !patientInfo.age ||
      Number.isNaN(ageNum) ||
      ageNum < 1 ||
      ageNum > 120
    ) {
      setAgeError("Please enter a valid age between 1 and 120.");
      valid = false;
    } else {
      setAgeError("");
    }

    return valid;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      // Save profile to localStorage if authenticated
      if (principalId) {
        savePatientProfile(principalId, {
          name: patientInfo.name,
          gender: patientInfo.gender,
          age: patientInfo.age,
        });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }

      // Send patient info to webhook (fire-and-forget)
      try {
        await fetch(
          "https://hook.eu1.make.com/2azx8290haxgxkrrwr5dq1yf83uetm3s",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: patientInfo.name,
              gender: patientInfo.gender,
              age: patientInfo.age,
            }),
          },
        );
      } catch {
        // Silently ignore webhook errors so the user flow is uninterrupted
      }

      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  // ── Step 2 submit ─────────────────────────────────────────────────────────
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

    // Check free usage limit for anonymous users
    if (!isAuthenticated && hasReachedFreeLimit()) {
      setShowLoginGate(true);
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync(trimmed);
      onResult(result);
      toast.success("Analysis complete!");

      // Increment free use counter for anonymous users
      if (!isAuthenticated) {
        const newCount = incrementFreeUseCount();
        if (newCount >= FREE_USE_LIMIT) {
          setShowLoginGate(true);
        }
      }
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
  const freeUsesLeft = isAuthenticated
    ? null
    : Math.max(0, FREE_USE_LIMIT - getFreeUseCount());

  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
        {/* Login Gate Overlay */}
        <AnimatePresence>
          {showLoginGate && (
            <motion.div
              data-ocid="login_gate.modal"
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/90 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="mx-6 w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-8 shadow-xl text-center"
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Icon */}
                <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Free limit reached
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  You've used your {FREE_USE_LIMIT} free analyses. Log in to
                  continue using Synapse with unlimited checks and saved
                  history.
                </p>

                <Button
                  data-ocid="login_gate.login_button"
                  onClick={login}
                  className="w-full h-11 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-glow gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login to continue
                </Button>

                <p className="mt-4 text-xs text-muted-foreground">
                  Login is free and only takes a few seconds.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 sm:p-8">
          {/* Step indicator */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : step > s
                        ? "bg-primary/25 text-primary border border-primary/40"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div
                    className={`h-px w-8 transition-all duration-500 ${step > 1 ? "bg-primary/40" : "bg-border/60"}`}
                  />
                )}
              </div>
            ))}
            <span className="ml-2 text-xs text-muted-foreground font-medium">
              Step {step} of 2
            </span>

            {/* Free uses remaining badge */}
            {!isAuthenticated && freeUsesLeft !== null && freeUsesLeft > 0 && (
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium">
                {freeUsesLeft} free{" "}
                {freeUsesLeft === 1 ? "analysis" : "analyses"} left
              </span>
            )}
          </div>

          {/* Animated step content */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/25 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Patient Information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isAuthenticated
                        ? "Your profile is saved to your account"
                        : "Tell us a bit about yourself first"}
                    </p>
                  </div>
                </div>

                {/* Profile saved indicator */}
                <AnimatePresence>
                  {profileSaved && (
                    <motion.div
                      data-ocid="patient.success_state"
                      className="flex items-center gap-2 px-4 py-2.5 mb-5 rounded-xl bg-success/10 border border-success/25 text-success text-sm"
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">
                        Profile saved to your account
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={handleNext}
                  className="space-y-4 sm:space-y-5"
                  noValidate
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="patient-name"
                      className="text-sm font-medium text-foreground/90"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="patient-name"
                      data-ocid="patient.name_input"
                      type="text"
                      placeholder="e.g. Aryan Patel"
                      value={patientInfo.name}
                      onChange={(e) => {
                        setPatientInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        if (nameError) setNameError("");
                      }}
                      className={`bg-secondary/40 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 text-sm transition-all duration-200 rounded-xl font-body h-11 ${nameError ? "border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20" : ""}`}
                      autoComplete="name"
                      aria-describedby={nameError ? "name-error" : undefined}
                    />
                    {nameError && (
                      <p
                        id="name-error"
                        data-ocid="patient.name_error_state"
                        className="text-xs text-destructive flex items-center gap-1 mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {nameError}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="patient-gender"
                      className="text-sm font-medium text-foreground/90"
                    >
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={patientInfo.gender}
                      onValueChange={(val) => {
                        setPatientInfo((prev) => ({ ...prev, gender: val }));
                        if (genderError) setGenderError("");
                      }}
                    >
                      <SelectTrigger
                        id="patient-gender"
                        data-ocid="patient.gender_select"
                        className={`bg-secondary/40 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm transition-all duration-200 rounded-xl font-body h-11 ${genderError ? "border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20" : ""} ${!patientInfo.gender ? "[&>span]:text-muted-foreground/50" : ""}`}
                        aria-describedby={
                          genderError ? "gender-error" : undefined
                        }
                      >
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border/60 rounded-xl">
                        {GENDER_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-sm font-body cursor-pointer"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {genderError && (
                      <p
                        id="gender-error"
                        data-ocid="patient.gender_error_state"
                        className="text-xs text-destructive flex items-center gap-1 mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {genderError}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="patient-age"
                      className="text-sm font-medium text-foreground/90"
                    >
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="patient-age"
                      data-ocid="patient.age_input"
                      type="number"
                      min={1}
                      max={120}
                      placeholder="e.g. 28"
                      value={patientInfo.age}
                      onChange={(e) => {
                        setPatientInfo((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }));
                        if (ageError) setAgeError("");
                      }}
                      className={`bg-secondary/40 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 text-sm transition-all duration-200 rounded-xl font-body h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${ageError ? "border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20" : ""}`}
                      autoComplete="age"
                      aria-describedby={ageError ? "age-error" : undefined}
                    />
                    {ageError && (
                      <p
                        id="age-error"
                        data-ocid="patient.age_error_state"
                        className="text-xs text-destructive flex items-center gap-1 mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {ageError}
                      </p>
                    )}
                  </div>

                  {/* Next button */}
                  <Button
                    type="submit"
                    data-ocid="patient.next_button"
                    className="w-full px-8 py-3 h-12 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 mt-2 shadow-glow"
                  >
                    Continue to Symptoms
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/25 flex items-center justify-center">
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

                {/* Personalized greeting */}
                <motion.div
                  className="mb-5 mt-1 px-4 py-2.5 rounded-xl bg-primary/8 border border-primary/20 text-sm text-primary font-medium"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Hi, <span className="font-semibold">{patientInfo.name}</span>!
                  Describe your symptoms below and we'll analyze them for you.
                </motion.div>

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
                      className="resize-none bg-secondary/40 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 text-sm leading-relaxed transition-all duration-200 rounded-xl font-body"
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
                          Analysis failed. Please check your input and try
                          again.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action row */}
                  <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                    {/* Back button */}
                    <button
                      type="button"
                      data-ocid="patient.back_button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed py-2 sm:py-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      data-ocid="symptom.submit_button"
                      disabled={isLoading || !symptoms.trim()}
                      className="flex-1 sm:flex-none px-8 py-3 h-12 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          <span data-ocid="symptom.loading_state">
                            Analyzing…
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 w-4 h-4" />
                          Analyze Symptoms
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
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
                        className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/35 hover:bg-primary/8 transition-all duration-150 max-w-full sm:max-w-xs line-clamp-1 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        title={example}
                      >
                        {example.length > 40
                          ? `${example.slice(0, 40)}…`
                          : example}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
