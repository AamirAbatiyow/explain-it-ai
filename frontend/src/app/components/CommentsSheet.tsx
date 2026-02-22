import { useState, useRef, useEffect } from "react";
import { X, Send, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VideoCard } from "../types/index";
import { useVideos } from "../context/VideoContext";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoCard | null;
}

export function CommentsSheet({ isOpen, onClose, video }: CommentsSheetProps) {
  const { addComment } = useVideos();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !video || !user) return;

    // Adapt user data from AuthContext (which has name) to Comment user format (username, avatar)
    const commentUser = {
      username: (user as any).username || user.name.split(" ")[0].toLowerCase(),
      avatar: (user as any).avatar || "👤",
    };

    addComment(video.id, newComment, commentUser);
    setNewComment("");
    
    // Scroll to top to see new comment
    if (commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!video) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[rgb(var(--bg-secondary))] rounded-t-3xl shadow-2xl flex flex-col h-[70vh] md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-4 md:rounded-3xl border border-[rgb(var(--border-color))]"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }} // Only allow dragging down to close logic if implemented
            dragElastic={0.05}
            onDragEnd={(e, info) => {
                if (info.offset.y > 100) onClose();
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border-color))] flex-shrink-0">
              <div className="flex-1 text-center">
                <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg">
                  {video.comments?.length || 0} Comments
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] transition-colors absolute right-4"
              >
                <X className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              <div ref={commentsEndRef} /> {/* For scrolling to top/new comments */}
              
              {!video.comments || video.comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[rgb(var(--text-tertiary))] space-y-2">
                  <p className="text-4xl">💭</p>
                  <p>No comments yet. Be the first!</p>
                </div>
              ) : (
                video.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 items-start animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {comment.user.avatar}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[rgb(var(--text-secondary))] font-bold text-sm">
                          {comment.user.username}
                        </span>
                        <span className="text-[rgb(var(--text-tertiary))] text-xs">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-[rgb(var(--text-primary))] text-sm leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                    <button className="flex flex-col items-center gap-0.5 text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors group">
                       <Heart className="w-4 h-4 group-hover:fill-red-500" />
                       <span className="text-[10px]">{comment.likes}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-[rgb(var(--border-color))] bg-[rgb(var(--bg-secondary))] flex items-center gap-3 flex-shrink-0 pb-8 md:pb-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {(user as any)?.avatar || "👤"}
              </div>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-[rgb(var(--bg-tertiary))] border-none rounded-full px-4 py-2.5 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:outline-none pr-10 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className={clsx(
                    "absolute right-1.5 top-1.5 p-1.5 rounded-full transition-all",
                    newComment.trim()
                      ? "bg-[rgb(var(--accent-primary))] text-white hover:scale-105"
                      : "bg-transparent text-[rgb(var(--text-tertiary))]"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
