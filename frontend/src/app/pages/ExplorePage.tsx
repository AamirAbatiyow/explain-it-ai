import { useState, useEffect } from "react";
import { Search, TrendingUp, Sparkles, Zap, Brain, Rocket, Filter, Play } from "lucide-react";
import { motion } from "motion/react";
import { useVideos } from "../context/VideoContext";
import { VideoCard } from "../types";
import clsx from "clsx";

type CharactersApi = Record<string, { image?: string; reference_id?: string; color?: string }>;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ExplorePage() {
  const { videos } = useVideos();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"foryou" | "trending">("foryou");
  const [voices, setVoices] = useState<{ name: string; color: string }[]>([]);

  const trendingVideos = videos;

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data: CharactersApi) => {
        const names = shuffle(Object.keys(data));
        setVoices(names.map((name) => ({ name, color: data[name]?.color || "#666" })));
      })
      .catch(() => {});
  }, []);

  const categories = [
    { name: "Science", icon: "🔬", color: "from-blue-500 to-cyan-500" },
    { name: "Technology", icon: "💻", color: "from-purple-500 to-pink-500" },
    { name: "Astronomy", icon: "🌌", color: "from-indigo-500 to-blue-500" },
    { name: "Psychology", icon: "🧠", color: "from-pink-500 to-rose-500" },
    { name: "Finance", icon: "💰", color: "from-yellow-500 to-orange-500" },
    { name: "Medicine", icon: "⚕️", color: "from-green-500 to-emerald-500" },
    { name: "History", icon: "📜", color: "from-amber-500 to-orange-500" },
    { name: "Coding", icon: "👨‍💻", color: "from-slate-500 to-gray-500" },
  ];

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[rgb(var(--bg-primary))] pb-20">
      {/* Header */}
      <div className="pt-6 pb-2 px-6 sticky top-0 z-20 bg-[rgb(var(--bg-primary))]/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[rgb(var(--accent-secondary))]" />
            Explore
          </h1>
          
          {/* Toggle */}
          <div className="flex bg-[rgb(var(--bg-tertiary))] p-1 rounded-xl">
             <button
               onClick={() => setActiveTab("foryou")}
               className={clsx(
                 "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                 activeTab === "foryou" 
                   ? "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] shadow-sm" 
                   : "text-[rgb(var(--text-tertiary))]"
               )}
             >
               For You
             </button>
             <button
               onClick={() => setActiveTab("trending")}
               className={clsx(
                 "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                 activeTab === "trending" 
                   ? "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] shadow-sm" 
                   : "text-[rgb(var(--text-tertiary))]"
               )}
             >
               Trending
             </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search topics, shows, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgb(var(--bg-tertiary))] border-none rounded-2xl pl-12 pr-4 py-3 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-[rgb(var(--bg-secondary))] rounded-lg shadow-sm">
             <Filter className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-2">
        {/* Topic Filters */}
        <div>
          <h2 className="text-[rgb(var(--text-primary))] font-semibold mb-3 flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
            Browse Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.name}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )
                }
                className={clsx(
                  "px-4 py-2 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5",
                  selectedCategory === category.name
                    ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-md`
                    : "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border-color))]"
                )}
              >
                <span>{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Popular Voices */}
        <div>
          <h2 className="text-[rgb(var(--text-primary))] font-semibold mb-3 flex items-center gap-2 text-sm">
            <Rocket className="w-4 h-4 text-[rgb(var(--accent-secondary))]" />
            Popular Voices
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
            {voices.map((voice) => (
              <motion.div
                key={voice.name}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md transition-transform group-hover:-translate-y-1 relative overflow-hidden"
                  style={{ backgroundColor: voice.color }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <span className="relative z-10 text-white drop-shadow-md">{voice.name.charAt(0)}</span>
                </div>
                <span className="text-[rgb(var(--text-secondary))] text-[10px] font-semibold max-w-[64px] text-center leading-tight">
                  {voice.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div>
          <h2 className="text-[rgb(var(--text-primary))] font-semibold mb-3 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
            {activeTab === 'foryou' ? 'Recommended For You' : 'Trending Now'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {trendingVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[rgb(var(--bg-secondary))] rounded-xl overflow-hidden shadow-sm border border-[rgb(var(--border-color))]/50 group"
              >
                {/* Thumbnail */}
                <div className="aspect-[4/5] bg-gray-200 relative overflow-hidden">
                   {video.videoUrl ? (
                     <video
                       src={video.videoUrl}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       muted
                       loop
                       playsInline
                     />
                   ) : (
                     <img 
                       src={video.thumbnailUrl} 
                       alt={video.title}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                   
                   {/* Overlay Stats */}
                   <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                      <div className="flex items-center gap-1 text-white text-[10px] font-medium">
                        <Play className="w-3 h-3 fill-white" />
                        {formatCount(video.views)}
                      </div>
                      <div className="bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-bold">
                        {video.duration}
                      </div>
                   </div>

                   {/* Top Badge */}
                   {index < 3 && activeTab === 'trending' && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-white" />
                        #{index + 1}
                      </div>
                   )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="text-[rgb(var(--text-primary))] font-bold text-xs line-clamp-2 mb-1 leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-2">
                     <div 
                       className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] border border-gray-200"
                       style={{ backgroundColor: video.character.color }}
                     >
                       {video.character.avatar}
                     </div>
                     <span className="text-[rgb(var(--text-secondary))] text-[10px] truncate">
                       {video.character.name}
                     </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[rgb(var(--text-tertiary))]">
                     <span className="bg-[rgb(var(--bg-tertiary))] px-1.5 py-0.5 rounded text-[rgb(var(--text-secondary))] font-medium">
                       {video.category}
                     </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
