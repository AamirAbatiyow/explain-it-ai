/**
 * STRUCTURE TRACE:
 * VideoFeed = HomePage (this file) — renders the scrollable list of videos.
 * VideoCard = inline JSX inside videos.map() — no separate component; each card is the outer div + video container.
 * SideActions = inline JSX inside each card (div with Like/Comment/Save/Share/Quiz buttons) — no separate component.
 * QuizModal = separate component in ../components/QuizModal.tsx, rendered at bottom of HomePage.
 */
import { useState, useRef, useEffect } from "react";
import { Heart, Share2, Bookmark, MessageCircle, Play, Zap, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { VideoCard } from "../types/index";
import { useVideos } from "../context/VideoContext";
import { QuizModal } from "../components/QuizModal";
import { CommentsSheet } from "../components/CommentsSheet";
import clsx from "clsx";

export function HomePage() {
  const { videos, toggleLike, toggleSave } = useVideos();

  useEffect(() => {
    console.log("STRUCTURE TRACE INITIALIZED");
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [currentQuizVideo, setCurrentQuizVideo] = useState<VideoCard | null>(null);
  const [hasQuizByVideoId, setHasQuizByVideoId] = useState<Record<string, boolean>>({});

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [currentCommentsVideo, setCurrentCommentsVideo] = useState<VideoCard | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoRefsMap = useRef<Record<number, HTMLVideoElement | null>>({});
  const prevIndexRef = useRef(0);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Handle Scroll to update current index and pause previous video; clear quiz button when changing video
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const cardHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / cardHeight);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        const prev = currentIndex;
        const prevEl = videoRefsMap.current[prev];
        if (prevEl) prevEl.pause();
        prevIndexRef.current = prev;
        setCurrentIndex(newIndex);
        setProgress(0);
        setIsPlaying(true);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, videos]);

  const currentVideo = videos[currentIndex];
  const useNativeVideo = Boolean(currentVideo?.videoUrl);

  console.log("VideoFeed component rendered");
  console.log("VIDEOS FROM API (current state in HomePage):", videos);
  console.log("hasQuizByVideoId state:", hasQuizByVideoId);

  useEffect(() => {
    if (useNativeVideo && videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [currentIndex, isPlaying, useNativeVideo]);

  useEffect(() => {
    if (!isPlaying || quizModalOpen || commentsOpen) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }
    if (useNativeVideo) return;

    const duration = 10000; 
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval.current!);
          runVideoFinishRef.current(currentIndexRef.current);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentIndex, isPlaying, quizModalOpen, commentsOpen, useNativeVideo]);

  const fetchedQuizIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const next: Record<string, boolean> = {};
    videos.forEach((v) => {
      console.log("Quiz detection — video.quiz exists:", !!v?.quiz, "video id:", v?.id);
      if (v.quiz && v.quiz.length > 0) next[v.id] = true;
    });
    setHasQuizByVideoId((prev) => {
      const merged = { ...prev, ...next };
      return merged;
    });
    videos.forEach((video) => {
      if (video.quiz?.length) return;
      if (!video.videoUrl) return;
      const videoId = (video.id || "").replace(/\.[^.]+$/, "").trim();
      console.log("Checking quiz for videoId:", videoId, "video.id:", video.id);
      if (!videoId) return;
      if (fetchedQuizIdsRef.current.has(video.id)) return;
      fetchedQuizIdsRef.current.add(video.id);
      console.log("Fetching quiz for videoId:", videoId);
      fetch(`/api/quiz/${videoId}`)
        .then((res) => {
          console.log("Quiz fetch response status:", res.status, "videoId:", videoId);
          const hasQuiz = res.status === 200;
          setHasQuizByVideoId((prev) => ({ ...prev, [video.id]: hasQuiz }));
        })
        .catch((err) => {
          console.log("Quiz fetch error for videoId:", videoId, err);
          setHasQuizByVideoId((prev) => ({ ...prev, [video.id]: false }));
        });
    });
  }, [videos]);

  const runVideoFinishForIndex = async (index: number) => {
    if (index !== currentIndexRef.current) return;
    const video = videos[index];
    if (!video) return;
    videoRefsMap.current[index]?.pause();
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const runVideoFinishRef = useRef(runVideoFinishForIndex);
  runVideoFinishRef.current = runVideoFinishForIndex;

  const openQuizForVideo = async (video: VideoCard, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (video.quiz && video.quiz.length > 0) {
      setCurrentQuizVideo(video);
      setQuizModalOpen(true);
      return;
    }
    const videoId = video.id.replace(/\.[^.]+$/, "");
    if (!videoId) return;
    try {
      const res = await fetch(`/api/quiz/${videoId}`);
      if (!res.ok) return;
      const data = await res.json();
      const mappedQuiz = (data.questions || []).map(
        (q: { question: string; choices: string[]; correct_index: number }) => ({
          question: q.question,
          options: q.choices || [],
          correctAnswer: q.correct_index ?? 0,
          explanation: "",
        })
      );
      if (mappedQuiz.length > 0) {
        setCurrentQuizVideo({ ...video, quiz: mappedQuiz });
        setQuizModalOpen(true);
      }
    } catch {
      // no quiz for this video
    }
  };

  const togglePlay = () => {
    if (currentVideo?.videoUrl && videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
    setIsPlaying(!isPlaying);
  };

  const handleQuizComplete = (score: number) => {
    // Award points based on score
    const pointsEarned = Math.round((score / (currentQuizVideo?.quiz?.length || 1)) * 100);
    console.log(`Quiz completed! Earned ${pointsEarned} points`);
    setQuizModalOpen(false);
    setCurrentQuizVideo(null);
    // Optionally auto-scroll or continue
  };

  const handleComments = (video: VideoCard) => {
    setCurrentCommentsVideo(video);
    setCommentsOpen(true);
    // Optional: Pause video when opening comments
    // setIsPlaying(false); 
  };

  const handleShare = (video: VideoCard) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.explanation,
      }).catch(() => {});
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50">
         <p>No videos available.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory bg-[rgb(var(--bg-tertiary))] no-scrollbar"
    >
      {videos.map((video, index) => {
        console.log("VideoCard component rendered:", video);
        console.log("VIDEO BEING PASSED TO COMPONENT:", video);
        console.log("VIDEO ID:", video?.id);
        console.log("VIDEO FILENAME (videoUrl):", video?.videoUrl);
        return (
        <div
          key={video.id}
          className="h-full w-full snap-start snap-always flex items-center justify-center relative bg-[rgb(var(--bg-tertiary))]"
        >
          {/* Constrained Video Container for Desktop */}
          <div className="relative w-full h-full md:max-w-sm md:h-[95vh] md:max-h-[850px] bg-black overflow-hidden md:rounded-3xl shadow-2xl flex-shrink-0">
              {/* Video Content (Click to Play/Pause) */}
              <div className="absolute inset-0 z-0 bg-black cursor-pointer" onClick={togglePlay}>
                {video.videoUrl ? (
                  <video
                    ref={(el) => {
                      if (el) {
                        videoRefsMap.current[index] = el;
                        if (index === currentIndex) videoRef.current = el;
                      } else {
                        delete videoRefsMap.current[index];
                      }
                    }}
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={false}
                    onTimeUpdate={index === currentIndex ? () => {
                      const el = videoRef.current;
                      if (el && el.duration) setProgress((el.currentTime / el.duration) * 100);
                    } : undefined}
                    onEnded={() => runVideoFinishRef.current(index)}
                  />
                ) : (
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
                
                {/* Play/Pause Overlay - play icon when paused */}
                {!isPlaying && index === currentIndex && !commentsOpen && !quizModalOpen && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm transition-all">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                        <Play className="w-8 h-8 fill-white text-white ml-1" />
                      </div>
                    </div>
                )}
              </div>

              {/* Progress Bar */}
              {index === currentIndex && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[rgb(var(--gradient-from))] to-[rgb(var(--gradient-to))]"
                      style={{ width: `${progress}%` }}
                    />
                </div>
              )}

              {/* Character Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: index === currentIndex ? 1 : 0.5,
                  scale: index === currentIndex ? 1 : 0.8,
                }}
                className="absolute top-12 left-6 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10"
              >
                <span className="text-2xl">{video.character.avatar}</span>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-semibold leading-tight">
                    {video.character.name}
                  </span>
                  <span className="text-white/70 text-[10px] uppercase tracking-wider">{video.category}</span>
                </div>
              </motion.div>

              {/* Video Duration Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: index === currentIndex ? 1 : 0.5 }}
                className="absolute top-12 right-6 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
              >
                <span className="text-white text-sm font-medium flex items-center gap-1">
                  {isPlaying ? <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" /> : <Play className="w-3 h-3 fill-white" />}
                  {video.duration}
                </span>
              </motion.div>

              {/* Main Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10 pb-24 bg-transparent pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: index === currentIndex ? 1 : 0.6,
                    y: index === currentIndex ? 0 : 20,
                  }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white/20"
                      style={{ backgroundColor: video.showTheme?.color || video.character.color }}
                    >
                      {video.showTheme?.avatar || video.character.avatar}
                    </div>
                    <span className="text-white font-semibold text-sm drop-shadow-md">
                        {video.showTheme?.name || video.character.name}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg leading-tight">
                    {video.title}
                  </h2>
                  
                  <p className="text-base text-gray-100 leading-relaxed line-clamp-3 drop-shadow-md">
                    {video.explanation}
                  </p>
                </motion.div>
              </div>

              {/* Right Side Actions */}
              <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-6 pointer-events-auto">
                {/* Like Button */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleLike(video.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    animate={video.isLiked ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={clsx(
                      "p-3 rounded-full backdrop-blur-md border border-white/20 transition-colors",
                      video.isLiked ? "bg-red-500/20" : "bg-black/40"
                    )}
                  >
                    <Heart
                      className={clsx(
                        "w-7 h-7 stroke-[2]",
                        video.isLiked ? "fill-red-500 text-red-500" : "text-white"
                      )}
                    />
                  </motion.div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    {formatCount(video.likes)}
                  </span>
                </motion.button>

                {/* Comment Button */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleComments(video)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                    <MessageCircle className="w-7 h-7 text-white stroke-[2]" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    {formatCount(video.comments?.length || Math.floor(video.likes * 0.15))}
                  </span>
                </motion.button>

                {/* Save Button */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleSave(video.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    animate={video.isSaved ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={clsx(
                      "p-3 rounded-full backdrop-blur-md border border-white/20 transition-colors",
                      video.isSaved ? "bg-yellow-500/20" : "bg-black/40"
                    )}
                  >
                    <Bookmark
                      className={clsx(
                        "w-7 h-7 stroke-[2]",
                        video.isSaved ? "fill-yellow-500 text-yellow-500" : "text-white"
                      )}
                    />
                  </motion.div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    Save
                  </span>
                </motion.button>

                {/* Share Button */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleShare(video)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                    <Share2 className="w-7 h-7 text-white stroke-[2]" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    {formatCount(video.shares)}
                  </span>
                </motion.button>
              </div>

              {/* Take Quiz button at bottom of video container - only for videos with a quiz */}
              {hasQuizByVideoId[video.id] === true && (
                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => openQuizForVideo(video, e)}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-[rgb(var(--accent-primary))] border border-white/20 shadow-lg"
                  >
                    Take Quiz
                  </button>
                </div>
              )}
          </div>
        </div>
      );
      })}
      
      <QuizModal
        isOpen={quizModalOpen}
        video={currentQuizVideo}
        onClose={() => setQuizModalOpen(false)}
        onComplete={handleQuizComplete}
      />
      {/* QuizModal is a separate component; see STRUCTURE TRACE in QuizModal.tsx */}
      
      {/* Comments Sheet */}
      <CommentsSheet
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        video={currentCommentsVideo}
      />
    </div>
  );
}
