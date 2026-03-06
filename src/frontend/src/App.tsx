import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { History } from "./backend.d";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HistoryPanel from "./components/HistoryPanel";
import MedicalDisclaimer from "./components/MedicalDisclaimer";
import ResultCard from "./components/ResultCard";
import SymptomInput from "./components/SymptomInput";

export default function App() {
  const [latestResult, setLatestResult] = useState<History | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" theme="light" />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div className="container mx-auto px-4 py-6 sm:py-10 lg:py-12 max-w-4xl space-y-6 sm:space-y-8 pb-20 sm:pb-12">
          <MedicalDisclaimer />
          <SymptomInput onResult={setLatestResult} />
          {latestResult && <ResultCard result={latestResult} />}
          <HistoryPanel onSelectResult={setLatestResult} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
