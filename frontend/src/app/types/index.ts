export interface Comment {
  id: string;
  user: {
    username: string;
    avatar: string;
    color?: string;
  };
  text: string;
  likes: number;
  timestamp: string;
  isLiked?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface VideoCard {
  id: string;
  title: string;
  explanation: string;
  character: {
    name: string;
    avatar: string;
    color: string;
  };
  thumbnailUrl?: string;
  videoUrl?: string;
  showTheme?: {
    name: string;
    avatar: string;
    color: string;
    characters: string[];
  };
  category: string;
  likes: number;
  views: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
  duration: string;
  quiz?: QuizQuestion[];
  comments?: Comment[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  points: number;
  rank: number;
  badges: Badge[];
  watchTime: string;
  videosWatched: number;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  points: number;
  rank: number;
  isOnline: boolean;
  mutualFriends?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  points: number;
  videosWatched: number;
  isFriend?: boolean;
  isCurrentUser?: boolean;
}
