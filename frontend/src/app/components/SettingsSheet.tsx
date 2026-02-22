import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Bell, Shield, CircleHelp, ChevronRight, Save, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "account" | "notifications" | "privacy" | "help";
}

export function SettingsSheet({ isOpen, onClose, initialTab = "account" }: SettingsSheetProps) {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "privacy" | "help">(initialTab);
  
  // Account Form State
  const [username, setUsername] = useState(user?.username || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("Learning something new every day! 🚀");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      updateProfile({
        name: username,
        username: username,
        email: email,
        // Password would be updated here in a real app
      });
      setIsSaving(false);
      setSaveMessage("Profile updated successfully!");
      
      setTimeout(() => setSaveMessage(""), 3000);
    }, 1000);
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "help", label: "Help", icon: CircleHelp },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[rgb(var(--bg-primary))] rounded-t-3xl z-50 overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Handle Bar */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[rgb(var(--border-color))]">
              <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Settings</h2>
              <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--bg-secondary))] rounded-full transition-colors">
                <X className="w-6 h-6 text-[rgb(var(--text-secondary))]" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar (Desktop) / Top Bar (Mobile) */}
              <div className="w-full md:w-64 bg-[rgb(var(--bg-secondary))] flex md:flex-col overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-[rgb(var(--border-color))] shrink-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex items-center gap-3 px-6 py-4 md:w-full transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--accent-primary))] font-bold border-b-2 md:border-b-0 md:border-r-2 border-[rgb(var(--accent-primary))]"
                        : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]/50"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-[rgb(var(--bg-primary))]">
                {activeTab === "account" && (
                  <div className="max-w-md mx-auto space-y-6">
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4">Account Information</h3>
                    
                    <form onSubmit={handleSaveAccount} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Change password..."
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-color))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] resize-none h-24"
                        />
                      </div>

                      {saveMessage && (
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold text-center">
                          {saveMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3 bg-[rgb(var(--accent-primary))] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </form>

                    <div className="h-px bg-[rgb(var(--border-color))] my-6" />

                    <button 
                      onClick={logout}
                      className="w-full py-3 border border-red-500/30 text-red-500 rounded-xl font-bold hover:bg-red-500/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="max-w-md mx-auto space-y-6">
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4">Notification Preferences</h3>
                    
                    {[
                      "Daily Digest",
                      "New Quiz Alerts",
                      "Friend Activity",
                      "Leaderboard Updates",
                      "Achievement Unlocks"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-color))]">
                        <span className="font-medium text-[rgb(var(--text-primary))]">{item}</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={idx < 3} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent-primary))]"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "privacy" && (
                   <div className="max-w-md mx-auto space-y-6">
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4">Privacy & Security</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-color))]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[rgb(var(--text-primary))]">Public Profile</span>
                           <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent-primary))]"></div>
                          </div>
                        </div>
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">Allow others to find your profile and view your achievements.</p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-color))]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[rgb(var(--text-primary))]">Show Activity Status</span>
                           <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent-primary))]"></div>
                          </div>
                        </div>
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">Let friends see when you're online.</p>
                      </div>
                      
                      <button className="w-full py-3 text-[rgb(var(--accent-primary))] font-bold text-sm hover:underline text-left">
                        Manage Blocked Users
                      </button>
                      <button className="w-full py-3 text-[rgb(var(--accent-primary))] font-bold text-sm hover:underline text-left">
                        Data Download Request
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "help" && (
                   <div className="max-w-md mx-auto space-y-6">
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4">Help & Support</h3>
                    
                    <div className="space-y-3">
                      {["FAQs", "Contact Support", "Report a Bug", "Terms of Service", "Privacy Policy"].map((item, idx) => (
                        <button key={idx} className="w-full flex items-center justify-between p-4 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-color))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors text-left">
                          <span className="font-medium text-[rgb(var(--text-primary))]">{item}</span>
                          <ChevronRight className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <h4 className="font-bold text-blue-500 mb-2">Need more help?</h4>
                      <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
                        Our support team is available 24/7 to assist you with any issues.
                      </p>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">
                        Chat with Us
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
