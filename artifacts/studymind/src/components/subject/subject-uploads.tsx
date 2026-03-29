import { useState } from "react";
import { useListUploads, useCreateUpload, useProcessUpload, Upload, CreateUploadRequestType } from "@workspace/api-client-react";
import { FileText, Link as LinkIcon, Upload as UploadIcon, AlertCircle, CheckCircle2, Loader2, Play } from "lucide-react";
import { EmptyState } from "@/components/ui/loading-states";
import { formatDate } from "@/lib/utils";

export function SubjectUploads({ subjectId }: { subjectId: string }) {
  const { data: uploads, isLoading, refetch } = useListUploads(subjectId);
  const createMutation = useCreateUpload();
  const processMutation = useProcessUpload();
  
  const [showAdd, setShowAdd] = useState(false);
  const [newUpload, setNewUpload] = useState({ title: "", type: "text" as CreateUploadRequestType, content: "", url: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ subjectId, data: newUpload }, {
      onSuccess: () => {
        setShowAdd(false);
        setNewUpload({ title: "", type: "text", content: "", url: "" });
        refetch();
      }
    });
  };

  const handleProcess = (uploadId: string) => {
    processMutation.mutate({ subjectId, uploadId }, {
      onSuccess: () => refetch()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display font-semibold">Source Materials</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <UploadIcon className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-xl border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
              <input required type="text" value={newUpload.title} onChange={e => setNewUpload({...newUpload, title: e.target.value})} className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-white/5 text-sm" placeholder="e.g. Chapter 1 Notes" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <select value={newUpload.type} onChange={e => setNewUpload({...newUpload, type: e.target.value as CreateUploadRequestType})} className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-white/5 text-sm">
                <option value="text">Raw Text</option>
                <option value="url">Web URL</option>
              </select>
            </div>
          </div>
          
          {newUpload.type === "url" ? (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">URL</label>
              <input required type="url" value={newUpload.url} onChange={e => setNewUpload({...newUpload, url: e.target.value})} className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-white/5 text-sm" placeholder="https://..." />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Content</label>
              <textarea required rows={4} value={newUpload.content} onChange={e => setNewUpload({...newUpload, content: e.target.value})} className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-white/5 text-sm resize-none" placeholder="Paste your notes here..." />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90">
              {createMutation.isPending ? "Adding..." : "Add Material"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : !uploads || uploads.length === 0 ? (
        <EmptyState icon={FileText} title="No materials uploaded" description="Add notes, PDFs, or links to build the knowledge base." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploads.map(upload => (
            <div key={upload.id} className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    {upload.type === 'url' ? <LinkIcon className="w-5 h-5 text-blue-400" /> : <FileText className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">{upload.title}</h4>
                    <span className="text-xs text-muted-foreground">{formatDate(upload.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                    upload.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    upload.status === 'failed' ? 'bg-destructive/10 text-destructive-foreground' :
                    upload.status === 'processing' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {upload.status}
                  </span>
                  
                  {upload.status === 'pending' && (
                    <button 
                      onClick={() => handleProcess(upload.id)}
                      className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Play className="w-3 h-3" /> Process AI
                    </button>
                  )}
                </div>
              </div>
              
              {upload.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 bg-black/20 p-3 rounded-lg border border-white/5">
                  {upload.summary}
                </p>
              )}
              
              <div className="mt-auto pt-4 flex gap-4 text-xs text-muted-foreground">
                <span>{upload.nodesGenerated} Nodes</span>
                <span>{upload.flashcardsGenerated} Cards</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
