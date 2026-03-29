import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListTeams, useCreateTeam } from "@workspace/api-client-react";
import { PageLoader, EmptyState } from "@/components/ui/loading-states";
import { Users, Plus, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Teams() {
  const { data: teams, isLoading, refetch } = useListTeams();
  const createMutation = useCreateTeam();
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { name: newTeamName } }, {
      onSuccess: () => {
        setNewTeamName("");
        setShowCreate(false);
        refetch();
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-foreground">Study Teams</h1>
            <p className="text-muted-foreground mt-2">Collaborate on knowledge bases with peers.</p>
          </div>
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Team
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-top-4 flex gap-4 items-end max-w-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Team Name</label>
              <input 
                autoFocus
                required
                type="text" 
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                className="w-full px-4 py-2 bg-secondary/50 border border-white/5 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g. Neuroscience Study Group"
              />
            </div>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-primary text-white rounded-lg whitespace-nowrap disabled:opacity-50">
              {createMutation.isPending ? "Creating..." : "Save"}
            </button>
          </form>
        )}

        {isLoading ? (
          <PageLoader />
        ) : !teams || teams.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No teams yet" 
            description="Create a team to start sharing subjects and collaborating on study materials." 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div key={team.id} className="glass-panel p-6 rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-1">{team.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{team.description || "No description"}</p>
                
                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4 mt-auto">
                  <div className="flex gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {team.memberCount}</span>
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> {team.subjectCount}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Created {formatDate(team.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
