import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  Users, 
  CreditCard, 
  LayoutDashboard, 
  Bell, 
  Menu,
  BrainCircuit,
  Search,
  Plus
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGetCurrentUser, useGetCredits } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: user } = useGetCurrentUser();
  const { data: credits } = useGetCredits();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/subjects/new", label: "New Subject", icon: Plus },
    { href: "/teams", label: "Study Teams", icon: Users },
    { href: "/credits", label: "Credits & Plan", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-white">StudyMind</span>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search concepts..." 
              className="w-full bg-secondary/50 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 ml-2">Menu</div>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-secondary/40 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground">AI Credits</span>
              <span className="text-xs font-bold text-primary">{credits?.balance || 0}</span>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent" 
                style={{ width: `${Math.min(((credits?.balance || 0) / (credits?.monthlyIncluded || 100)) * 100, 100)}%` }}
              />
            </div>
            <Link href="/credits" className="text-[10px] text-muted-foreground hover:text-primary mt-2 block transition-colors">
              Upgrade Plan
            </Link>
          </div>
          
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-white/10">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">
                  {user?.displayName?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{user?.displayName || "Demo User"}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.subscriptionTier || "Free"} Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-5 pointer-events-none mix-blend-screen" />
        
        <header className="h-16 glass-panel border-b border-white/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>StudyMind</span>
              <span>/</span>
              <span className="text-foreground font-medium capitalize">
                {location === "/" ? "Dashboard" : location.split("/")[1]}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </button>
            <Link href="/subjects/new" className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/15 text-sm font-medium px-4 py-2 rounded-lg border border-white/10 transition-all">
              <Plus className="w-4 h-4" />
              New Subject
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
