import { useState } from "react";
import { Search, Grid, List, Filter, Play, Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { mockVideos } from "../data/mockData";
import { VideoCard } from "../types";

export function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [savedVideos] = useState<VideoCard[]>(
    mockVideos.filter((v) => v.isSaved).slice(0, 6)
  );
  const [searchQuery, setSearchQuery] = useState("");

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-blue-900/10 to-black">
      {/* Header */}
      <div className="pt-6 pb-4 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Bookmark className="w-8 h-8 text-blue-400" />
              Library
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your saved videos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-gray-400"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-gray-400"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search saved videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["All", "Science", "Technology", "Astronomy", "Psychology", "Finance"].map(
            (tag) => (
              <button
                key={tag}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-gray-300 text-sm font-medium whitespace-nowrap transition-all"
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Saved Videos */}
      <div className="px-6 pb-6">
        {savedVideos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              No saved videos yet
            </h3>
            <p className="text-gray-400 text-sm">
              Videos you save will appear here
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {savedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              >
                <div className="aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center p-4">
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full">
                    <span className="text-lg">{video.character.avatar}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full">
                    <span className="text-white text-xs font-medium flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      {video.duration}
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed line-clamp-6 text-center">
                    {video.explanation}
                  </p>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatCount(video.views)} views</span>
                    <span>•</span>
                    <span>{video.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {savedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex gap-3"
              >
                <div className="w-24 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <p className="text-white text-xs leading-tight line-clamp-5 text-center">
                      {video.explanation.slice(0, 100)}...
                    </p>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                    <span className="text-sm">{video.character.avatar}</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                    <span className="text-white text-xs font-medium">
                      {video.duration}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base mb-1 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {video.explanation}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{video.character.name}</span>
                    <span>•</span>
                    <span>{formatCount(video.views)} views</span>
                    <span>•</span>
                    <span>{video.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}