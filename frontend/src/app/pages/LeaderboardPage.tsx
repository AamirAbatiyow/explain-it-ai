import { useState } from "react";
import { Trophy, Medal, TrendingUp, Users, Crown, Zap, Globe, School, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mockLeaderboard } from "../data/mockData";
import { LeaderboardEntry } from "../types";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

export function LeaderboardPage() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "allTime">("weekly");
  const [scopeFilter, setScopeFilter] = useState<"global" | "community" | "friends">("global");
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);

  // Filter leaderboard based on scope
  const getFilteredLeaderboard = () => {
    let filtered = [...leaderboard];
    
    if (scopeFilter === "friends") {
      filtered = filtered.filter(entry => entry.isFriend || entry.isCurrentUser);
    } else if (scopeFilter === "community") {
      // Mock community filter - let's say odd ranked users are in the same community + current user
      filtered = filtered.filter(entry => entry.rank % 2 !== 0 || entry.isCurrentUser);
    }
    
    // Update current user info if available
    if (user) {
      filtered = filtered.map(entry => {
        if (entry.isCurrentUser) {
          return {
            ...entry,
            user: {
              ...entry.user,
              displayName: user.username || user.name || entry.user.displayName,
              username: user.username || entry.user.username,
            }
          };
        }
        return entry;
      });
    }
    
    // Re-sort based on points (just to be safe, though mock data is sorted)
    return filtered.sort((a, b) => b.points - a.points);
  };

  const currentLeaderboard = getFilteredLeaderboard();
  const topThree = currentLeaderboard.slice(0, 3);
  const rest = currentLeaderboard.slice(3);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "from-purple-500 to-pink-500";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-[rgb(var(--text-tertiary))]">#{rank}</span>;
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[rgb(var(--bg-primary))] pb-20">
      {/* Header & Podium Section - Dark Background for contrast */}
      <div className="bg-gradient-to-b from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] pt-8 pb-10 px-6 rounded-b-[3rem] shadow-xl mb-6 text-white relative overflow-hidden">
        {/* Decorative Background Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 text-center mb-6">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 drop-shadow-md">
            <Trophy className="w-8 h-8 text-yellow-300 fill-yellow-500" />
            Leaderboard
          </h1>
          
          {/* Scope Filter (Tabs) */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10 w-full max-w-sm">
              <button
                onClick={() => setScopeFilter("global")}
                className={clsx(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  scopeFilter === "global" ? "bg-white text-[rgb(var(--accent-primary))]" : "text-white/70 hover:bg-white/10"
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                Global
              </button>
              <button
                onClick={() => setScopeFilter("community")}
                className={clsx(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  scopeFilter === "community" ? "bg-white text-[rgb(var(--accent-primary))]" : "text-white/70 hover:bg-white/10"
                )}
              >
                <School className="w-3.5 h-3.5" />
                Community
              </button>
              <button
                onClick={() => setScopeFilter("friends")}
                className={clsx(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  scopeFilter === "friends" ? "bg-white text-[rgb(var(--accent-primary))]" : "text-white/70 hover:bg-white/10"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                Friends
              </button>
            </div>
          </div>

          {/* Time Filter */}
          <div className="inline-flex gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
            {(["daily", "weekly", "allTime"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  timeFilter === filter ? "bg-white text-[rgb(var(--accent-primary))]" : "text-white/70 hover:bg-white/10"
                )}
              >
                {filter === "daily" && "Today"}
                {filter === "weekly" && "This Week"}
                {filter === "allTime" && "All Time"}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <AnimatePresence mode="wait">
        <motion.div 
            key={scopeFilter + timeFilter}
            className="flex items-end justify-center gap-4 relative z-10 mt-8"
        >
          {topThree.length > 1 && (
          /* 2nd Place */
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-2xl border-2 border-white/50 shadow-lg">
                {topThree[1].user.avatar}
              </div>
              <div className="absolute -top-2 -right-1 bg-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">#2</div>
            </div>
            <div className="text-white font-semibold text-xs text-center truncate w-full px-1 mb-1 opacity-90">
              {topThree[1].user.displayName}
            </div>
            <div className="text-yellow-300 font-bold text-sm mb-1">{topThree[1].points.toLocaleString()}</div>
            <div className="w-full h-24 bg-white/10 backdrop-blur-sm rounded-t-xl border-t border-white/20" />
          </motion.div>
          )}

          {topThree.length > 0 && (
          /* 1st Place */
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="flex-1 flex flex-col items-center z-20 -mx-2"
          >
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-4xl border-4 border-white/50 shadow-xl ring-4 ring-yellow-500/30">
                {topThree[0].user.avatar}
              </div>
              <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-300 drop-shadow-lg fill-yellow-500" />
            </div>
            <div className="text-white font-bold text-sm text-center truncate w-full px-1 mb-1">
              {topThree[0].user.displayName}
            </div>
            <div className="text-yellow-300 font-black text-lg mb-2">{topThree[0].points.toLocaleString()}</div>
            <div className="w-full h-32 bg-white/20 backdrop-blur-md rounded-t-2xl border-t border-white/30 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
          )}

          {topThree.length > 2 && (
          /* 3rd Place */
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl border-2 border-white/50 shadow-lg">
                {topThree[2].user.avatar}
              </div>
              <div className="absolute -top-2 -right-1 bg-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">#3</div>
            </div>
            <div className="text-white font-semibold text-xs text-center truncate w-full px-1 mb-1 opacity-90">
              {topThree[2].user.displayName}
            </div>
            <div className="text-yellow-300 font-bold text-sm mb-1">{topThree[2].points.toLocaleString()}</div>
            <div className="w-full h-16 bg-white/10 backdrop-blur-sm rounded-t-xl border-t border-white/20" />
          </motion.div>
          )}
        </motion.div>
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="px-4 pb-6 space-y-3">
        {rest.length > 0 ? (
          rest.map((entry, index) => (
            <motion.div
              key={entry.user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                entry.isCurrentUser
                  ? "bg-[rgb(var(--accent-primary))]/10 border-[rgb(var(--accent-primary))]"
                  : "bg-[rgb(var(--bg-secondary))] border-[rgb(var(--border-color))]"
              )}
            >
              <div className="w-8 text-center font-bold text-[rgb(var(--text-tertiary))] text-sm">
                #{entry.rank}
              </div>
              
              <div className="relative">
                 <div className="w-10 h-10 rounded-full bg-[rgb(var(--bg-tertiary))] flex items-center justify-center text-lg border border-[rgb(var(--border-color))]">
                   {entry.user.avatar}
                 </div>
              </div>

              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2">
                   <h3 className={clsx("font-bold text-sm truncate", entry.isCurrentUser ? "text-[rgb(var(--accent-primary))]" : "text-[rgb(var(--text-primary))]")}>
                     {entry.user.displayName}
                   </h3>
                   {entry.isFriend && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded-full font-bold">Friend</span>}
                 </div>
                 <p className="text-[rgb(var(--text-tertiary))] text-xs">@{entry.user.username}</p>
              </div>

              <div className="text-right">
                <div className="font-bold text-[rgb(var(--accent-secondary))] text-sm">
                  {entry.points.toLocaleString()}
                </div>
                <div className="text-[10px] text-[rgb(var(--text-tertiary))]">pts</div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-[rgb(var(--text-tertiary))]">
            <p className="text-sm font-medium">No one here yet!</p>
            {scopeFilter === "friends" && <p className="text-xs mt-1">Add friends to compete with them.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
