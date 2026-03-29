import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useCreateSubject } from "@workspace/api-client-react";
import { Brain, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateSubject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateSubject();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    syllabusText: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    createMutation.mutate({ data: formData }, {
      onSuccess: (newSubject) => {
        toast({
          title: "Subject Created",
          description: "Your AI knowledge base is initializing.",
        });
        setLocation(`/subjects/${newSubject.id}`);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create subject. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-foreground">Create New Subject</h1>
          <p className="text-muted-foreground mt-2">Initialize a new AI-powered knowledge base.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Advanced Neuroscience"
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Short Description
              </label>
              <input
                type="text"
                placeholder="What is this subject about?"
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-medium text-foreground">AI Initialization (Optional)</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Paste your syllabus or curriculum text here. Our AI will automatically extract key concepts and build an initial knowledge structure.
              </p>
              
              <textarea
                placeholder="Paste curriculum, learning objectives, or syllabus text..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                value={formData.syllabusText}
                onChange={e => setFormData({ ...formData, syllabusText: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.title.trim()}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing AI...
                </>
              ) : (
                <>
                  Create Knowledge Base
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
