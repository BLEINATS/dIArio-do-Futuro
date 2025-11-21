export type EntrySource = 'type' | 'voice' | 'scan' | 'audio_clip';
export type FontStyle = 'inter' | 'serif' | 'handwriting' | 'mono';
export type ThemeStyle = 'default' | 'nature' | 'cozy' | 'travel' | 'minimal' | 'patterns';

export interface Sticker {
  id: string;
  url: string; // Emoji or Image URL
  x: number;
  y: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  reminderTime?: string; // HH:MM format
}

export interface LocationConfig {
  name: string;
  address: string;
  condition: 'arrive' | 'leave';
  active: boolean;
}

export interface ImportantEvent {
  title: string;
  type: 'achievement' | 'memory' | 'milestone' | 'love' | 'family';
  icon: string; // Just a reference string for the UI to pick the icon
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  source: EntrySource;
  mood: string;
  tags: string[];
  images?: string[]; // Base64 strings
  audioUrl?: string; // Base64 audio data
  location?: string;
  locationReminders?: LocationConfig;
  importantEvent?: ImportantEvent; // New field for milestones
  font: FontStyle;
  theme: ThemeStyle;
  stickers?: Sticker[];
  tasks?: Task[]; 
  isFavorite?: boolean;
}

export interface SavedBook {
    id: string;
    title: string;
    content: string;
    genre: string;
    createdAt: number;
    coverImage?: string;
}

// Updated for SaaS
export type SubscriptionTier = 'free' | 'pro' | 'mystic';

export interface UserProgress {
  xp: number;
  level: number;
  subscriptionTier: SubscriptionTier; // Changed from boolean isPro
  subscriptionRenewsAt?: number;
  streak: number;
  entriesCount: number;
  joinedAt: number;
}

export interface UserProfile {
    name: string;
    email: string;
    avatar: string;
    birthday: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any; 
  color: string;
  progress: number;
  total: number;
  completed: boolean;
  xpReward: number;
}

export interface Reward {
    id: string;
    title: string;
    type: 'sticker_pack' | 'theme' | 'icon';
    imageUrl: string; 
    isUnlocked: boolean;
    requiredLevel: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  prompt: string;
  completed: boolean;
}

export interface BookConfig {
  genre: string;
  subGenre?: string;
  customGenre?: string;
  characters?: string;
  themes?: string;
  startDate?: string;
  endDate?: string;
  userGuidance?: string; 
}

export interface AppSettings {
    notifications: boolean;
    notificationTime: string;
    autoBackup: boolean;
    themeMode: 'light' | 'dark'; 
    fontStyle: FontStyle;
    fontSize: number;
    soundEnabled: boolean;
    soundType: 'rain' | 'forest' | 'cafe' | 'fire';
    isPinEnabled: boolean;
    pinCode: string | null;
    isBiometricsEnabled: boolean;
    zenMode: boolean;
}

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export interface SubscriptionPlan {
    id: SubscriptionTier;
    name: string;
    price: string;
    period: string;
    features: string[];
    highlight: boolean;
    color: string;
}
