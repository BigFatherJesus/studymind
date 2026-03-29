import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useListKnowledgeNodes } from '@workspace/api-client-react';
import { PageLoader } from '@/components/ui/loading-states';
import { Brain } from 'lucide-react';

export function KnowledgeMap({ subjectId }: { subjectId: string }) {
  const { data: graph, isLoading } = useListKnowledgeNodes(subjectId);

  // Transform API data to xyflow format
  const initialNodes = useMemo(() => {
    if (!graph?.nodes) return [];
    return graph.nodes.map((n, i) => ({
      id: n.id,
      position: { x: n.x || (i % 5) * 200, y: n.y || Math.floor(i / 5) * 150 },
      data: { label: n.label, type: n.nodeType },
      style: {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)'
      }
    }));
  }, [graph]);

  const initialEdges = useMemo(() => {
    if (!graph?.edges) return [];
    return graph.edges.map(e => ({
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      label: e.label || '',
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 }
    }));
  }, [graph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Update states when API data loads
  useMemo(() => {
    if (graph) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [graph, setNodes, setEdges, initialNodes, initialEdges]);

  if (isLoading) return <PageLoader />;

  if (!graph?.nodes?.length) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center glass-panel rounded-2xl border-dashed">
        <Brain className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-xl font-display">Knowledge Map Empty</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          Upload and process materials to generate the AI concept graph.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] glass-panel rounded-2xl overflow-hidden border border-white/10 relative">
      <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex gap-4 text-xs font-medium">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Concepts</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Definitions</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Events</div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="xyflow-dark-theme"
      >
        <Controls className="bg-card border-white/10 fill-foreground" />
        <MiniMap nodeStrokeColor="#4f46e5" nodeColor="hsl(var(--card))" maskColor="rgba(0,0,0,0.3)" className="bg-background border-white/10" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="hsl(var(--border))" />
      </ReactFlow>
    </div>
  );
}
