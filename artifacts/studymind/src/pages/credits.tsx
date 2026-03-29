import { Layout } from "@/components/layout";
import { useGetCredits } from "@workspace/api-client-react";
import { PageLoader } from "@/components/ui/loading-states";
import { Zap, CreditCard, CheckCircle2 } from "lucide-react";

export default function Credits() {
  const { data: credits, isLoading } = useGetCredits();

  if (isLoading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display text-foreground">Credits & Plan</h1>
          <p className="text-muted-foreground mt-2">Manage your AI compute usage and subscription.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Balance */}
          <div className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden">
            <Zap className="absolute -bottom-4 -right-4 w-40 h-40 text-primary/10 pointer-events-none" />
            <h3 className="text-lg font-medium text-foreground mb-2">Available Credits</h3>
            <div className="text-5xl font-display font-bold text-foreground mb-4">
              {credits?.balance || 0}
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Resets to {credits?.monthlyIncluded || 0} on your next billing date.
            </p>
            <button className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
              Buy Add-on Credits
            </button>
          </div>

          {/* Current Plan */}
          <div className="glass-panel p-8 rounded-2xl border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-1">Current Plan</h3>
                <p className="text-2xl font-bold text-primary capitalize">{credits?.tier || 'Free'} Tier</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {["100 AI queries per month", "Standard processing speed", "Up to 5 active subjects", "Basic graph visualization"].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {feature}
                </li>
              ))}
            </ul>

            <button className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
