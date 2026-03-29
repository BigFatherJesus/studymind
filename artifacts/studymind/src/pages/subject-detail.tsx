import { useState } from "react";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { useGetSubject } from "@workspace/api-client-react";
import { PageLoader, ErrorState } from "@/components/ui/loading-states";
import { SubjectUploads } from "@/components/subject/subject-uploads";
import { KnowledgeMap } from "@/components/subject/knowledge-map";
import { Flashcards } from "@/components/subject/flashcards";
import { ChatTutor } from "@/components/subject/chat-tutor";
import { Brain, FileText, Layers, MessageSquare, Network, Settings, CheckCircle2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function SubjectDetail() {
  const [, params] = useRoute("/subjects/:id");
  const subjectId = params?.id || "";
  
  const { data: subject, isLoading, isError } = useGetSubject(subjectId);
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) return <Layout><PageLoader /></Layout>;
  if (isError || !subject) return <Layout><ErrorState /></Layout>;

  const tabs = [
    { id: "overview", label: "Overview", icon: Brain },
    { id: "uploads", label: "Materials", icon: FileText },
    { id: "map", label: "Knowledge Map", icon: Network },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "chat", label: "AI Tutor", icon: MessageSquare },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Brain className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", 
                subject.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                "bg-blue-500/10 text-blue-400 border-blue-500/20"
              )}>
                {subject.status}
              </span>
              <span className="text-xs text-muted-foreground">Created {formatDate(subject.createdAt)}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">{subject.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {subject.aiDescription || subject.description || "No description generated yet."}
            </p>

            {subject.verificationScore !== undefined && subject.verificationScore !== null && (
              <div className="mt-6 flex items-center gap-2 text-sm bg-black/20 w-max px-4 py-2 rounded-lg border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">AI Verification Score:</span>
                <span className="font-bold text-foreground">{subject.verificationScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-white/10"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" /> Key Concepts Extracted
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subject.keyConcepts?.length ? subject.keyConcepts.map((concept, i) => (
                    <span key={i} className="px-3 py-1.5 bg-secondary/50 border border-white/5 rounded-lg text-sm text-foreground">
                      {concept}
                    </span>
                  )) : (
                    <p className="text-sm text-muted-foreground">No concepts extracted yet. Upload materials to begin.</p>
                  )}
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="text-xl font-display font-semibold mb-4">Quick Stats</h3>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Materials</span>
                  <span className="font-bold">{subject.uploadsCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Nodes</span>
                  <span className="font-bold">{subject.nodeCount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Flashcards</span>
                  <span className="font-bold">{subject.flashcardsCount}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "uploads" && <SubjectUploads subjectId={subjectId} />}
          {activeTab === "map" && <KnowledgeMap subjectId={subjectId} />}
          {activeTab === "flashcards" && <Flashcards subjectId={subjectId} />}
          {activeTab === "chat" && <ChatTutor subjectId={subjectId} />}
        </div>
      </div>
    </Layout>
  );
}
