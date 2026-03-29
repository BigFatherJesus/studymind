import { BrainCircuit } from "lucide-react";

export function PageLoader() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-white/10 flex items-center justify-center z-10 relative backdrop-blur-sm">
          <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">Synthesizing knowledge...</p>
    </div>
  );
}

export function ErrorState({ message, retry }: { message?: string, retry?: () => void }) {
  return (
    <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
        <span className="text-2xl">⚠️</span>
      </div>
      <div>
        <h3 className="text-lg font-display text-foreground">Something went wrong</h3>
        <p className="text-muted-foreground text-sm max-w-md mt-2">{message || "We couldn't load this content right now."}</p>
      </div>
      {retry && (
        <button onClick={retry} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm rounded-lg transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action, icon: Icon }: { title: string, description: string, action?: React.ReactNode, icon: any }) {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center glass-panel rounded-2xl border-dashed border-white/10">
      <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4 border border-white/5">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-display text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mt-2 mb-6">{description}</p>
      {action}
    </div>
  );
}
