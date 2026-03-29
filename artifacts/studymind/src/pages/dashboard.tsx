import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useListSubjects } from "@workspace/api-client-react";
import { BookOpen, Brain, Clock, FileText, Sparkles, AlertCircle } from "lucide-react";
import { PageLoader, ErrorState, EmptyState } from "@/components/ui/loading-states";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { data: subjects, isLoading, isError } = useListSubjects();

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display text-foreground">Welcome back, Scholar.</h1>
          <p className="text-muted-foreground mt-2 text-lg">Your knowledge base is ready for expansion.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Subjects", value: subjects?.length || 0, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Concepts Mapped", value: subjects?.reduce((acc, s) => acc + s.nodeCount, 0) || 0, icon: Brain, color: "text-purple-400", bg: "bg-purple-400/10" },
            { label: "Documents Parsed", value: subjects?.reduce((acc, s) => acc + s.uploadsCount, 0) || 0, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Flashcards Ready", value: subjects?.reduce((acc, s) => acc + s.flashcardsCount, 0) || 0, icon: Sparkles, color: "text-amber-400", bg: "bg-amber-400/10" },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display text-foreground">Your Subjects</h2>
            <Link href="/subjects/new" className="text-primary text-sm font-medium hover:underline">
              View All
            </Link>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <ErrorState />
          ) : !subjects || subjects.length === 0 ? (
            <EmptyState 
              icon={BookOpen}
              title="No subjects yet" 
              description="Create your first subject to start building your AI-powered knowledge base."
              action={
                <Link href="/subjects/new" className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200">
                  Create Subject
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Link key={subject.id} href={`/subjects/${subject.id}`}>
                  <div className="group glass-panel rounded-2xl p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                        subject.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        subject.status === 'initializing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {subject.status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{subject.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                      {subject.description || subject.aiDescription || "No description provided."}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">Uploads</span>
                        <span className="text-sm font-semibold text-foreground">{subject.uploadsCount}</span>
                      </div>
                      <div className="flex flex-col items-center border-x border-white/5">
                        <span className="text-xs text-muted-foreground">Concepts</span>
                        <span className="text-sm font-semibold text-foreground">{subject.nodeCount}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">Cards</span>
                        <span className="text-sm font-semibold text-foreground">{subject.flashcardsCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
