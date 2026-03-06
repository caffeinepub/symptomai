import { HeartIcon } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  )}`;

  return (
    <footer className="mt-auto border-t border-border/40 py-6">
      <div className="container mx-auto px-4 max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs opacity-60">Synapse</span>
          <span className="opacity-30">·</span>
          <span className="text-xs opacity-60">
            For informational purposes only
          </span>
        </div>
        <div className="text-xs opacity-70 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span>Contact: +91 98985 90856</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <a
            href="mailto:tanayshah265@gmail.com"
            className="hover:text-primary transition-colors"
          >
            tanayshah265@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span>© {year}. Built with</span>
          <HeartIcon className="w-3.5 h-3.5 text-destructive fill-current" />
          <span>using</span>
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/80 hover:text-primary transition-colors underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
