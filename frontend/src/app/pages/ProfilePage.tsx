import { useState } from "react";
import { Settings, UserPlus, Medal, Crown, Play, Bookmark, Grid, LogOut, Moon, Sun, User, Bell, Shield, CircleHelp, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { currentUser } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useVideos } from "../context/VideoContext";
import { SettingsSheet } from "../components/SettingsSheet";
import clsx from "clsx";

export function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { logout, user: authUser } = useAuth();
  const { videos, savedVideos } = useVideos();
  const [mockUser] = useState(currentUser);
  const [activeTab, setActiveTab] = useState<"generated" | "saved">("generated");
  const [showSettings, setShowSettings] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"account" | "notifications" | "privacy" | "help">("account");

  const user = {
    ...mockUser,
    displayName: authUser?.name || authUser?.username || mockUser.displayName,
    username: authUser?.username || mockUser.username,
    email: authUser?.email
  };

  // Filter videos that are created by "AI" (for demo purposes, we'll just show all non-saved ones or specific ones)
  // Since we don't have a "creator" field, let's assume all mock videos are "generated" if they aren't saved
  // Or better, let's just use the first few as generated.
  // Actually, let's just use all videos as generated for now, and savedVideos as saved.
  const generatedVideos = videos; 

  const menuItems = [
    { icon: User, label: "Account Settings", id: "account" as const },
    { icon: Bell, label: "Notifications", id: "notifications" as const },
    { icon: Shield, label: "Privacy", id: "privacy" as const },
    { icon: CircleHelp, label: "Help & Support", id: "help" as const },
  ];

  const handleOpenSettings = (tab: typeof settingsTab) => {
    setSettingsTab(tab);
    setIsSettingsSheetOpen(true);
    setShowSettings(false);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[rgb(var(--bg-primary))] pb-24 relative">
      <SettingsSheet 
        isOpen={isSettingsSheetOpen} 
        onClose={() => setIsSettingsSheetOpen(false)} 
        initialTab={settingsTab}
      />
      
      {/* Header */}
      <div className="relative pt-6 pb-6 px-6 bg-gradient-to-b from-[rgb(var(--gradient-from))]/10 to-transparent">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">My Profile</h1>
          <div className="flex items-center gap-2 relative">
            <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] shadow-sm active:scale-95 transition-transform"
                >
                  <Settings className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                </button>
                
                {/* Settings Dropdown */}
                <AnimatePresence>
                    {showSettings && (
                        <>
                        {/* Backdrop to close settings */}
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowSettings(false)}
                        />
                        <motion.div
                           initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                           animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                           exit={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                           className="absolute top-full right-0 mt-2 w-64 bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-xl border border-[rgb(var(--border-color))] z-50 overflow-hidden"
                        >
                            <div className="p-2 space-y-1">
                                {/* Appearance Toggle */}
                                <button
                                  onClick={toggleTheme}
                                  className="w-full px-4 py-3 flex items-center justify-between rounded-xl hover:bg-[rgb(var(--bg-tertiary))] transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        {theme === "dark" ? (
                                            <Moon className="w-5 h-5 text-indigo-400" />
                                        ) : (
                                            <Sun className="w-5 h-5 text-amber-500" />
                                        )}
                                        <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Appearance</span>
                                    </div>
                                    <div className="relative w-10 h-6 bg-[rgb(var(--bg-primary))] rounded-full border border-[rgb(var(--border-color))] group-hover:border-[rgb(var(--accent-primary))] transition-colors">
                                        <div className={clsx(
                                            "absolute top-1 left-1 w-3.5 h-3.5 rounded-full transition-all duration-300",
                                            theme === "dark" ? "bg-indigo-400 translate-x-4" : "bg-amber-500"
                                        )} />
                                    </div>
                                </button>

                                <div className="h-px bg-[rgb(var(--border-color))]/50 mx-2 my-1" />

                                {/* Standard Menu Items */}
                                {menuItems.map((item, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleOpenSettings(item.id)}
                                      className="w-full px-4 py-3 flex items-center justify-between rounded-xl hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 text-[rgb(var(--text-tertiary))]" />
                                            <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                                    </button>
                                ))}

                                <div className="h-px bg-[rgb(var(--border-color))]/50 mx-2 my-1" />

                                {/* Log Out */}
                                <button
                                  onClick={logout}
                                  className="w-full px-4 py-3 flex items-center gap-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-500"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-sm font-bold">Log Out</span>
                                </button>
                            </div>
                        </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] flex items-center justify-center text-5xl border-4 border-[rgb(var(--bg-primary))] shadow-lg">
              {user.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1.5 border-4 border-[rgb(var(--bg-primary))]">
              <Crown className="w-4 h-4 text-white fill-white" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{user.displayName}</h2>
            <p className="text-[rgb(var(--text-secondary))] text-sm mb-2">@{user.username}</p>
            <div className="flex items-center gap-4">
               <div className="text-center">
                 <div className="font-bold text-[rgb(var(--text-primary))]">{user.followers}</div>
                 <div className="text-[10px] text-[rgb(var(--text-tertiary))] uppercase font-bold tracking-wider">Followers</div>
               </div>
               <div className="w-px h-8 bg-[rgb(var(--border-color))]" />
               <div className="text-center">
                 <div className="font-bold text-[rgb(var(--text-primary))]">{user.following}</div>
                 <div className="text-[10px] text-[rgb(var(--text-tertiary))] uppercase font-bold tracking-wider">Following</div>
               </div>
               <div className="w-px h-8 bg-[rgb(var(--border-color))]" />
               <div className="text-center">
                 <div className="font-bold text-[rgb(var(--accent-secondary))]">{user.points}</div>
                 <div className="text-[10px] text-[rgb(var(--text-tertiary))] uppercase font-bold tracking-wider">Points</div>
               </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[rgb(var(--text-secondary))] text-sm mb-6 leading-relaxed">
          {user.bio}
        </p>

        {/* Tabs */}
        <div className="flex p-1 bg-[rgb(var(--bg-tertiary))] rounded-xl">
          <button
            onClick={() => setActiveTab("generated")}
            className={clsx(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === "generated"
                ? "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] shadow-sm"
                : "text-[rgb(var(--text-tertiary))]"
            )}
          >
            <Grid className="w-4 h-4" />
            Generated
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={clsx(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === "saved"
                ? "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] shadow-sm"
                : "text-[rgb(var(--text-tertiary))]"
            )}
          >
            <Bookmark className="w-4 h-4" />
            Saved
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-3"
          >
            {(activeTab === "generated" ? generatedVideos : savedVideos).map((video) => (
              <div 
                key={video.id}
                className="aspect-[4/5] bg-[rgb(var(--bg-secondary))] rounded-xl overflow-hidden relative group shadow-sm border border-[rgb(var(--border-color))]"
              >
                {video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                   <div className="text-white font-bold text-xs line-clamp-2 leading-tight mb-1">{video.title}</div>
                   <div className="flex items-center gap-1 text-[10px] text-white/80">
                     <Play className="w-3 h-3 fill-white" />
                     {video.views}
                   </div>
                </div>
                {activeTab === "generated" && (
                   <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-bold border border-white/20">
                     AI
                   </div>
                )}
              </div>
            ))}
            
            {/* Empty State Placeholder */}
            {((activeTab === "generated" && generatedVideos.length === 0) || (activeTab === "saved" && savedVideos.length === 0)) && (
               <div className="col-span-2 py-10 text-center text-[rgb(var(--text-tertiary))]">
                 No videos found.
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
