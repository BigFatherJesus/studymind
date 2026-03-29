import { useState, useRef, useEffect } from "react";
import { useListChatMessages, useSendChatMessage, ChatMessage } from "@workspace/api-client-react";
import { BrainCircuit, Send, User, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";

export function ChatTutor({ subjectId }: { subjectId: string }) {
  const { data: history, refetch } = useListChatMessages(subjectId);
  const sendMutation = useSendChatMessage();
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, sendMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMutation.mutate({ subjectId, data: { content: input } }, {
      onSuccess: () => {
        setInput("");
        refetch();
      }
    });
  };

  return (
    <div className="flex flex-col h-[70vh] glass-panel rounded-2xl border border-white/5 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">AI Study Tutor</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your uploaded materials</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {!history || history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Sparkles className="w-10 h-10 mb-4" />
            <p>I'm ready to answer questions about this subject.</p>
          </div>
        ) : (
          history.map((msg: ChatMessage) => (
            <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn("w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1", 
                msg.role === 'user' ? "bg-secondary" : "bg-primary/20"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-foreground" /> : <BrainCircuit className="w-4 h-4 text-primary" />}
              </div>
              <div className={cn("rounded-2xl px-5 py-3.5", 
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-secondary/50 border border-white/5 text-foreground prose prose-invert prose-sm max-w-none"
              )}>
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
                
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-[10px] bg-black/40 px-2 py-1 rounded text-muted-foreground flex items-center gap-1">
                        <span className="text-primary">[{i+1}]</span> {cite.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {sendMutation.isPending && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1 bg-primary/20">
              <BrainCircuit className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="rounded-2xl px-5 py-4 bg-secondary/50 border border-white/5 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-secondary border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || sendMutation.isPending}
            className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
