/**
 * STRUCTURE TRACE:
 * VideoProvider (this file) fetches from GET /api/videos and provides videos to the app.
 * HomePage consumes videos via useVideos(). Video feed list is rendered in HomePage.
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { VideoCard } from "../types/index";
import { mockVideos } from "../data/mockData";

function videosFromApi(filenames: string[]): VideoCard[] {
  return filenames.map((filename) => ({
    id: filename,
    title: filename.replace(/\.[^.]+$/, ""),
    explanation: "",
    character: { name: "AI", avatar: "🤖", color: "#8B5CF6" },
    category: "Education",
    likes: 0,
    views: 0,
    shares: 0,
    isLiked: false,
    isSaved: false,
    duration: "0:00",
    videoUrl: `/posted/${filename}`,
  }));
}

async function fetchVideosFromApi(): Promise<VideoCard[]> {
  const res = await fetch("/api/videos");
  if (!res.ok) {
    console.log("VIDEOS FROM API: fetch not ok", res.status);
    return [];
  }
  const filenames: string[] = await res.json();
  const videos = videosFromApi(filenames);
  console.log("VIDEOS FROM API:", videos);
  return videos;
}

interface VideoContextType {
  videos: VideoCard[];
  savedVideos: VideoCard[];
  addVideo: (video: VideoCard) => void;
  toggleSave: (videoId: string) => void;
  toggleLike: (videoId: string) => void;
  addComment: (videoId: string, text: string, user: { username: string; avatar: string }) => void;
  refreshVideos: () => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<VideoCard[]>(mockVideos || []);

  const refreshVideos = useCallback(async () => {
    try {
      const apiVideos = await fetchVideosFromApi();
      console.log("VIDEOS FROM API (setState):", apiVideos?.length, "videos");
      setVideos(apiVideos);
    } catch (e) {
      console.log("VIDEOS FROM API: fetch error", e);
      // keep current videos on network error
    }
  }, []);

  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  const addVideo = (video: VideoCard) => {
    // Add new video to the beginning of the list
    setVideos((prev) => [video, ...prev]);
  };

  const toggleSave = (videoId: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === videoId ? { ...video, isSaved: !video.isSaved } : video
      )
    );
  };

  const toggleLike = (videoId: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1,
            }
          : video
      )
    );
  };

  const addComment = (videoId: string, text: string, user: { username: string; avatar: string }) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) => {
        if (video.id === videoId) {
          const newComment = {
            id: Date.now().toString(),
            user,
            text,
            likes: 0,
            timestamp: "Just now",
          };
          return {
            ...video,
            comments: [newComment, ...(video.comments || [])],
          };
        }
        return video;
      })
    );
  };

  const savedVideos = videos.filter((video) => video.isSaved);

  return (
    <VideoContext.Provider value={{ videos, savedVideos, addVideo, toggleSave, toggleLike, addComment, refreshVideos }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideos must be used within a VideoProvider. Make sure VideoProvider wraps your application.");
  }
  return context;
}
