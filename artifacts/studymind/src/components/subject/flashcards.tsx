import { useState } from "react";
import { useListFlashcards } from "@workspace/api-client-react";
import { PageLoader, EmptyState } from "@/components/ui/loading-states";
import { Layers, ChevronRight, ChevronLeft, RotateCcw, ThumbsUp, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Flashcards({ subjectId }: { subjectId: string }) {
  const { data: cards, isLoading } = useListFlashcards(subjectId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (isLoading) return <PageLoader />;
  
  if (!cards || cards.length === 0) {
    return <EmptyState icon={Layers} title="No Flashcards" description="AI will generate flashcards when you process materials." />;
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center px-4">
        <span className="text-sm font-medium text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="flex gap-2">
          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
            currentCard.difficulty === 'hard' ? 'bg-destructive/20 text-destructive-foreground' :
            currentCard.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            {currentCard.difficulty}
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl aspect-[3/2] perspective-1000 relative cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          className="w-full h-full relative transform-style-3d transition-transform duration-500"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl group-hover:shadow-primary/20 transition-shadow border border-white/10">
            <h3 className="text-2xl md:text-3xl font-display font-medium text-foreground">{currentCard.front}</h3>
            <div className="absolute bottom-6 flex items-center gap-2 text-muted-foreground/50 text-sm">
              <RotateCcw className="w-4 h-4" /> Click to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl border border-primary/30">
            <p className="text-lg md:text-xl text-foreground font-sans leading-relaxed">{currentCard.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="w-full max-w-2xl mt-10 flex justify-between items-center px-4">
        <button onClick={handlePrev} className="p-3 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>

        {isFlipped && (
          <div className="flex gap-3 animate-in slide-in-from-bottom-4">
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive/20 text-destructive-foreground hover:bg-destructive/30 font-medium transition-colors">
              <Brain className="w-4 h-4" /> Hard
            </button>
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-medium transition-colors">
              <ThumbsUp className="w-4 h-4" /> Got it
            </button>
          </div>
        )}

        <button onClick={handleNext} className="p-3 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
