import { Outlet, useLocation, Link } from "react-router";
import { Home, Compass, Trophy, User, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";

export function RootLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/generate", icon: Plus, label: "Generate", isSpecial: true },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-full flex bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* Background Gradients for Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[rgb(var(--gradient-from))] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[rgb(var(--gradient-to))] rounded-full blur-[120px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full glass border-r border-[rgba(var(--border-color),0.3)] z-50 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] rounded-xl flex items-center justify-center shadow-lg shadow-[rgb(var(--gradient-from))]/20">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ExplainIt AI</span>
        </div>

        <nav className="flex-1 space-y-2">
           {navItems.filter(item => !item.isSpecial).map((item) => {
             const Icon = item.icon;
             const active = isActive(item.path);
             
             return (
               <Link
                 key={item.path}
                 to={item.path}
                 className={clsx(
                   "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                   active 
                     ? "bg-gradient-to-r from-[rgb(var(--gradient-from))]/10 to-transparent text-[rgb(var(--text-primary))] font-bold border-l-4 border-[rgb(var(--gradient-from))]" 
                     : "text-[rgb(var(--text-tertiary))] hover:bg-[rgb(var(--bg-tertiary))]"
                 )}
               >
                 <Icon className={clsx("w-6 h-6", active ? "text-[rgb(var(--gradient-from))]" : "text-current")} />
                 <span>{item.label}</span>
               </Link>
             );
           })}
        </nav>

        <Link
          to="/generate"
          className="mt-auto w-full py-4 rounded-2xl bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
           <Plus className="w-5 h-5" />
           Create New
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
        <div className="flex-1 overflow-hidden relative w-full h-full">
            <Outlet />
        </div>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden glass sticky bottom-0 z-50 pb-safe pt-2 px-2 border-t border-[rgba(var(--border-color),0.3)]">
            <div className="flex items-end justify-between max-w-lg mx-auto pb-2 px-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                // Special styling for Generate button
                if (item.isSpecial) {
                return (
                    <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center gap-1 group relative -top-5"
                    >
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] rounded-full flex items-center justify-center border-4 border-[rgb(var(--bg-primary))] shadow-lg shadow-[rgb(var(--gradient-from))]/30"
                    >
                        <Plus className="w-8 h-8 text-white stroke-[3]" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-[rgb(var(--text-primary))]">
                        Generate
                    </span>
                    </Link>
                );
                }
                
                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center gap-1 py-1 px-3 min-w-[60px]"
                >
                    <div className="relative p-1">
                    <Icon
                        className={clsx(
                        "w-6 h-6 transition-all duration-300",
                        active 
                            ? "stroke-[2.5] text-[rgb(var(--text-primary))]" 
                            : "text-[rgb(var(--text-tertiary))]"
                        )}
                    />
                    {active && (
                        <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[rgb(var(--gradient-from))] opacity-10 rounded-xl"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    </div>
                    <span
                    className={clsx(
                        "text-[10px] font-medium transition-colors duration-300",
                        active 
                        ? "text-[rgb(var(--text-primary))]" 
                        : "text-[rgb(var(--text-tertiary))]"
                    )}
                    >
                    {item.label}
                    </span>
                </Link>
                );
            })}
            </div>
        </nav>
      </div>
    </div>
  );
}
