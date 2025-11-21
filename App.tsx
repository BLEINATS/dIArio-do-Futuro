import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DiaryEntry, UserProgress, IWindow, Achievement, Reward, DailyChallenge, FontStyle, ThemeStyle, BookConfig, Task, LocationConfig, ImportantEvent, SavedBook, AppSettings, SubscriptionPlan, SubscriptionTier, UserProfile } from './types';
import { refineText, scanImageToText, getDailyQuote, generateBookStory, generateDailyChallenge, generateTherapeuticQuestions, generateAbundanceMantra } from './services/geminiService';
import { 
  Home, Book, BarChart2, User, Plus, Search, Settings, Calendar as CalendarIcon, 
  Mic, Camera, X, ChevronRight, ChevronLeft, Zap, Lock, Smile, CloudRain, Sun, 
  Trash2, LogOut, Image as ImageIcon, Type, Palette, MapPin, Share2, Headphones,
  Award, Flame, Crown, PenTool, CheckCircle, ArrowRight, StickyNote, ArrowLeft,
  Bell, Clock, MessageSquare, Cloud, RefreshCw, Smartphone, Fingerprint, Shield, 
  Download, HelpCircle, CreditCard, Moon, Database, Tag, ScanText, Edit3, Printer, 
  FileText, Sparkles as SparklesIcon, CheckSquare, PlusCircle, Circle, Coins,
  Gift, Star, Target, Heart, Briefcase, Navigation, Flag, Trophy, Users, Gem,
  Wind, Frown, Meh, PartyPopper, CloudLightning, Feather, Compass, Skull, Search as SearchIcon,
  Library, Unlock, LayoutGrid, List, Info, Volume2, Upload, AlertTriangle, Eye, EyeOff, Scan, VolumeX,
  Check, Mail, Cake
} from 'lucide-react';

// Helper Icon wrapper
const Sparkles = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 9h4"/><path d="M3 5h4"/></svg>
);

// --- Constants & Data ---

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Iniciado',
        price: 'Grátis',
        period: 'por 7 dias',
        features: ['Diário Básico', 'Registro de Humor', '3 Fotos por dia', 'Sem Backup na Nuvem'],
        highlight: false,
        color: 'bg-gray-500'
    },
    {
        id: 'pro',
        name: 'Grimório',
        price: 'R$ 17,00',
        period: 'por mês',
        features: ['Tudo do Grátis', 'IA Terapeuta Ilimitada', 'Geração de Livros', 'Backup Automático', 'Sons de Ambiente', 'Temas Exclusivos'],
        highlight: true,
        color: 'bg-[#8B5CF6]'
    },
    {
        id: 'mystic',
        name: 'Arquimago',
        price: 'R$ 187,00',
        period: 'por ano',
        features: ['Tudo do Pro', '2 Meses Grátis', 'Badge Dourado no Perfil', 'Acesso Antecipado a Recursos'],
        highlight: false,
        color: 'bg-amber-500'
    }
];

// SOUND URLS FOR AMBIENCE
const SOUND_URLS = {
    rain: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
    forest: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
    cafe: 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-crowd-talking-ambience-440.mp3',
    fire: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3'
};

const MOODS = [
  { 
    id: 'terrible', 
    label: 'Difícil', 
    color: '#EF4444', // Red-500
    gradient: 'from-red-500 to-orange-600',
    reaction: "Respire fundo. Tempestades passam.",
    effect: 'shake',
    icon: <CloudLightning className="w-full h-full" strokeWidth={1.5} />
  },
  { 
    id: 'bad', 
    label: 'Triste', 
    color: '#60A5FA', // Blue-400
    gradient: 'from-blue-400 to-indigo-500',
    reaction: "Está tudo bem chorar. Limpa a alma.",
    effect: 'rain',
    icon: <CloudRain className="w-full h-full" strokeWidth={1.5} />
  },
  { 
    id: 'neutral', 
    label: 'Calmo', 
    color: '#A78BFA', // Purple-400
    gradient: 'from-indigo-400 to-purple-500',
    reaction: "A paz interior é um superpoder.",
    effect: 'breathe',
    icon: <Wind className="w-full h-full" strokeWidth={1.5} />
  },
  { 
    id: 'good', 
    label: 'Feliz', 
    color: '#FBBF24', // Amber-400
    gradient: 'from-amber-300 to-orange-400',
    reaction: "Que luz linda você emana hoje!",
    effect: 'confetti',
    icon: <Sun className="w-full h-full" strokeWidth={1.5} />
  },
  { 
    id: 'awesome', 
    label: 'Incrível', 
    color: '#10B981', // Emerald-500
    gradient: 'from-emerald-400 to-teal-500',
    reaction: "Uau! Você está imparável!",
    effect: 'stars',
    icon: <SparklesIcon className="w-full h-full" strokeWidth={1.5} />
  },
];

const TAGS = ['Trabalho', 'Pessoal', 'Ideia', 'Viagem', 'Saúde', 'Amor', 'Sonhos', 'Gratidão', 'Abundância'];

const EVENT_TYPES: {id: string, label: string, icon: any, color: string}[] = [
    { id: 'achievement', label: 'Conquista', icon: <Trophy className="w-4 h-4"/>, color: 'bg-yellow-500' },
    { id: 'milestone', label: 'Marco de Vida', icon: <Flag className="w-4 h-4"/>, color: 'bg-purple-500' },
    { id: 'love', label: 'Amor', icon: <Heart className="w-4 h-4"/>, color: 'bg-pink-500' },
    { id: 'memory', label: 'Memória', icon: <Star className="w-4 h-4"/>, color: 'bg-blue-500' },
];

const FONTS: {id: FontStyle, name: string, class: string}[] = [
  { id: 'inter', name: 'Moderna', class: 'font-sans' },
  { id: 'serif', name: 'Clássica', class: 'font-serif' },
  { id: 'handwriting', name: 'Manuscrita', class: 'font-[Caveat]' },
  { id: 'mono', name: 'Máquina', class: 'font-mono' },
];

const THEMES: {id: ThemeStyle, name: string, bg: string}[] = [
  { id: 'default', name: 'Padrão', bg: 'bg-[#13111C]' },
  { id: 'nature', name: 'Natureza', bg: 'bg-[#1a2e1a]' },
  { id: 'cozy', name: 'Aconchego', bg: 'bg-[#2e1a1a]' },
  { id: 'travel', name: 'Viagem', bg: 'bg-[#1a2e2e]' },
  { id: 'minimal', name: 'Minimal', bg: 'bg-[#000000]' },
];

const GENRE_DATA = {
    'Romance': {
        subgenres: ['Contemporâneo', 'Histórico', 'Drama'],
        image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=400&q=80',
        icon: <Heart className="w-5 h-5" />
    },
    'Aventura': {
        subgenres: ['Viagem', 'Sobrevivência', 'Exploração'],
        image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=400&q=80',
        icon: <Compass className="w-5 h-5" />
    },
    'Ficção': {
        subgenres: ['Científica', 'Fantasia', 'Distopia'],
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
        icon: <SparklesIcon className="w-5 h-5" />
    },
    'Mistério': {
        subgenres: ['Suspense', 'Policial', 'Noir'],
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
        icon: <SearchIcon className="w-5 h-5" />
    },
    'Pessoal': {
        subgenres: ['Biografia', 'Memórias', 'Reflexivo'],
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80',
        icon: <User className="w-5 h-5" />
    }
};

// UPDATED ONBOARDING STEPS TO REFLECT ALL FEATURES
const ONBOARDING_STEPS = [
  { 
      title: "Diário Mágico IA", 
      desc: "Mais que um diário. Um guardião de memórias com inteligência artificial e alma de papel.", 
      icon: <Book className="w-20 h-20 text-[#8B5CF6] drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"/> 
  },
  { 
      title: "Captura Multissensorial", 
      desc: "Escreva, dite por voz ou use o Scanner Mágico para digitalizar páginas de livros físicos instantaneamente.", 
      icon: <ScanText className="w-20 h-20 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]"/> 
  },
  { 
      title: "Santuário de Manifestação", 
      desc: "Ative a Lei da Atração. Complete rituais de abundância, gere mantras e visualize seu progresso no Círculo Dourado.", 
      icon: <Coins className="w-20 h-20 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"/> 
  },
  { 
      title: "Segurança Absoluta", 
      desc: "Seus segredos estão trancados. Proteja seu diário com PIN ou Biometria (Face ID) para total privacidade.", 
      icon: <Shield className="w-20 h-20 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"/> 
  },
  { 
      title: "De Memórias a Livros", 
      desc: "A IA transforma seus relatos em capítulos narrativos emocionantes. Construa sua própria biblioteca.", 
      icon: <Feather className="w-20 h-20 text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]"/> 
  },
  { 
      title: "Sua Jornada Épica", 
      desc: "Ganhe XP a cada escrita, suba de nível e desbloqueie conquistas e temas exclusivos.", 
      icon: <Crown className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"/> 
  },
];

const ABUNDANCE_EXERCISES = [
  { id: 'positive_aspects', title: 'Livro de Aspectos Positivos', desc: 'Escreva sobre o que você é grato hoje e aspectos positivos.', action: 'write', tag: 'Positividade' },
  { id: 'gratitude_list', title: 'A Lista da Gratidão', desc: 'Liste 10 coisas pelas quais você se sente grato.', action: 'write', tag: 'Gratidão' },
  { id: 'visualization', title: 'Visualização da Abundância', desc: 'Visualize-se vivendo em um estado de abundância.', action: 'check' },
  { id: 'declarations', title: 'Declarações de Prosperidade', desc: 'Repita afirmações como "Eu atraio prosperidade facilmente".', action: 'mantra' },
  { id: 'reframing', title: 'Reenquadramento Positivo', desc: 'Reenquadre um pensamento de escassez em oportunidade.', action: 'check' }
];

// Achievement Definitions
const ACHIEVEMENT_DEFINITIONS = [
    { id: 'first_entry', title: 'Primeira Entrada', description: 'Crie sua primeira entrada no diário', icon: <PenTool className="w-6 h-6"/>, xpReward: 50, target: 1 },
    { id: '7_days', title: 'Hábito de Ouro', description: 'Mantenha uma ofensiva de 7 dias', icon: <CalendarIcon className="w-6 h-6"/>, xpReward: 150, target: 7 },
    { id: 'first_book', title: 'Autor Iniciante', description: 'Salve seu primeiro livro na biblioteca', icon: <Book className="w-6 h-6"/>, xpReward: 500, target: 1 },
    { id: 'mood_master', title: 'Mestre das Emoções', description: 'Registre 10 humores diferentes', icon: <Smile className="w-6 h-6"/>, xpReward: 300, target: 10 },
    { id: 'abundance_init', title: 'Mente Próspera', description: 'Complete todos os rituais de abundância de um dia', icon: <Coins className="w-6 h-6"/>, xpReward: 100, target: 1 },
    { id: 'photo_memory', title: 'Álbum Vivo', description: 'Adicione 5 fotos ao diário', icon: <ImageIcon className="w-6 h-6"/>, xpReward: 100, target: 5 },
];

const MOCK_REWARDS: Reward[] = [
    { id: 'theme_nature', title: 'Tema "Natureza"', type: 'theme', imageUrl: '', isUnlocked: true, requiredLevel: 1 },
    { id: 'stickers_cosmic', title: 'Adesivos Cósmicos', type: 'sticker_pack', imageUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712555.png', isUnlocked: false, requiredLevel: 3 },
    { id: 'icon_writer', title: 'Ícone "Escritor"', type: 'icon', imageUrl: '', isUnlocked: false, requiredLevel: 5 },
    { id: 'stickers_vintage', title: 'Adesivos Vintage', type: 'sticker_pack', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2665/2665402.png', isUnlocked: false, requiredLevel: 8 },
];

const DEFAULT_SETTINGS: AppSettings = {
    notifications: true,
    notificationTime: '20:00',
    autoBackup: false,
    themeMode: 'dark',
    fontStyle: 'inter',
    fontSize: 16,
    soundEnabled: false,
    soundType: 'rain',
    isPinEnabled: false,
    pinCode: null,
    isBiometricsEnabled: false,
    zenMode: false
};

const DEFAULT_PROFILE: UserProfile = {
    name: 'Usuário Místico',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200',
    birthday: ''
};

const App: React.FC = () => {
  // --- Global State ---
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'diary' | 'book' | 'analytics' | 'profile'>('home');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({ xp: 0, level: 1, subscriptionTier: 'free', streak: 1, entriesCount: 0, joinedAt: Date.now() });
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [claimedAchievementIds, setClaimedAchievementIds] = useState<string[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLocked, setIsLocked] = useState(false); // Security Lock State
  const [pinInput, setPinInput] = useState('');
  
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Home State
  const [dailyMood, setDailyMood] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState("Carregando inspiração...");
  const [searchQuery, setSearchQuery] = useState('');
  // REPLACED: selectedTag with selectedHomeDate
  const [selectedHomeDate, setSelectedHomeDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  const [showTimelineOnly, setShowTimelineOnly] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMoodId, setCelebrationMoodId] = useState<string | null>(null);
  const [streakPulse, setStreakPulse] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Abundance State
  const [abundanceCompleted, setAbundanceCompleted] = useState<string[]>([]);
  const [showGoldReward, setShowGoldReward] = useState(false);
  const [activeMantra, setActiveMantra] = useState<string | null>(null);
  const [loadingMantra, setLoadingMantra] = useState(false);
  const [pendingAbundanceId, setPendingAbundanceId] = useState<string | null>(null);

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorId, setEditorId] = useState<string | null>(null);
  const [editorDate, setEditorDate] = useState<number | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [editorTasks, setEditorTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [editorMood, setEditorMood] = useState('neutral');
  const [editorFont, setEditorFont] = useState<FontStyle>('inter');
  const [editorTheme, setEditorTheme] = useState<ThemeStyle>('default');
  const [editorImages, setEditorImages] = useState<string[]>([]);
  const [editorFontSize, setEditorFontSize] = useState(18);
  const [editorTextColor, setEditorTextColor] = useState('#FFFFFF');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [editorLocationConfig, setEditorLocationConfig] = useState<LocationConfig>({ name: '', address: '', condition: 'arrive', active: false });
  const [editorEvent, setEditorEvent] = useState<ImportantEvent | undefined>(undefined);
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [showEditorHelp, setShowEditorHelp] = useState(false); // NEW: Help State

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Therapeutic Questions State
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Modals & Settings UI
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementTab, setAchievementTab] = useState<'achievements' | 'rewards'>('achievements');
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  
  // Functional Settings Modals
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  useEffect(() => {
    const storedOnboarding = localStorage.getItem('onboarding_complete');
    if (storedOnboarding) setHasSeenOnboarding(true);

    const storedEntries = localStorage.getItem('diary_entries');
    if (storedEntries) setEntries(JSON.parse(storedEntries));

    const storedBooks = localStorage.getItem('saved_books');
    if (storedBooks) setSavedBooks(JSON.parse(storedBooks));

    const storedProgress = localStorage.getItem('user_progress');
    if (storedProgress) setUserProgress(JSON.parse(storedProgress));
    
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));

    const storedClaimed = localStorage.getItem('claimed_achievements');
    if (storedClaimed) setClaimedAchievementIds(JSON.parse(storedClaimed));
    
    const storedSettings = localStorage.getItem('app_settings');
    if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        const validTheme = (parsed.themeMode === 'paper') ? 'light' : parsed.themeMode;
        setAppSettings({...DEFAULT_SETTINGS, ...parsed, themeMode: validTheme});
        
        if (parsed.isPinEnabled && parsed.pinCode) {
            setIsLocked(true);
        }
    }
    
    const todayKey = new Date().toLocaleDateString();
    const storedAbundance = localStorage.getItem(`abundance_${todayKey}`);
    if (storedAbundance) setAbundanceCompleted(JSON.parse(storedAbundance));
    
    // Initialize week start to Sunday of current week
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const sunday = new Date(now.setDate(diff));
    setCurrentWeekStart(sunday);

    loadDailyEssentials();
  }, []);

  useEffect(() => {
    localStorage.setItem('diary_entries', JSON.stringify(entries));
    localStorage.setItem('saved_books', JSON.stringify(savedBooks));
    localStorage.setItem('user_progress', JSON.stringify({ ...userProgress, entriesCount: entries.length }));
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
    localStorage.setItem('claimed_achievements', JSON.stringify(claimedAchievementIds));
    localStorage.setItem('app_settings', JSON.stringify(appSettings));
  }, [entries, userProgress, savedBooks, claimedAchievementIds, appSettings, userProfile]);
  
  useEffect(() => {
      document.documentElement.style.fontSize = `${appSettings.fontSize}px`;
  }, [appSettings.fontSize]);

  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const playAudio = async () => {
          try {
              if (appSettings.soundEnabled) {
                  const newSrc = SOUND_URLS[appSettings.soundType];
                  if (audio.src !== newSrc) {
                      audio.src = newSrc;
                      audio.load(); 
                  }
                  audio.volume = 0.5; 
                  await audio.play();
              } else {
                  audio.pause();
              }
          } catch (err) {
              console.log("Autoplay prevented. Interaction needed.", err);
          }
      };

      playAudio();
  }, [appSettings.soundEnabled, appSettings.soundType]);

  useEffect(() => {
      const todayKey = new Date().toLocaleDateString();
      localStorage.setItem(`abundance_${todayKey}`, JSON.stringify(abundanceCompleted));
      
      if (abundanceCompleted.length === ABUNDANCE_EXERCISES.length && !showGoldReward) {
          setShowGoldReward(true);
          setTimeout(() => setShowGoldReward(false), 4000);
          addXp(100); 
      }
  }, [abundanceCompleted]);

  const addXp = (amount: number) => {
      setUserProgress(prev => {
          const newXp = prev.xp + amount;
          const newLevel = Math.floor(newXp / 1000) + 1;
          
          if (newLevel > prev.level) {
              setShowLevelUp(true);
              setTimeout(() => setShowLevelUp(false), 3000);
          }
          
          return {
              ...prev,
              xp: newXp,
              level: newLevel
          };
      });
  };

  useEffect(() => {
      const checkAchievements = () => {
          ACHIEVEMENT_DEFINITIONS.forEach(ach => {
              if (claimedAchievementIds.includes(ach.id)) return;

              let isMet = false;
              switch(ach.id) {
                  case 'first_entry':
                      isMet = entries.length >= ach.target;
                      break;
                  case '7_days':
                      isMet = userProgress.streak >= ach.target;
                      break;
                  case 'first_book':
                      isMet = savedBooks.length >= ach.target;
                      break;
                  case 'mood_master':
                      isMet = entries.filter(e => e.mood).length >= ach.target;
                      break;
                  case 'abundance_init':
                      isMet = abundanceCompleted.length >= ABUNDANCE_EXERCISES.length;
                      break;
                  case 'photo_memory':
                      isMet = entries.filter(e => e.images && e.images.length > 0).length >= ach.target;
                      break;
              }

              if (isMet) {
                  setClaimedAchievementIds(prev => [...prev, ach.id]);
                  addXp(ach.xpReward);
                  setAchievementNotification(ach.title);
                  setTimeout(() => setAchievementNotification(null), 4000);
              }
          });
      };

      checkAchievements();
  }, [entries, userProgress.streak, savedBooks, abundanceCompleted]);

  const achievementsList = useMemo(() => {
      return ACHIEVEMENT_DEFINITIONS.map(def => {
          let currentProgress = 0;
          switch(def.id) {
              case 'first_entry': currentProgress = entries.length; break;
              case '7_days': currentProgress = userProgress.streak; break;
              case 'first_book': currentProgress = savedBooks.length; break;
              case 'mood_master': currentProgress = entries.filter(e => e.mood).length; break;
              case 'abundance_init': currentProgress = abundanceCompleted.length >= ABUNDANCE_EXERCISES.length ? 1 : 0; break;
              case 'photo_memory': currentProgress = entries.filter(e => e.images && e.images.length > 0).length; break;
          }
          currentProgress = Math.min(currentProgress, def.target);
          
          return {
              ...def,
              progress: currentProgress,
              total: def.target,
              completed: claimedAchievementIds.includes(def.id),
              color: claimedAchievementIds.includes(def.id) ? 'text-yellow-500 bg-yellow-500/20' : 'text-gray-500 bg-gray-500/20'
          };
      });
  }, [entries, userProgress.streak, savedBooks, abundanceCompleted, claimedAchievementIds]);


  const loadDailyEssentials = async () => {
    try {
        const [challenge, quote] = await Promise.allSettled([
            generateDailyChallenge(),
            getDailyQuote('gratidão')
        ]);

        setDailyChallenge({
          id: new Date().toISOString().split('T')[0],
          date: new Date().toISOString(),
          prompt: challenge.status === 'fulfilled' ? challenge.value : "Qual foi o melhor momento do seu dia?",
          completed: false
        });
        
        setDailyQuote(quote.status === 'fulfilled' ? quote.value : "A gratidão transforma o que temos em suficiente.");
    } catch (error) {
        console.error("Erro ao carregar essenciais:", error);
        setDailyQuote("A gratidão transforma o que temos em suficiente.");
    }
  };

  // --- Logic ---

  const getFilteredEntries = () => {
    return entries.filter(entry => {
      const matchesSearch = (entry.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             entry.title.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by Selected Date in Calendar Strip
      const entryDate = new Date(entry.createdAt);
      const isSameDate = entryDate.toDateString() === selectedHomeDate.toDateString();

      const matchesTimeline = showTimelineOnly ? !!entry.importantEvent : true;
      
      // If searching, ignore date filter. If not searching, apply date filter.
      if (searchQuery) {
          return matchesSearch && matchesTimeline;
      }
      return isSameDate && matchesTimeline;
    });
  };

  const handleSaveEntry = () => {
    if (!editorContent.trim() && editorImages.length === 0 && editorTasks.length === 0) return;

    const newEntry: DiaryEntry = {
      id: editorId || Date.now().toString(),
      title: editorTitle || 'Sem título',
      content: editorContent,
      createdAt: editorId ? entries.find(e => e.id === editorId)!.createdAt : (editorDate || Date.now()),
      source: 'type',
      mood: editorMood,
      tags: editorTags.length > 0 ? editorTags : ['Geral'],
      font: editorFont,
      theme: editorTheme,
      images: editorImages,
      tasks: editorTasks,
      locationReminders: editorLocationConfig.active ? editorLocationConfig : undefined,
      importantEvent: editorEvent
    };

    if (editorId) {
        setEntries(entries.map(e => e.id === editorId ? newEntry : e));
    } else {
        setEntries([newEntry, ...entries]);
        addXp(50);
    }

    if (pendingAbundanceId) {
        handleAbundanceCheck(pendingAbundanceId);
        setPendingAbundanceId(null);
        setCelebrationMoodId('awesome');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
    }

    if (editorTags.includes('Desafio') && dailyChallenge && !dailyChallenge.completed) {
        setDailyChallenge({...dailyChallenge, completed: true});
        addXp(20);
    }

    resetEditor();
    setIsEditorOpen(false);
  };

  const resetEditor = () => {
    setEditorId(null);
    setEditorDate(null);
    setEditorTitle('');
    setEditorContent('');
    setEditorTags([]);
    setEditorTasks([]);
    setNewTaskText('');
    setNewTaskTime('');
    setEditorImages([]);
    setEditorMood('neutral');
    setEditorFont('inter');
    setEditorTheme('default');
    setEditorFontSize(18);
    setEditorTextColor('#FFFFFF');
    setAiQuestions([]);
    setEditorLocationConfig({ name: '', address: '', condition: 'arrive', active: false });
    setEditorEvent(undefined);
    setPendingAbundanceId(null);
    setShowEditorHelp(false);
  };

  const toggleEditorTag = (tag: string) => {
      setEditorTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      reminderTime: newTaskTime || undefined
    };
    setEditorTasks([...editorTasks, newTask]);
    setNewTaskText('');
    setNewTaskTime('');
  };

  const toggleTask = (taskId: string) => {
    setEditorTasks(prev => prev.map(t => t.id === taskId ? {...t, completed: !t.completed} : t));
  };

  const deleteTask = (taskId: string) => {
    setEditorTasks(prev => prev.filter(t => t.id !== taskId));
  };
  
  const openEditorForAbundance = (title: string, tag: string, prompt: string, id: string) => {
      resetEditor();
      setEditorTitle(title);
      setEditorTags(['Abundância', tag]);
      setEditorContent(prompt + "\n\n");
      setPendingAbundanceId(id);
      setIsEditorOpen(true);
  };
  
  const handleAbundanceCheck = (id: string) => {
      setAbundanceCompleted(prev => {
          if(prev.includes(id)) return prev;
          return [...prev, id];
      });
  };
  
  const handleMoodChange = async (moodId: string) => {
      setEditorMood(moodId);
      setIsGeneratingQuestions(true);
      const moodObj = MOODS.find(m => m.id === moodId);
      const questions = await generateTherapeuticQuestions(moodObj?.label || "Neutro");
      setAiQuestions(questions);
      setIsGeneratingQuestions(false);
  };

  const handleHomeMoodSelect = (moodId: string) => {
      if (dailyMood === moodId) return; 
      
      setDailyMood(moodId);
      setCelebrationMoodId(moodId);
      const moodObj = MOODS.find(m => m.id === moodId);
      
      if(moodObj) {
        setDailyQuote("Conectando...");
        getDailyQuote(moodObj.label).then(setDailyQuote);
      }
      
      setShowCelebration(true);
      setStreakPulse(true);
      
      addXp(10); 

      setTimeout(() => {
          setShowCelebration(false);
          setStreakPulse(false);
      }, 3500);
  };

  const refreshQuestions = async () => {
      setIsGeneratingQuestions(true);
      const moodObj = MOODS.find(m => m.id === editorMood);
      const questions = await generateTherapeuticQuestions(moodObj?.label || "Neutro");
      setAiQuestions(questions);
      setIsGeneratingQuestions(false);
  };

  const insertQuestion = (q: string) => {
      const cleanQ = q.replace(/^.*?\s/, '');
      setEditorContent(prev => (prev ? prev + "\n\n" : "") + q + "\n");
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
      const selectedDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
      const existingEntry = entries.find(e => {
          const eDate = new Date(e.createdAt);
          return eDate.getDate() === day && 
                 eDate.getMonth() === selectedDate.getMonth() && 
                 eDate.getFullYear() === selectedDate.getFullYear();
      });

      if (existingEntry) {
          setEditorId(existingEntry.id);
          setEditorTitle(existingEntry.title);
          setEditorContent(existingEntry.content);
          setEditorTags(existingEntry.tags);
          setEditorTasks(existingEntry.tasks || []);
          setEditorFont(existingEntry.font);
          setEditorTheme(existingEntry.theme);
          setEditorImages(existingEntry.images || []);
          setEditorMood(existingEntry.mood);
          setEditorLocationConfig(existingEntry.locationReminders || { name: '', address: '', condition: 'arrive', active: false });
          setEditorEvent(existingEntry.importantEvent);
          setIsEditorOpen(true);
          setIsCalendarOpen(false);
      } else {
          resetEditor();
          setEditorDate(selectedDate.getTime());
          setIsEditorOpen(true);
          setIsCalendarOpen(false);
      }
  };

  // --- Weekly Strip Logic ---
  const getWeekDays = () => {
      const days = [];
      for (let i = 0; i < 7; i++) {
          const d = new Date(currentWeekStart);
          d.setDate(currentWeekStart.getDate() + i);
          days.push(d);
      }
      return days;
  };

  const nextWeek = () => {
      const next = new Date(currentWeekStart);
      next.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(next);
  };

  const prevWeek = () => {
      const prev = new Date(currentWeekStart);
      prev.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(prev);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditorImages(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUserProfile(prev => ({...prev, avatar: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
  };
  
  const handleCameraPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment'); 
    input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditorImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
  };

  const handleOCR = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if(file) {
            setIsProcessing(true);
            try {
                const text = await scanImageToText(file);
                setEditorContent(prev => prev + "\n" + text);
            } catch(err) { alert("Erro ao escanear"); }
            setIsProcessing(false);
        }
    };
    input.click();
  };

  // --- Speech to Text ---
  const handleSpeechToText = () => {
    const SpeechRecognition = (window as unknown as IWindow).SpeechRecognition || (window as unknown as IWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsProcessing(true);
        const refined = await refineText(transcript);
        setEditorContent(prev => prev + " " + refined);
        setIsProcessing(false);
    };

    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  // --- Settings Handlers ---
  const handleThemeChange = (mode: 'light' | 'dark') => {
    setAppSettings(prev => ({...prev, themeMode: mode}));
  };

  const handleExportData = () => {
      // Feature Gate: Backup is Pro only
      if (userProgress.subscriptionTier === 'free') {
          setShowSubscriptionModal(true);
          return;
      }

      const data = {
          entries,
          userProgress,
          savedBooks,
          appSettings,
          claimedAchievementIds,
          abundanceCompleted,
          userProfile
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diario_magico_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Feature Gate
      if (userProgress.subscriptionTier === 'free') {
          setShowSubscriptionModal(true);
          return;
      }

      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.entries) setEntries(data.entries);
              if (data.userProgress) setUserProgress(data.userProgress);
              if (data.savedBooks) setSavedBooks(data.savedBooks);
              if (data.appSettings) setAppSettings(data.appSettings);
              if (data.claimedAchievementIds) setClaimedAchievementIds(data.claimedAchievementIds);
              if (data.abundanceCompleted) setAbundanceCompleted(data.abundanceCompleted);
              if (data.userProfile) setUserProfile(data.userProfile);
              alert("Backup restaurado com sucesso!");
          } catch (err) {
              alert("Erro ao ler arquivo de backup.");
          }
      };
      reader.readAsText(file);
  };

  const handleWipeData = () => {
      localStorage.clear();
      window.location.reload();
  };

  const handlePinSetup = () => {
      if (newPin.length === 4 && newPin === confirmPin) {
          setAppSettings(prev => ({...prev, isPinEnabled: true, pinCode: newPin}));
          setShowPinSetup(false);
          setNewPin('');
          setConfirmPin('');
          alert("Bloqueio ativado com sucesso!");
      } else {
          alert("Os PINs não coincidem ou não têm 4 dígitos.");
      }
  };

  const handleUnlock = () => {
      if (pinInput === appSettings.pinCode) {
          setIsLocked(false);
          setPinInput('');
      } else {
          alert("PIN incorreto.");
          setPinInput('');
      }
  };
  
  const handleBiometricSetup = async () => {
      if (!window.PublicKeyCredential) {
          alert("Seu dispositivo não suporta autenticação biométrica.");
          return;
      }

      try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          
          await navigator.credentials.create({
              publicKey: {
                  challenge,
                  rp: { name: "Diário Mágico" },
                  user: {
                      id: new Uint8Array(16),
                      name: "user@diario",
                      displayName: "Usuário Mágico"
                  },
                  pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                  authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                  timeout: 60000,
                  attestation: "direct"
              }
          });
          
          setAppSettings(prev => ({...prev, isBiometricsEnabled: true}));
          alert("Biometria configurada com sucesso!");
      } catch (e) {
          console.error(e);
          alert("Falha ao configurar biometria. Verifique se você tem Face ID/Touch ID configurado no dispositivo.");
      }
  };

  const handleBiometricUnlock = async () => {
      try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          
          await navigator.credentials.get({
              publicKey: {
                  challenge,
                  userVerification: "required",
                  timeout: 60000
              }
          });
          
          setIsLocked(false);
          setPinInput('');
      } catch (e) {
          console.error(e);
          alert("Autenticação falhou.");
      }
  };
  
  const handleMantraGeneration = async () => {
      setLoadingMantra(true);
      const mantra = await generateAbundanceMantra();
      setActiveMantra(mantra);
      setLoadingMantra(false);
  };

  // --- Subscription Logic ---
  const handleSubscribe = (planId: SubscriptionTier) => {
      // Simulate payment processing
      setTimeout(() => {
          setUserProgress(prev => ({...prev, subscriptionTier: planId}));
          setShowSubscriptionModal(false);
          setCelebrationMoodId('awesome'); // Trigger confetti
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
          alert(`Parabéns! Você agora é ${planId === 'mystic' ? 'Arquimago' : (planId === 'pro' ? 'Grimório' : 'Iniciado')}.`);
      }, 1000);
  };

  const handleLogout = () => {
      if (confirm("Deseja sair e voltar para a tela de boas-vindas?")) {
          setIsLocked(false);
          setHasSeenOnboarding(false);
          localStorage.removeItem('onboarding_complete');
          setActiveTab('home');
      }
  };

  // ... (Sub-components Onboarding, BookCreator, PIN Lock remain unchanged) ...
  const Onboarding = () => {
    const [step, setStep] = useState(0);

    const nextStep = () => {
      if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
      else {
        localStorage.setItem('onboarding_complete', 'true');
        setHasSeenOnboarding(true);
        // Re-enable lock if pin is set, so they have to enter it after "logging in" via onboarding
        if (appSettings.isPinEnabled && appSettings.pinCode) {
            setIsLocked(true);
        }
      }
    };
    
    const skipOnboarding = () => {
        localStorage.setItem('onboarding_complete', 'true');
        setHasSeenOnboarding(true);
        if (appSettings.isPinEnabled && appSettings.pinCode) {
            setIsLocked(true);
        }
    };

    return (
      <div className="fixed inset-0 z-[100] bg-[#13111C] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 to-[#13111C]"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#13111C] to-transparent"></div>

        <div className="relative z-10 flex flex-col items-center max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10 animate-float">
                {ONBOARDING_STEPS[step].icon}
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-white leading-tight">
                {ONBOARDING_STEPS[step].title}
            </h1>
            
            <p className="text-gray-300 mb-12 text-lg leading-relaxed">
                {ONBOARDING_STEPS[step].desc}
            </p>
            
            <div className="flex gap-3 mb-12">
              {ONBOARDING_STEPS.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]' : 'w-2 bg-white/20'}`} />
              ))}
            </div>
            
            <button 
                onClick={nextStep} 
                className="w-full py-4 bg-gradient-to-r from-[#8B5CF6] to-indigo-600 rounded-2xl font-bold text-white shadow-xl shadow-purple-900/40 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {step === ONBOARDING_STEPS.length - 1 ? (
                  <>Começar Jornada <SparklesIcon className="w-5 h-5"/></>
              ) : (
                  <>Próximo <ChevronRight className="w-5 h-5"/></>
              )}
            </button>
            
            {step < ONBOARDING_STEPS.length - 1 && (
                <button onClick={skipOnboarding} className="mt-6 text-sm text-gray-500 hover:text-white transition-colors">
                    Pular Introdução
                </button>
            )}
        </div>
      </div>
    );
  };
  
  const BookCreator = () => {
      const [step, setStep] = useState(0);
      const [bookConfig, setBookConfig] = useState<BookConfig>({ genre: 'Romance' });
      const [isGenerating, setIsGenerating] = useState(false);
      const [generatedBook, setGeneratedBook] = useState<{title: string, content: string} | null>(null);
      
      const steps = ['Essência', 'Detalhes', 'Magia'];

      const handleGenerate = async () => {
          if (userProgress.subscriptionTier === 'free' && savedBooks.length >= 1) {
              setShowSubscriptionModal(true);
              return;
          }

          setStep(2);
          setIsGenerating(true);
          
          let filteredEntries = entries;
          if (bookConfig.startDate && bookConfig.endDate) {
              const start = new Date(bookConfig.startDate).getTime();
              const end = new Date(bookConfig.endDate).getTime();
              filteredEntries = entries.filter(e => e.createdAt >= start && e.createdAt <= end);
          }

          const sortedEntries = filteredEntries.sort((a, b) => a.createdAt - b.createdAt).map(e => `[Data: ${new Date(e.createdAt).toLocaleDateString()}] ${e.content}`);
          
          if (sortedEntries.length === 0) {
              alert("Nenhuma entrada encontrada para o período selecionado.");
              setIsGenerating(false);
              setStep(0);
              return;
          }

          const result = await generateBookStory(sortedEntries, bookConfig);
          setGeneratedBook(result);
          setIsGenerating(false);
      };

      const handleSaveBook = () => {
          if (!generatedBook) return;
          const newBook: SavedBook = {
              id: Date.now().toString(),
              title: generatedBook.title,
              content: generatedBook.content,
              genre: bookConfig.genre,
              createdAt: Date.now(),
              coverImage: GENRE_DATA[bookConfig.genre as keyof typeof GENRE_DATA]?.image
          };
          setSavedBooks([newBook, ...savedBooks]);
          setGeneratedBook(null);
          setStep(0);
          addXp(500); 
          alert("Livro salvo na sua biblioteca!");
      };
      
      const isDark = appSettings.themeMode === 'dark';

      return (
          <div className={`flex flex-col h-full ${isDark ? 'bg-[#13111C] text-white' : 'bg-[#FAFAF9] text-gray-900'} font-book transition-colors duration-500`}>
              {!generatedBook ? (
                  <>
                      <div className="px-8 pt-10 pb-6">
                          <h1 className="text-4xl font-light italic mb-2">Atelier Literário</h1>
                          <p className={`text-sm font-sans font-light tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transforme memórias em arte.</p>
                      </div>

                      <div className="px-8 mb-8">
                          <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-sans mb-2 text-gray-400">
                              {steps.map((s, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => setStep(i)}
                                    className={`${step >= i ? (isDark ? 'text-white' : 'text-black') : ''} transition-colors duration-500 hover:text-purple-400 outline-none`}
                                  >
                                      {s}
                                  </button>
                              ))}
                          </div>
                          <div className="h-[1px] w-full bg-gray-200/20 relative">
                              <div className="absolute top-0 left-0 h-full bg-purple-400 transition-all duration-700 ease-out" style={{width: `${((step + 1) / 3) * 100}%`}}></div>
                          </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto px-8 pb-24">
                          {step === 0 && (
                              <div className="space-y-10 animate-in fade-in duration-700">
                                  {savedBooks.length > 0 && (
                                      <div className="mb-8">
                                          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 font-sans flex items-center gap-2">
                                              <Library className="w-3 h-3"/> Minha Biblioteca
                                          </h3>
                                          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                                              {savedBooks.map(book => (
                                                  <div key={book.id} onClick={() => setGeneratedBook({title: book.title, content: book.content})} className="flex-shrink-0 w-32 group cursor-pointer">
                                                      <div className="aspect-[2/3] rounded-lg bg-gray-800 relative overflow-hidden mb-2 shadow-lg group-hover:scale-105 transition-transform">
                                                          <img src={book.coverImage} className="w-full h-full object-cover opacity-60" />
                                                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                                              <span className="text-white font-book italic text-sm leading-tight">{book.title}</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {userProgress.subscriptionTier === 'free' && savedBooks.length >= 1 && (
                                      <div onClick={() => setShowSubscriptionModal(true)} className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 flex items-center justify-between cursor-pointer hover:border-purple-500 transition-colors">
                                          <div className="flex items-center gap-3">
                                              <Lock className="w-5 h-5 text-purple-400"/>
                                              <div>
                                                  <p className="text-sm font-bold text-white">Limite de Livros Atingido</p>
                                                  <p className="text-[10px] text-gray-400">Assine o Grimório para criar livros ilimitados.</p>
                                              </div>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-purple-400"/>
                                      </div>
                                  )}

                                  <div className="group">
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-4 font-sans">Período da Narrativa</label>
                                      <div className="flex gap-8 items-center">
                                          <div className="flex-1 border-b border-gray-200/20 pb-2 group-focus-within:border-purple-400/50 transition-colors">
                                              <input type="date" className="w-full bg-transparent outline-none font-light text-lg font-sans text-gray-500" onChange={(e) => setBookConfig({...bookConfig, startDate: e.target.value})} />
                                          </div>
                                          <span className="text-gray-300 font-light">&mdash;</span>
                                          <div className="flex-1 border-b border-gray-200/20 pb-2 group-focus-within:border-purple-400/50 transition-colors">
                                              <input type="date" className="w-full bg-transparent outline-none font-light text-lg font-sans text-gray-500" onChange={(e) => setBookConfig({...bookConfig, endDate: e.target.value})} />
                                          </div>
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-6 font-sans">Gênero Literário</label>
                                      <div className="grid grid-cols-2 gap-4">
                                          {Object.entries(GENRE_DATA).map(([key, data]) => (
                                              <button 
                                                  key={key} 
                                                  onClick={() => setBookConfig({...bookConfig, genre: key, subGenre: data.subgenres[0]})}
                                                  className={`
                                                    relative overflow-hidden rounded-xl aspect-[3/4] group transition-all duration-500 border-2
                                                    ${bookConfig.genre === key 
                                                        ? 'border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-[1.02]' 
                                                        : 'border-transparent hover:border-white/20'}
                                                  `}
                                              >
                                                  <img src={data.image} alt={key} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                  <div className={`absolute inset-0 bg-gradient-to-t ${bookConfig.genre === key ? 'from-[#8B5CF6]/90 via-black/40' : 'from-black/90 via-black/20'} to-transparent`}></div>
                                                  <div className="absolute bottom-0 left-0 w-full p-4 text-left">
                                                      <div className={`mb-2 transition-transform duration-300 ${bookConfig.genre === key ? 'text-white scale-110 origin-left' : 'text-white/80'}`}>
                                                          {data.icon}
                                                      </div>
                                                      <span className="block text-xl font-light italic text-white mb-1">{key}</span>
                                                      <span className="text-[10px] font-sans uppercase tracking-wider text-white/60 block">
                                                          {bookConfig.genre === key ? 'Selecionado' : 'Toque para escolher'}
                                                      </span>
                                                  </div>
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          )}

                          {step === 1 && (
                              <div className="space-y-12 animate-in fade-in duration-700">
                                  <div className="space-y-2">
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-sans">Protagonistas</label>
                                      <input 
                                          placeholder="Quem vive essa história?" 
                                          className={`w-full bg-transparent border-b-[0.5px] border-gray-200/20 py-4 text-xl font-light outline-none focus:border-purple-400/50 transition-colors placeholder-gray-600`}
                                          onChange={(e) => setBookConfig({...bookConfig, characters: e.target.value})}
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-sans">Temas Centrais</label>
                                      <input 
                                          placeholder="Amor, perda, descoberta..." 
                                          className={`w-full bg-transparent border-b-[0.5px] border-gray-200/20 py-4 text-xl font-light outline-none focus:border-purple-400/50 transition-colors placeholder-gray-600`}
                                          onChange={(e) => setBookConfig({...bookConfig, themes: e.target.value})}
                                      />
                                  </div>
                                  <div className="space-y-4">
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-sans">Direção Criativa</label>
                                      <textarea 
                                          placeholder="Dê um tom à sua história. Poético? Cru? Humorístico? Guie a IA..." 
                                          className={`w-full bg-transparent border-[0.5px] border-gray-200/20 p-6 text-lg font-light outline-none focus:border-purple-400/50 transition-colors h-40 resize-none placeholder-gray-600`}
                                          onChange={(e) => setBookConfig({...bookConfig, userGuidance: e.target.value})}
                                      />
                                  </div>
                              </div>
                          )}

                          {step === 2 && (
                              <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-1000">
                                  <div className="relative w-32 h-32 mb-12">
                                      <div className="absolute inset-0 border-[0.5px] border-gray-200/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                      <div className="absolute inset-2 border-[0.5px] border-t-purple-400/50 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_3s_linear_infinite]"></div>
                                      <Feather className="absolute inset-0 m-auto w-6 h-6 text-purple-400/80 animate-pulse" strokeWidth={1} />
                                  </div>
                                  <h2 className="text-3xl font-light italic mb-4">Tecendo Memórias...</h2>
                                  <p className="text-sm font-sans font-light text-gray-500 max-w-xs mx-auto leading-relaxed tracking-wide">
                                      Aguarde enquanto transformamos seus momentos em eternidade.
                                  </p>
                                  <button onClick={handleGenerate} className="mt-8 px-8 py-3 bg-[#8B5CF6] text-white rounded-full font-sans text-xs uppercase tracking-widest hover:bg-[#7C3AED] transition-colors shadow-lg shadow-purple-500/30">
                                      Iniciar Magia
                                  </button>
                              </div>
                          )}
                      </div>

                      {step < 2 && (
                          <div className={`absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t ${isDark ? 'from-[#13111C] via-[#13111C]' : 'from-[#FAFAF9] via-[#FAFAF9]'} to-transparent`}>
                              <div className="flex justify-between items-center">
                                  {step > 0 ? (
                                      <button onClick={() => setStep(step - 1)} className="text-xs font-sans uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                                          Voltar
                                      </button>
                                  ) : <div></div>}
                                  <button 
                                      onClick={() => setStep(step + 1)} 
                                      className={`
                                        px-8 py-3 border-[0.5px] rounded-full text-xs font-sans uppercase tracking-[0.2em] transition-all duration-500
                                        ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}
                                      `}
                                  >
                                      Próximo
                                  </button>
                              </div>
                          </div>
                      )}
                  </>
              ) : (
                  <div className="h-full flex flex-col animate-in fade-in duration-1000 bg-[#FDFBF7] text-gray-900">
                      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200/50">
                          <button onClick={() => setGeneratedBook(null)} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-sans text-xs uppercase tracking-widest">
                              <ArrowLeft className="w-4 h-4"/> Voltar
                          </button>
                          <div className="flex gap-4">
                              <button onClick={handleSaveBook} className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors">
                                  <CheckCircle className="w-3 h-3"/> Salvar na Estante
                              </button>
                              <button className="text-gray-400 hover:text-black transition-colors"><Download className="w-4 h-4"/></button>
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 sm:p-12 max-w-3xl mx-auto w-full shadow-2xl my-4 sm:my-8 bg-white" style={{fontSize: `${appSettings.fontSize}px`}}>
                           <div className="text-center mb-16 pt-8">
                               <p className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-gray-300 mb-6">CAPÍTULO ÚNICO</p>
                               <h1 className="text-5xl sm:text-6xl font-light italic mb-8 leading-tight text-black">{generatedBook.title}</h1>
                               <div className="w-12 h-[1px] bg-black mx-auto mb-8"></div>
                               <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Baseado em fatos reais</p>
                           </div>
                           <div className="prose prose-lg prose-p:font-book prose-p:text-xl prose-p:leading-loose prose-p:text-gray-800 mx-auto text-justify">
                               {generatedBook.content.split('\n').map((paragraph, idx) => (
                                   <p key={idx} className={idx === 0 ? "first-letter:text-7xl first-letter:font-light first-letter:mr-3 first-letter:float-left first-letter:text-black" : "indent-8"}>
                                       {paragraph}
                                   </p>
                               ))}
                           </div>
                           <div className="mt-24 mb-12 flex justify-center">
                               <div className="text-center">
                                   <span className="block text-2xl text-gray-300 mb-2">❦</span>
                                   <p className="text-[10px] font-sans uppercase tracking-widest text-gray-300">Fim do Capítulo</p>
                               </div>
                           </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  if (isLocked) {
      return (
          <div className="fixed inset-0 z-[200] bg-[#13111C] flex flex-col items-center justify-center text-white p-8">
              <div className="mb-8">
                  <Lock className="w-16 h-16 text-purple-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Diário Bloqueado</h2>
              <p className="text-gray-400 mb-8 text-sm">Digite seu PIN para acessar suas memórias.</p>
              
              <div className="flex gap-4 mb-8">
                  {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-4 h-4 rounded-full border border-purple-500 ${pinInput.length > i ? 'bg-purple-500' : 'bg-transparent'}`}></div>
                  ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button key={num} onClick={() => setPinInput(prev => (prev.length < 4 ? prev + num : prev))} className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-2xl font-bold flex items-center justify-center transition-colors">
                          {num}
                      </button>
                  ))}
                  <div className="w-16 h-16 flex items-center justify-center">
                      {appSettings.isBiometricsEnabled && (
                          <button onClick={handleBiometricUnlock} className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center hover:bg-purple-500/30 transition-colors">
                              <Scan className="w-6 h-6" />
                          </button>
                      )}
                  </div>
                  <button onClick={() => setPinInput(prev => (prev.length < 4 ? prev + '0' : prev))} className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-2xl font-bold flex items-center justify-center transition-colors">0</button>
                  <button onClick={() => setPinInput(prev => prev.slice(0, -1))} className="w-16 h-16 rounded-full bg-transparent text-white flex items-center justify-center"><X className="w-6 h-6"/></button>
              </div>
              
              <button onClick={handleUnlock} className="px-8 py-3 bg-purple-600 rounded-xl font-bold w-full max-w-xs shadow-lg shadow-purple-500/30">Desbloquear</button>
          </div>
      );
  }

  if (!hasSeenOnboarding) return <Onboarding />;

  const isDarkMode = appSettings.themeMode === 'dark';
  
  const getThemeClasses = () => {
      switch(appSettings.themeMode) {
          case 'dark': return 'bg-[#13111C] text-white';
          default: return 'bg-[#FAFAF9] text-gray-900'; 
      }
  };
  
  const themeClasses = getThemeClasses();

  return (
    <div className={`flex flex-col h-full ${themeClasses} relative ${FONTS.find(f => f.id === appSettings.fontStyle)?.class || 'font-sans'} overflow-hidden transition-colors duration-500`}>
      <audio ref={audioRef} loop hidden={false} style={{display: 'none'}} crossOrigin="anonymous" />
      
      {/* ... (Styles and Overlays) ... */}
      <style>{`
        /* ... (Existing animations) ... */
        @keyframes mood-glow {
          0%, 100% { box-shadow: 0 0 5px var(--mood-color), inset 0 0 2px var(--mood-color); border-color: var(--mood-color); }
          50% { box-shadow: 0 0 2px var(--mood-color), inset 0 0 1px var(--mood-color); border-color: transparent; }
        }
        .animate-mood-border {
          animation: mood-glow 3s ease-in-out infinite;
        }
        @keyframes rain { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        .rain-drop { position: absolute; width: 1px; background: rgba(255, 255, 255, 0.3); animation: rain 1s linear infinite; }
        @keyframes confetti { 0% { transform: translateY(-100vh) rotate(0deg); } 100% { transform: translateY(100vh) rotate(720deg); } }
        .confetti-piece { position: absolute; width: 8px; height: 8px; animation: confetti 3s ease-in infinite; }
        @keyframes breathe-circle { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.5); opacity: 0; } }
        .breathe-ring { position: absolute; border-radius: 50%; border: 2px solid white; animation: breathe-circle 4s infinite; }
        @keyframes screen-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .shake-screen { animation: screen-shake 0.5s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%); background-size: 200% 100%; animation: shimmer 2s infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        @keyframes equalizer { 0% { height: 20%; } 50% { height: 100%; } 100% { height: 20%; } }
        .equalizer-bar { animation: equalizer 1s ease-in-out infinite; }
      `}</style>

      {/* ... (Overlays: Achievement, LevelUp, Celebration, GoldReward, MantraLoading) ... */}
      {achievementNotification && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border-2 border-yellow-300">
                  <Trophy className="w-5 h-5 fill-black/20" />
                  <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Conquista Desbloqueada</p>
                      <p className="font-bold text-sm">{achievementNotification}</p>
                  </div>
              </div>
          </div>
      )}

      {showLevelUp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md p-8 rounded-3xl flex flex-col items-center text-center animate-in zoom-in duration-500 border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                  <div className="w-24 h-24 mb-4 relative">
                      <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl animate-pulse"></div>
                      <Crown className="w-full h-full text-yellow-400 relative z-10" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2">LEVEL UP!</h2>
                  <p className="text-purple-200 text-xl">Você alcançou o Nível {userProgress.level}</p>
              </div>
          </div>
      )}

      {showCelebration && (
        <div className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${MOODS.find(m => m.id === celebrationMoodId)?.gradient || 'from-gray-900 to-black'} opacity-90 transition-all duration-500`}></div>
            {celebrationMoodId === 'bad' && Array.from({length: 30}).map((_, i) => (
                <div key={i} className="rain-drop" style={{left: Math.random()*100+'%', animationDuration: 0.5+Math.random()+'s', height: 10+Math.random()*20+'px'}}></div>
            ))}
            {(celebrationMoodId === 'good' || celebrationMoodId === 'awesome') && Array.from({length: 50}).map((_, i) => (
                <div key={i} className="confetti-piece" style={{left: Math.random()*100+'%', background: ['#FCD34D', '#F87171', '#60A5FA', '#A78BFA'][Math.floor(Math.random()*4)], animationDuration: 2+Math.random()+'s'}}></div>
            ))}
            {celebrationMoodId === 'neutral' && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="breathe-ring w-96 h-96 border-white/20"></div>
                   <div className="breathe-ring w-64 h-64 border-white/40" style={{animationDelay: '1s'}}></div>
                </div>
            )}
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-500">
                 <div className="w-32 h-32 mb-6 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-float">
                     {MOODS.find(m => m.id === celebrationMoodId)?.icon}
                 </div>
                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-xs w-full">
                     <h2 className="text-3xl font-bold text-white mb-2">{MOODS.find(m => m.id === celebrationMoodId)?.label}</h2>
                     <div className="w-full h-px bg-white/20 my-4"></div>
                     <p className="text-white/90 text-lg font-medium italic mb-4">"{MOODS.find(m => m.id === celebrationMoodId)?.reaction}"</p>
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                        <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span className="text-white font-bold">+10 XP</span>
                     </div>
                 </div>
            </div>
        </div>
      )}

      {showGoldReward && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
           {Array.from({length: 30}).map((_, i) => (
              <div key={i} className="absolute text-4xl animate-[rain_2s_ease-in_infinite]" style={{left: Math.random()*100+'%', top: -50, animationDelay: Math.random()+'s'}}>🪙</div>
           ))}
           <div className="bg-gradient-to-b from-amber-300 to-amber-600 p-8 rounded-3xl shadow-2xl text-center animate-bounce border-4 border-yellow-100">
              <h2 className="text-3xl font-bold text-white mb-2">Abundância Ativada!</h2>
              <p className="text-white/90 font-bold text-lg">+100 XP</p>
           </div>
        </div>
      )}

      {loadingMantra && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center animate-pulse">
                <SparklesIcon className="w-12 h-12 text-amber-400 mb-4 animate-spin" />
                <p className="text-amber-200 font-book italic text-xl">Manifestando...</p>
            </div>
        </div>
      )}

      {activeTab === 'home' && !appSettings.zenMode && (
        <div className={`px-4 sm:px-6 pt-8 sm:pt-10 pb-4 flex justify-between items-center ${isDarkMode ? 'bg-[#13111C]' : 'bg-[#FAFAF9]'} z-40 sticky top-0`}>
          <div onClick={() => setShowAchievements(true)} className="cursor-pointer flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <div className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-transform ${streakPulse ? 'animate-pulse scale-110 shadow-yellow-500/50 shadow-lg' : ''}`}>
                    <Flame className="w-3 h-3 fill-white" /> {userProgress.streak}
                </div>
                <div className="bg-[#2D2A4A] text-[#8B5CF6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Lvl {userProgress.level}
                </div>
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Diário IA</h1>
          </div>
          <div className="flex gap-2 sm:gap-3 shrink-0 ml-2">
            <button onClick={() => setShowAchievements(true)} className={`p-2.5 rounded-full border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'}`}>
               <Award className="w-5 h-5 text-yellow-500" />
            </button>
            <button onClick={() => setIsCalendarOpen(true)} className={`p-2.5 rounded-full border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'}`}>
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-2.5 rounded-full border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'}`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
             {/* ... (Daily Inspiration Card) ... */}
             <div 
                className={`mx-6 rounded-3xl p-6 border relative overflow-hidden shadow-lg group transition-all duration-500`}
                style={{
                   background: dailyMood ? `linear-gradient(135deg, ${MOODS.find(m => m.id === dailyMood)?.color}20 0%, ${isDarkMode ? '#1E1B2E' : '#FFFFFF'} 100%)` : undefined,
                   borderColor: dailyMood ? MOODS.find(m => m.id === dailyMood)?.color : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'),
                   boxShadow: dailyMood ? `0 0 20px ${MOODS.find(m => m.id === dailyMood)?.color}30` : 'none'
                }}
            >
              {!dailyMood ? (
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-[#8B5CF6]" />
                   </div>
              ) : (
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <div className="w-24 h-24 text-current" style={{color: MOODS.find(m => m.id === dailyMood)?.color}}>
                          {MOODS.find(m => m.id === dailyMood)?.icon}
                      </div>
                  </div>
              )}
              
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color: dailyMood ? MOODS.find(m => m.id === dailyMood)?.color : '#8B5CF6'}}>
                    {dailyMood ? "Seu Mantra de Hoje" : "Inspiração do dia"}
                </p>
                <p className={`text-lg font-medium mb-6 leading-relaxed font-serif italic ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>"{dailyQuote}"</p>
                
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-400">Como você está se sentindo?</p>
                    <div className="flex gap-2 justify-between mt-1">
                    {MOODS.map((mood) => (
                        <button
                        key={mood.id}
                        onClick={() => handleHomeMoodSelect(mood.id)}
                        className={`flex flex-col items-center gap-2 transition-all duration-500 ${dailyMood === mood.id ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        >
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${dailyMood === mood.id ? 'ring-2 ring-offset-2 ring-offset-[#13111C] ring-current' : ''}`}
                              style={{
                                  background: `linear-gradient(135deg, ${mood.color} 0%, ${mood.color}80 100%)`,
                                  color: '#FFF',
                                  boxShadow: dailyMood === mood.id ? `0 10px 20px -5px ${mood.color}80` : 'none'
                              }}
                         >
                           <div className="w-6 h-6">
                               {mood.icon}
                           </div>
                         </div>
                         <span className={`text-[10px] font-medium transition-colors ${dailyMood === mood.id ? 'font-bold' : ''}`} style={{color: dailyMood === mood.id ? mood.color : (isDarkMode ? '#9CA3AF' : '#4B5563')}}>{mood.label}</span>
                        </button>
                    ))}
                    </div>
                </div>
              </div>
            </div>

             {/* Search & Weekly Calendar Strip */}
            <div className="space-y-4 mx-6">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar memórias..." 
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] ${isDarkMode ? 'bg-[#1E1B2E] text-white border-white/5' : 'bg-white text-gray-900 border-gray-200 shadow-sm'}`}
                    />
                </div>

                {/* WEEKLY CALENDAR STRIP */}
                <div className="flex items-center justify-between mb-2">
                    <button onClick={prevWeek} className="p-1 rounded-full hover:bg-white/10"><ChevronLeft className="w-4 h-4 text-gray-500"/></button>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        {currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextWeek} className="p-1 rounded-full hover:bg-white/10"><ChevronRight className="w-4 h-4 text-gray-500"/></button>
                </div>
                <div className="flex justify-between gap-2">
                    {getWeekDays().map((date, index) => {
                        const isSelected = date.toDateString() === selectedHomeDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const hasEntry = entries.some(e => new Date(e.createdAt).toDateString() === date.toDateString());
                        
                        return (
                            <button 
                                key={index}
                                onClick={() => setSelectedHomeDate(date)}
                                className={`
                                    flex flex-col items-center justify-center w-full py-3 rounded-2xl transition-all duration-300 relative
                                    ${isSelected 
                                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/30 scale-105' 
                                        : (isDarkMode ? 'bg-[#1E1B2E] text-gray-400 hover:bg-white/5' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100')}
                                `}
                            >
                                <span className="text-[10px] font-bold uppercase mb-1 opacity-80">
                                    {date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                                </span>
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : (isToday ? 'text-[#8B5CF6]' : '')}`}>
                                    {date.getDate()}
                                </span>
                                {hasEntry && (
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-[#8B5CF6]'}`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

             {/* Entries Carousel */}
            <div>
              <div className="flex justify-between items-center px-6 mb-4">
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {searchQuery ? 'Resultados da Busca' : (
                          selectedHomeDate.toDateString() === new Date().toDateString() ? 'Memórias de Hoje' : `Memórias de ${selectedHomeDate.toLocaleDateString('pt-BR', {weekday: 'short', day: 'numeric'})}`
                      )}
                  </h2>
                  <button 
                        onClick={() => setShowTimelineOnly(!showTimelineOnly)}
                        className={`px-3 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${showTimelineOnly ? 'bg-yellow-500 border-yellow-500 text-black' : `${isDarkMode ? 'bg-[#1E1B2E] border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}`}
                    >
                        <Flag className="w-3 h-3"/> Linha do Tempo
                    </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-6 -mx-0 snap-x snap-mandatory">
                {getFilteredEntries().length === 0 ? (
                     <div className="min-w-full text-center py-10 opacity-50 border border-dashed border-white/10 rounded-2xl mx-6 flex flex-col items-center justify-center gap-2">
                        <CalendarIcon className="w-8 h-8 text-gray-600"/>
                        <p className="text-gray-400 text-sm">Nenhuma memória neste dia.</p>
                        <button onClick={() => {resetEditor(); setEditorDate(selectedHomeDate.getTime()); setIsEditorOpen(true)}} className="text-[#8B5CF6] text-xs font-bold mt-2 hover:underline">
                            + Criar memória para {selectedHomeDate.getDate()}/{selectedHomeDate.getMonth()+1}
                        </button>
                     </div>
                ) : (
                    getFilteredEntries().slice(0, 10).map(entry => {
                        const hasImage = entry.images && entry.images.length > 0;
                        const coverImage = hasImage ? entry.images![0] : null;
                        const moodColor = MOODS.find(m => m.id === entry.mood)?.color || '#8B5CF6';
                        const moodIcon = MOODS.find(m => m.id === entry.mood)?.icon;
                        const isImportant = !!entry.importantEvent;
                        
                        // FIX: Get correct label in Portuguese and Type Data
                        const importantType = entry.importantEvent ? EVENT_TYPES.find(t => t.id === entry.importantEvent?.type) : null;
                        const importantLabel = importantType ? importantType.label : '';

                        return (
                            <div 
                                key={entry.id} 
                                onClick={(e) => {
                                    setEditorId(entry.id);
                                    setEditorTitle(entry.title);
                                    setEditorContent(entry.content);
                                    setEditorTags(entry.tags);
                                    setEditorTasks(entry.tasks || []);
                                    setEditorFont(entry.font);
                                    setEditorTheme(entry.theme);
                                    setEditorImages(entry.images || []);
                                    setEditorMood(entry.mood);
                                    setEditorLocationConfig(entry.locationReminders || { name: '', address: '', condition: 'arrive', active: false });
                                    setEditorEvent(entry.importantEvent);
                                    setIsEditorOpen(true);
                                }} 
                                style={{ 
                                    borderColor: isImportant ? '#EAB308' : moodColor,
                                    boxShadow: isImportant ? undefined : `0 10px 30px -10px ${moodColor}50`
                                } as React.CSSProperties}
                                className={`
                                    relative flex-shrink-0 w-[85vw] sm:w-72 h-80 rounded-3xl snap-center overflow-hidden border-2 active:scale-[0.98] transition-all duration-300 group
                                    ${isImportant ? 'ring-2 ring-yellow-500/30' : ''}
                                    ${!hasImage ? (isDarkMode ? 'bg-[#1E1B2E]' : 'bg-white') : ''}
                                `}
                            >
                                {isImportant && (
                                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-30 text-black text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-lg flex items-center gap-1 transition-transform group-hover:scale-110 ${importantType?.color || 'bg-yellow-500'}`}>
                                        {importantType?.icon || <Crown className="w-3 h-3"/>} 
                                        {importantLabel.toUpperCase()}
                                    </div>
                                )}

                                {/* NEW HOVER OVERLAY: SLIDES DOWN FROM TOP */}
                                {isImportant && (
                                    <div className="absolute top-0 left-0 w-full bg-black/90 backdrop-blur-md z-40 p-4 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-3 shadow-xl border-b border-white/10">
                                         <div className={`p-2 rounded-full ${importantType?.color || 'bg-yellow-500'} text-white shrink-0`}>
                                            {importantType?.icon}
                                         </div>
                                         <div className="flex-1 min-w-0 text-left">
                                             <h4 className="text-white font-bold text-xs uppercase tracking-wider">{importantLabel}</h4>
                                             <p className="text-gray-300 text-sm italic font-serif truncate">"{entry.importantEvent?.title || entry.title}"</p>
                                         </div>
                                    </div>
                                )}

                                {moodIcon && (
                                    <div className="absolute top-3 right-3 z-20">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/10 ${hasImage ? 'bg-black/30 backdrop-blur-md' : (isDarkMode ? 'bg-white/5' : 'bg-gray-100')}`}>
                                            <div className="w-5 h-5 text-white">
                                                {moodIcon}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hasImage && (
                                    <>
                                        <img src={coverImage!} className="absolute inset-0 w-full h-full object-cover" alt="Memory cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>
                                    </>
                                )}

                                <div className={`relative h-full flex flex-col z-10 p-5 ${!hasImage ? '' : 'justify-end'}`}>
                                    
                                    {!hasImage && (
                                        <div className="flex justify-between items-start mb-2 shrink-0">
                                             <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                                {isImportant ? <Flag className="w-5 h-5 text-yellow-500"/> : <ImageIcon className="w-5 h-5 text-gray-500" />}
                                             </div>
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${!hasImage ? 'flex-1 min-h-0' : 'max-h-[75%]'}`}>
                                        {entry.importantEvent && (
                                            <span className="text-[10px] text-yellow-400 font-bold uppercase mb-1 flex items-center gap-1 group-hover:text-yellow-300 transition-colors">
                                                {importantType?.icon}
                                                {importantLabel}
                                            </span>
                                        )}
                                        <h3 className={`font-bold mb-2 leading-tight shrink-0 group-hover:underline decoration-2 decoration-current underline-offset-4 ${hasImage ? 'text-2xl text-white' : (isDarkMode ? 'text-xl text-white' : 'text-xl text-gray-900')}`}>{entry.title}</h3>
                                        <div className="overflow-y-auto pr-1 mb-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
                                            <p className={`text-sm whitespace-pre-wrap ${hasImage ? 'text-gray-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{entry.content}</p>
                                        </div>
                                        
                                        {/* Task Preview in Card - RESTORED */}
                                        {entry.tasks && entry.tasks.length > 0 && (
                                            <div className={`mt-2 pt-2 border-t ${hasImage ? 'border-white/20' : 'border-gray-500/20'} shrink-0`}>
                                                <div className={`flex items-center gap-2 text-xs font-bold mb-1 ${hasImage ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    <CheckSquare className="w-3 h-3"/>
                                                    <span>{entry.tasks.length} Tarefas</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {entry.tasks.slice(0, 2).map(t => (
                                                        <div key={t.id} className="flex items-center gap-2 text-[10px] opacity-80">
                                                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${t.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                                                {t.completed && <CheckCircle className="w-2 h-2 text-white"/>}
                                                            </div>
                                                            <span className={`truncate ${hasImage ? 'text-white' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>{t.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* FIX: Date moved to bottom right */}
                                        <div className={`absolute bottom-4 right-5 text-[10px] font-bold uppercase ${hasImage ? 'text-white/60' : 'text-gray-500'}`}>
                                            {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'book' && <BookCreator />}
        
        {/* ... (Analytics and Profile Tabs remain unchanged) ... */}
        {activeTab === 'analytics' && (
            // ... (Analytics Content) ...
            <div className="h-full flex flex-col bg-[#0F0F13] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-900/20 to-transparent pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="px-8 pt-12 pb-6 z-10">
                    <h1 className="text-4xl font-book italic text-white mb-2">Santuário de Metas</h1>
                    <p className="text-white/50 font-sans text-xs tracking-widest uppercase">Manifeste sua realidade</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-24 z-10 space-y-8">
                    <div className="relative flex items-center justify-center py-4">
                        <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-75 animate-pulse"></div>
                        <div className="relative w-64 h-64">
                            <svg className="w-full h-full -rotate-90 transform">
                                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                                <circle 
                                    cx="128" cy="128" r="120" 
                                    stroke="url(#gold-gradient)" 
                                    strokeWidth="2" 
                                    fill="transparent" 
                                    strokeDasharray={2 * Math.PI * 120} 
                                    strokeDashoffset={2 * Math.PI * 120 * (1 - (abundanceCompleted.length / ABUNDANCE_EXERCISES.length))} 
                                    className="transition-all duration-1000 ease-out"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#F59E0B" />
                                        <stop offset="100%" stopColor="#FDE68A" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-5xl font-book text-white mb-1">{Math.round((abundanceCompleted.length / ABUNDANCE_EXERCISES.length) * 100)}%</span>
                                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Energia de Hoje</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white/80 font-book text-2xl italic mb-6 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-amber-500/50"></span>
                            Rituais de Poder
                            <span className="flex-1 h-[1px] bg-white/10"></span>
                        </h3>
                        <div className="space-y-4">
                            {ABUNDANCE_EXERCISES.map((ex, index) => {
                                const isDone = abundanceCompleted.includes(ex.id);
                                return (
                                    <div 
                                        key={ex.id}
                                        onClick={() => {
                                            if (isDone) return;
                                            if (ex.action === 'mantra') {
                                                handleMantraGeneration();
                                            } else if (ex.action === 'write') {
                                                openEditorForAbundance(ex.title, ex.tag || 'Abundância', ex.desc, ex.id);
                                            } else {
                                                handleAbundanceCheck(ex.id);
                                            }
                                        }}
                                        className={`
                                            group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer
                                            ${isDone 
                                                ? 'bg-amber-900/20 border-amber-500/30' 
                                                : 'bg-white/5 border-white/5 hover:border-white/20'}
                                        `}
                                    >
                                        <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500/10 to-transparent transition-all duration-700 ${isDone ? 'w-full' : 'w-0'}`}></div>
                                        <div className="relative p-5 flex items-center gap-4">
                                            <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500
                                                ${isDone 
                                                    ? 'bg-amber-500 text-black border-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                                                    : 'bg-transparent border-white/20 text-white/30 group-hover:border-white/40'}
                                            `}>
                                                {isDone ? <CheckCircle className="w-6 h-6" /> : <span className="text-lg font-book italic">{index + 1}</span>}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-lg font-book transition-colors ${isDone ? 'text-amber-100' : 'text-white'}`}>{ex.title}</h4>
                                                <p className="text-xs text-gray-400 leading-relaxed mt-1">{ex.desc}</p>
                                            </div>
                                            {!isDone && ex.action === 'write' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); openEditorForAbundance(ex.title, ex.tag || 'Abundância', ex.desc, ex.id); }}
                                                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                                                >
                                                    <PenTool className="w-4 h-4" />
                                                </button>
                                            )}
                                            {!isDone && ex.action === 'mantra' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleMantraGeneration(); }}
                                                    className="p-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors animate-pulse"
                                                >
                                                    <SparklesIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {activeTab === 'profile' && (
             // ... (Profile Content) ...
             <div className="p-6 animate-in fade-in pb-24">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="relative w-32 h-32 mb-4 group cursor-pointer" onClick={() => setIsProfileEditOpen(true)}>
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-spin-slow"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent animate-[spin_3s_linear_infinite]"></div>
                        <div className="absolute inset-3 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                             <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover"/>
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Edit3 className="w-6 h-6 text-white"/>
                             </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/10 flex items-center gap-1 whitespace-nowrap z-10">
                            <SparklesIcon className="w-3 h-3 text-yellow-300" /> Lvl {userProgress.level}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 justify-center mb-1">
                        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</h2>
                        <button onClick={() => setIsProfileEditOpen(true)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <Edit3 className="w-4 h-4"/>
                        </button>
                    </div>
                    <p className={`text-sm font-medium uppercase tracking-widest mb-4 ${userProgress.subscriptionTier === 'mystic' ? 'text-amber-400' : (userProgress.subscriptionTier === 'pro' ? 'text-purple-400' : 'text-gray-500')}`}>
                        {userProgress.subscriptionTier === 'mystic' ? 'Arquimago' : (userProgress.subscriptionTier === 'pro' ? 'Grimório' : 'Iniciado')}
                    </p>
                    <div className="w-full max-w-xs bg-gray-800/50 h-1.5 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000" style={{width: `${(userProgress.xp % 1000) / 10}%`}}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">{userProgress.xp} XP / {userProgress.level * 1000} XP</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border backdrop-blur-sm ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="p-2 bg-blue-500/20 rounded-full text-blue-400"><Book className="w-5 h-5"/></div>
                        <div className="text-center">
                            <span className={`block text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProgress.entriesCount}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Memórias</span>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border backdrop-blur-sm ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                         <div className="p-2 bg-orange-500/20 rounded-full text-orange-400"><Flame className="w-5 h-5"/></div>
                         <div className="text-center">
                             <span className={`block text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProgress.streak}</span>
                             <span className="text-[10px] text-gray-500 uppercase tracking-wider">Dias</span>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border backdrop-blur-sm ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                         <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400"><Crown className="w-5 h-5"/></div>
                         <div className="text-center">
                             <span className={`block text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{achievementsList.filter(a => a.completed).length}</span>
                             <span className="text-[10px] text-gray-500 uppercase tracking-wider">Troféus</span>
                        </div>
                    </div>
                </div>
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="w-4 h-4 text-purple-400"/>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Análise de Alma</h3>
                    </div>
                    <div className="grid gap-4">
                        <div className="relative overflow-hidden rounded-3xl p-6 min-h-[160px] flex flex-col justify-end group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-80 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="text-2xl font-bold text-white mb-1">Sua Aura Emocional</h4>
                                        <p className="text-indigo-100 text-xs max-w-[200px] leading-relaxed">
                                            As cores das suas memórias este mês formam esta energia única.
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                        <SparklesIcon className="w-6 h-6"/>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] text-white/80 mb-2 font-medium uppercase tracking-widest">
                                        <span>Introspecção</span>
                                        <span>Equilíbrio</span>
                                        <span>Alegria</span>
                                    </div>
                                    <div className="h-3 rounded-full w-full flex overflow-hidden ring-1 ring-white/30">
                                        <div className="h-full bg-blue-400 w-[30%]"></div>
                                        <div className="h-full bg-purple-400 w-[20%]"></div>
                                        <div className="h-full bg-yellow-400 w-[50%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100'}`}>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg text-white">
                                <Feather className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Seu Arquétipo de Escrita</p>
                                <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>O Poeta Visionário</h4>
                                <p className="text-xs text-gray-400">Você encontra beleza nos detalhes.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <button onClick={() => setShowAchievements(true)} className={`w-full py-4 rounded-2xl border flex items-center justify-between px-6 group hover:border-[#8B5CF6] transition-colors ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500 group-hover:scale-110 transition-transform"><Trophy className="w-5 h-5"/></div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sala de Troféus</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500"/>
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className={`w-full py-4 rounded-2xl border flex items-center justify-between px-6 group hover:border-gray-400 transition-colors ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-500/20 rounded-lg text-gray-400 group-hover:scale-110 transition-transform"><Settings className="w-5 h-5"/></div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configurações</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500"/>
                    </button>
                    {/* LOGOUT BUTTON */}
                    <button onClick={handleLogout} className={`w-full py-4 rounded-2xl border flex items-center justify-between px-6 group hover:border-red-400 transition-colors ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-500/20 rounded-lg text-red-500 group-hover:scale-110 transition-transform"><LogOut className="w-5 h-5"/></div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sair (Bem-vindo)</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
                <div className="mt-8 text-center">
                    <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-2 mx-auto">
                        <Share2 className="w-3 h-3"/> Compartilhar Perfil
                    </button>
                </div>
            </div>
        )}
      </div>
      
      {/* Bottom Nav */}
      {!appSettings.zenMode && (
        <div className={`h-20 backdrop-blur-md border-t flex items-center px-6 justify-between z-20 absolute bottom-0 w-full ${isDarkMode ? 'bg-[#13111C]/95 border-white/5' : 'bg-white/95 border-gray-200'}`}>
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><Home className="w-6 h-6"/><span className="text-[10px] mt-1">Início</span></button>
            <button onClick={() => setActiveTab('book')} className={`flex flex-col items-center ${activeTab === 'book' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><Book className="w-6 h-6"/><span className="text-[10px] mt-1">Livro</span></button>
            <div className="-mt-10">
            <button onClick={() => {resetEditor(); setIsEditorOpen(true)}} className="w-16 h-16 bg-[#8B5CF6] rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-600/40 hover:scale-110 transition-transform"><Plus className="w-8 h-8" /></button>
            </div>
            <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center ${activeTab === 'analytics' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><BarChart2 className="w-6 h-6"/><span className="text-[10px] mt-1">Metas</span></button>
            <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><User className="w-6 h-6"/><span className="text-[10px] mt-1">Perfil</span></button>
        </div>
      )}

      {/* Zen Mode Exit Button */}
      {appSettings.zenMode && (
          <button 
            onClick={() => setAppSettings(prev => ({...prev, zenMode: false}))}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/20 backdrop-blur-md text-white/50 hover:text-white hover:bg-black/40 transition-all border border-white/10 animate-in fade-in duration-1000"
          >
              <Eye className="w-6 h-6" />
          </button>
      )}
      
      {/* ... (Restored Modals: Settings, Calendar, Achievements, Subscription, ProfileEdit, PinSetup, WipeConfirm, Editor) ... */}
      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
              <div className={`w-full sm:max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-6 flex flex-col animate-in slide-in-from-bottom duration-300 ${isDarkMode ? 'bg-[#1E1B2E] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'} border`}>
                  <div className="flex justify-between items-center mb-6 shrink-0">
                      <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> Configurações</h2>
                      <button onClick={() => setIsSettingsOpen(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-6 h-6"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                      <div onClick={() => setShowSubscriptionModal(true)} className="p-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-indigo-600 text-white cursor-pointer relative overflow-hidden group">
                          <div className="relative z-10 flex justify-between items-center">
                              <div>
                                  <p className="text-xs font-bold uppercase opacity-80 mb-1">Plano Atual</p>
                                  <h3 className="text-xl font-bold flex items-center gap-2">
                                      {userProgress.subscriptionTier === 'mystic' ? 'Arquimago' : (userProgress.subscriptionTier === 'pro' ? 'Grimório' : 'Iniciado')}
                                      {userProgress.subscriptionTier !== 'free' && <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300"/>}
                                  </h3>
                              </div>
                              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">Gerenciar</button>
                          </div>
                          <div className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
                              <SparklesIcon className="w-24 h-24"/>
                          </div>
                      </div>
                      <section>
                          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Palette className="w-4 h-4"/> Aparência</h3>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <span>Modo Escuro</span>
                                  <button onClick={() => handleThemeChange(isDarkMode ? 'light' : 'dark')} className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}>
                                          {isDarkMode ? <Moon className="w-3 h-3 text-purple-600 m-0.5"/> : <Sun className="w-3 h-3 text-yellow-600 m-0.5"/>}
                                      </div>
                                  </button>
                              </div>
                              <div>
                                  <div className="flex justify-between mb-2">
                                      <span>Tamanho da Fonte</span>
                                      <span className="text-xs text-gray-500">{appSettings.fontSize}px</span>
                                  </div>
                                  <input type="range" min="12" max="24" value={appSettings.fontSize} onChange={(e) => setAppSettings({...appSettings, fontSize: parseInt(e.target.value)})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"/>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span>Modo Zen (Foco)</span>
                                  <button onClick={() => {setAppSettings({...appSettings, zenMode: !appSettings.zenMode}); setIsSettingsOpen(false);}} className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.zenMode ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${appSettings.zenMode ? 'left-7' : 'left-1'}`}></div>
                                  </button>
                              </div>
                          </div>
                      </section>
                      <section>
                          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Headphones className="w-4 h-4"/> Ambiente Sonoro</h3>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <span>Ativar Sons</span>
                                  <button onClick={() => setAppSettings({...appSettings, soundEnabled: !appSettings.soundEnabled})} className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.soundEnabled ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${appSettings.soundEnabled ? 'left-7' : 'left-1'}`}></div>
                                  </button>
                              </div>
                              <div className={`grid grid-cols-4 gap-2 ${!appSettings.soundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                  {[
                                      {id: 'rain', icon: <CloudRain className="w-5 h-5"/>, label: 'Chuva'},
                                      {id: 'forest', icon: <Wind className="w-5 h-5"/>, label: 'Floresta'},
                                      {id: 'cafe', icon: <Users className="w-5 h-5"/>, label: 'Café'},
                                      {id: 'fire', icon: <Flame className="w-5 h-5"/>, label: 'Fogo'},
                                  ].map(sound => (
                                      <button 
                                          key={sound.id}
                                          onClick={() => setAppSettings({...appSettings, soundType: sound.id as any})}
                                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${appSettings.soundType === sound.id ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-gray-700 hover:bg-white/5'}`}
                                      >
                                          {sound.icon}
                                          <span className="text-[10px]">{sound.label}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </section>
                      <section>
                          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Shield className="w-4 h-4"/> Segurança</h3>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <span>Bloqueio por PIN</span>
                                  <button onClick={() => {
                                      if(appSettings.isPinEnabled) setAppSettings({...appSettings, isPinEnabled: false, pinCode: null});
                                      else setShowPinSetup(true);
                                  }} className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.isPinEnabled ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${appSettings.isPinEnabled ? 'left-7' : 'left-1'}`}></div>
                                  </button>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span>Biometria (Face ID)</span>
                                  <button onClick={handleBiometricSetup} className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.isBiometricsEnabled ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${appSettings.isBiometricsEnabled ? 'left-7' : 'left-1'}`}></div>
                                  </button>
                              </div>
                          </div>
                      </section>
                      <section>
                          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Database className="w-4 h-4"/> Dados</h3>
                          <div className="space-y-3">
                              <button onClick={handleExportData} className="w-full p-3 rounded-xl border border-gray-700 flex items-center justify-between hover:bg-white/5">
                                  <div className="flex items-center gap-3">
                                      <Download className="w-5 h-5 text-blue-400"/>
                                      <div className="text-left">
                                          <p className="text-sm font-bold">Exportar Backup</p>
                                          <p className="text-[10px] text-gray-500">Salvar arquivo .json</p>
                                      </div>
                                  </div>
                                  {userProgress.subscriptionTier === 'free' && <Lock className="w-4 h-4 text-gray-500"/>}
                              </button>
                              <button onClick={() => backupInputRef.current?.click()} className="w-full p-3 rounded-xl border border-gray-700 flex items-center justify-between hover:bg-white/5">
                                  <div className="flex items-center gap-3">
                                      <Upload className="w-5 h-5 text-green-400"/>
                                      <div className="text-left">
                                          <p className="text-sm font-bold">Restaurar Backup</p>
                                          <p className="text-[10px] text-gray-500">Carregar arquivo .json</p>
                                      </div>
                                  </div>
                                  {userProgress.subscriptionTier === 'free' && <Lock className="w-4 h-4 text-gray-500"/>}
                              </button>
                              <input type="file" ref={backupInputRef} className="hidden" accept=".json" onChange={handleImportData} />
                              <button onClick={() => setShowWipeConfirm(true)} className="w-full p-3 rounded-xl border border-red-900/30 bg-red-900/10 flex items-center justify-between hover:bg-red-900/20 text-red-400">
                                  <div className="flex items-center gap-3">
                                      <Trash2 className="w-5 h-5"/>
                                      <span className="text-sm font-bold">Apagar Tudo (Danger Zone)</span>
                                  </div>
                              </button>
                          </div>
                      </section>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                      <p className="text-xs text-gray-500">Diário Mágico AI v1.2.0</p>
                  </div>
              </div>
          </div>
      )}

      {isCalendarOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
              <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in duration-300 ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Calendário</h2>
                      <button onClick={() => setIsCalendarOpen(false)} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-5 h-5 text-gray-500"/></button>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                      <button onClick={prevMonth} className="p-2 hover:bg-gray-500/10 rounded-full"><ChevronLeft className="w-5 h-5"/></button>
                      <span className="text-lg font-bold capitalize">{currentCalendarDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={nextMonth} className="p-2 hover:bg-gray-500/10 rounded-full"><ChevronRight className="w-5 h-5"/></button>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                      {['D','S','T','Q','Q','S','S'].map((d, i) => <span key={i} className="text-xs font-bold text-gray-500">{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: getFirstDayOfMonth(currentCalendarDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                      {Array.from({ length: getDaysInMonth(currentCalendarDate) }).map((_, i) => {
                          const day = i + 1;
                          const dateStr = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day).toDateString();
                          const hasEntry = entries.some(e => new Date(e.createdAt).toDateString() === dateStr);
                          const entry = entries.find(e => new Date(e.createdAt).toDateString() === dateStr);
                          const moodColor = entry ? MOODS.find(m => m.id === entry.mood)?.color : null;
                          return (
                              <button 
                                  key={day} 
                                  onClick={() => handleDateClick(day)}
                                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium relative transition-all hover:scale-110 ${hasEntry ? 'text-white shadow-lg' : (isDarkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')}`}
                                  style={{ backgroundColor: hasEntry ? (moodColor || '#8B5CF6') : 'transparent', border: hasEntry ? 'none' : '1px solid transparent' }}
                              >
                                  {day}
                                  {hasEntry && entry?.importantEvent && (
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#1E1B2E]"></div>
                                  )}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {showAchievements && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className={`w-full max-w-lg h-[80vh] rounded-3xl flex flex-col overflow-hidden border shadow-2xl animate-in slide-in-from-bottom-8 ${isDarkMode ? 'bg-[#13111C] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
                      <div>
                          <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500"/> Conquistas</h2>
                          <p className="text-xs text-gray-500 mt-1">Total XP: {userProgress.xp}</p>
                      </div>
                      <button onClick={() => setShowAchievements(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10"><X className="w-6 h-6"/></button>
                  </div>
                  <div className="flex p-2 mx-6 mt-4 bg-gray-800/50 rounded-xl shrink-0">
                      <button onClick={() => setAchievementTab('achievements')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${achievementTab === 'achievements' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}>Jornada</button>
                      <button onClick={() => setAchievementTab('rewards')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${achievementTab === 'rewards' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}>Recompensas</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {achievementTab === 'achievements' ? (
                          <>
                              <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-900/10 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-3 opacity-10"><RefreshCw className="w-24 h-24"/></div>
                                  <div className="relative z-10">
                                      <div className="flex justify-between items-start mb-2">
                                          <h3 className="font-bold text-blue-300">Jornada Diária</h3>
                                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">Recorrente</span>
                                      </div>
                                      <p className="text-xs text-gray-400 mb-4">Ações que geram XP todos os dias.</p>
                                      <div className="space-y-2">
                                          <div className="flex justify-between text-sm border-b border-white/5 pb-1">
                                              <span className="text-gray-300">Escrever no Diário</span>
                                              <span className="text-yellow-400 font-mono">+50 XP</span>
                                          </div>
                                          <div className="flex justify-between text-sm border-b border-white/5 pb-1">
                                              <span className="text-gray-300">Registrar Humor</span>
                                              <span className="text-yellow-400 font-mono">+10 XP</span>
                                          </div>
                                          <div className="flex justify-between text-sm border-b border-white/5 pb-1">
                                              <span className="text-gray-300">Completar Desafio</span>
                                              <span className="text-yellow-400 font-mono">+20 XP</span>
                                          </div>
                                          <div className="flex justify-between text-sm border-b border-white/5 pb-1">
                                              <span className="text-gray-300">Rituais de Abundância</span>
                                              <span className="text-yellow-400 font-mono">+100 XP</span>
                                          </div>
                                      </div>
                                      <div className="mt-4 pt-2 border-t border-blue-500/20 text-right">
                                          <p className="text-xs text-blue-300">XP Acumulado Hoje: <span className="font-bold text-white">{userProgress.xp % 1000}</span></p>
                                      </div>
                                  </div>
                              </div>
                              {achievementsList.map(ach => (
                                  <div key={ach.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${ach.completed ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ach.completed ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/10 text-gray-500'}`}>
                                          {ach.completed ? <CheckCircle className="w-6 h-6"/> : <Lock className="w-5 h-5"/>}
                                      </div>
                                      <div className="flex-1">
                                          <h3 className={`font-bold ${ach.completed ? 'text-yellow-500' : 'text-gray-400'}`}>{ach.title}</h3>
                                          <p className="text-xs text-gray-500 mb-2">{ach.description}</p>
                                          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                              <div className="h-full bg-yellow-500 transition-all duration-1000" style={{width: `${(ach.progress / ach.total) * 100}%`}}></div>
                                          </div>
                                          <div className="flex justify-between mt-1">
                                              <span className="text-[10px] text-gray-500">{ach.progress}/{ach.total}</span>
                                              <span className="text-[10px] font-bold text-yellow-500">+{ach.xpReward} XP</span>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </>
                      ) : (
                          <div className="grid grid-cols-2 gap-4">
                              {MOCK_REWARDS.map(reward => (
                                  <div key={reward.id} className={`relative p-4 rounded-2xl border flex flex-col items-center text-center gap-3 ${reward.isUnlocked ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                      {!reward.isUnlocked && <div className="absolute top-2 right-2"><Lock className="w-4 h-4 text-gray-500"/></div>}
                                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${reward.isUnlocked ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                                          {reward.imageUrl ? <img src={reward.imageUrl} className="w-10 h-10"/> : <Gift className="w-8 h-8 text-purple-400"/>}
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-sm">{reward.title}</h4>
                                          <p className="text-[10px] text-gray-500 mt-1">{reward.isUnlocked ? 'Desbloqueado' : `Nível ${reward.requiredLevel}`}</p>
                                      </div>
                                      {reward.isUnlocked && <button className="text-xs bg-purple-600 px-3 py-1 rounded-full font-bold mt-2">Equipar</button>}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {showSubscriptionModal && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className={`w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border animate-in zoom-in duration-300 ${isDarkMode ? 'bg-[#13111C] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="hidden md:flex w-1/3 bg-gradient-to-br from-purple-900 to-indigo-900 p-8 flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                      <div className="relative z-10">
                          <SparklesIcon className="w-12 h-12 text-yellow-300 mb-6"/>
                          <h2 className="text-3xl font-bold text-white mb-4">Desbloqueie seu Potencial Mágico</h2>
                          <p className="text-purple-200 leading-relaxed">Junte-se a milhares de usuários que transformaram suas vidas através da escrita consciente e IA.</p>
                      </div>
                      <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-3 text-white/80"><CheckCircle className="w-5 h-5 text-green-400"/> <span>IA Terapeuta Ilimitada</span></div>
                          <div className="flex items-center gap-3 text-white/80"><CheckCircle className="w-5 h-5 text-green-400"/> <span>Backup na Nuvem</span></div>
                          <div className="flex items-center gap-3 text-white/80"><CheckCircle className="w-5 h-5 text-green-400"/> <span>Livros Infinitos</span></div>
                      </div>
                  </div>
                  <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-8">
                          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Escolha seu Plano</h2>
                          <button onClick={() => setShowSubscriptionModal(false)} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-6 h-6 text-gray-500"/></button>
                      </div>
                      <div className="grid gap-4">
                          {SUBSCRIPTION_PLANS.map(plan => (
                              <div 
                                  key={plan.id}
                                  onClick={() => handleSubscribe(plan.id)}
                                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${plan.highlight ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : (isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white')}`}
                              >
                                  {plan.highlight && (
                                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                          MAIS POPULAR
                                      </div>
                                  )}
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                                          <div className="flex items-baseline gap-1">
                                              <span className="text-2xl font-bold text-[#8B5CF6]">{plan.price}</span>
                                              <span className="text-xs text-gray-500">{plan.period}</span>
                                          </div>
                                      </div>
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${userProgress.subscriptionTier === plan.id ? 'border-[#8B5CF6] bg-[#8B5CF6]' : 'border-gray-400'}`}>
                                          {userProgress.subscriptionTier === plan.id && <Check className="w-4 h-4 text-white"/>}
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      {plan.features.map((feat, i) => (
                                          <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                                              <Check className="w-4 h-4 text-green-500"/> {feat}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-6">
                          Cancelamento fácil a qualquer momento. Pagamento seguro.
                      </p>
                  </div>
              </div>
          </div>
      )}
      
      {isProfileEditOpen && (
          <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
              <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in duration-300 ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editar Perfil</h2>
                      <button onClick={() => setIsProfileEditOpen(false)} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-5 h-5 text-gray-500"/></button>
                  </div>
                  <div className="flex flex-col items-center mb-8">
                      <div className="relative w-24 h-24 mb-4 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                          <img src={userProfile.avatar} className="w-full h-full rounded-full object-cover border-2 border-purple-500" />
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-8 h-8 text-white"/>
                          </div>
                          <div className="absolute bottom-0 right-0 bg-purple-600 p-1.5 rounded-full border-2 border-[#1E1B2E]">
                              <Edit3 className="w-3 h-3 text-white"/>
                          </div>
                      </div>
                      <button onClick={() => avatarInputRef.current?.click()} className="text-xs text-purple-400 font-bold uppercase tracking-wider hover:text-purple-300">Alterar Foto</button>
                      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome Mágico</label>
                          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                              <User className="w-5 h-5 text-gray-400"/>
                              <input 
                                  value={userProfile.name}
                                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                                  className="bg-transparent outline-none flex-1 text-sm font-medium"
                                  placeholder="Seu nome"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                              <Mail className="w-5 h-5 text-gray-400"/>
                              <input 
                                  value={userProfile.email}
                                  onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                                  className="bg-transparent outline-none flex-1 text-sm font-medium"
                                  placeholder="seu@email.com"
                                  type="email"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Data de Nascimento</label>
                          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                              <Cake className="w-5 h-5 text-gray-400"/>
                              <input 
                                  value={userProfile.birthday}
                                  onChange={(e) => setUserProfile({...userProfile, birthday: e.target.value})}
                                  className="bg-transparent outline-none flex-1 text-sm font-medium"
                                  type="date"
                              />
                          </div>
                      </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                      <button onClick={() => setIsProfileEditOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">Cancelar</button>
                      <button onClick={() => setIsProfileEditOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/30 hover:bg-[#7C3AED] transition-colors">Salvar Alterações</button>
                  </div>
              </div>
          </div>
      )}
      
      {showPinSetup && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
              <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-lg font-bold mb-4">Criar PIN de Segurança</h3>
                  <div className="space-y-4">
                      <input 
                          type="password" 
                          maxLength={4}
                          placeholder="Novo PIN (4 dígitos)"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value.replace(/\D/g,''))}
                          className={`w-full p-3 rounded-xl border outline-none text-center text-2xl tracking-widest ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                      />
                      <input 
                          type="password" 
                          maxLength={4}
                          placeholder="Confirmar PIN"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g,''))}
                          className={`w-full p-3 rounded-xl border outline-none text-center text-2xl tracking-widest ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                      />
                      <div className="flex gap-2 mt-4">
                          <button onClick={() => setShowPinSetup(false)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-gray-400">Cancelar</button>
                          <button onClick={handlePinSetup} className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#8B5CF6] text-white">Salvar PIN</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {showWipeConfirm && (
          <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in">
              <div className="w-full max-w-sm bg-red-950/90 border border-red-500/50 p-6 rounded-3xl text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-white mb-2">Zona de Perigo</h3>
                  <p className="text-red-200 text-sm mb-6">Isso apagará TODAS as suas memórias, livros e progresso. Esta ação não pode ser desfeita.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setShowWipeConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20">Cancelar</button>
                      <button onClick={handleWipeData} className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/50">Apagar Tudo</button>
                  </div>
              </div>
          </div>
      )}

      {isEditorOpen && (
        <div className={`fixed inset-0 z-50 ${THEMES.find(t => t.id === editorTheme)?.bg || 'bg-[#13111C]'} flex flex-col animate-in slide-in-from-bottom duration-300`}>
            <div className={`flex items-center justify-between p-4 backdrop-blur-md ${isDarkMode ? 'bg-black/20' : 'bg-white/80 border-b border-gray-200'}`}>
                <button onClick={() => setIsEditorOpen(false)} className={`p-2 rounded-full shrink-0 ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}><X className="w-6 h-6"/></button>
                
                {/* SCROLLABLE TOOLBAR FOR MOBILE */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar px-2 mx-2 flex-1">
                    <button onClick={handleSpeechToText} className={`p-2 rounded-full shrink-0 ${isRecording ? 'bg-red-500 animate-pulse text-white' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600')}`}><Mic className="w-5 h-5"/></button>
                    <div className={`w-px h-6 shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full shrink-0 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}><ImageIcon className="w-5 h-5"/></button>
                    <button onClick={handleCameraPhoto} className={`p-2 rounded-full shrink-0 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}><Camera className="w-5 h-5"/></button>
                    <div className={`w-px h-6 shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <button onClick={handleOCR} className={`p-2 rounded-full shrink-0 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}><ScanText className="w-5 h-5"/></button>
                    <button onClick={() => { setShowLocationMenu(true); }} className={`p-2 rounded-full shrink-0 ${editorLocationConfig.active ? 'bg-green-500 text-white' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600')}`}><MapPin className="w-5 h-5"/></button>
                    <div className={`w-px h-6 shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <button onClick={() => setShowEditorHelp(!showEditorHelp)} className={`p-2 rounded-full shrink-0 ${showEditorHelp ? 'bg-[#8B5CF6] text-white' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600')}`}><HelpCircle className="w-5 h-5"/></button>
                </div>
                
                <button onClick={handleSaveEntry} className="px-4 py-2 bg-[#8B5CF6] rounded-full text-white font-bold text-sm shadow-lg shadow-purple-500/20 shrink-0">Salvar</button>
            </div>
            
            {/* NEW: EDITOR HELP PANEL */}
            {showEditorHelp && (
                <div className={`p-4 border-b animate-in slide-in-from-top duration-300 ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className={`text-xs font-bold uppercase mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Guia de Ferramentas</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/10"><Mic className="w-3 h-3"/></div>
                            <p className="text-xs"><span className="font-bold">Ditar:</span> Fale e a IA escreve.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/10"><ImageIcon className="w-3 h-3"/></div>
                            <p className="text-xs"><span className="font-bold">Galeria:</span> Adicione fotos.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/10"><Camera className="w-3 h-3"/></div>
                            <p className="text-xs"><span className="font-bold">Câmera:</span> Registre agora.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/10"><ScanText className="w-3 h-3"/></div>
                            <p className="text-xs"><span className="font-bold">Scanner:</span> Copie texto de livros.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/10"><MapPin className="w-3 h-3"/></div>
                            <p className="text-xs"><span className="font-bold">Local:</span> Lembrete ao chegar.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 relative">
                 <div className="flex justify-between items-start mb-4">
                    <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`}>{new Date(editorDate || (editorId ? entries.find(e=>e.id===editorId)!.createdAt : Date.now())).toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'})}</p>
                    <button onClick={() => setShowEventMenu(!showEventMenu)} className={`text-xs px-3 py-1.5 rounded-full border font-bold flex items-center gap-2 transition-all ${editorEvent ? 'bg-yellow-500 border-yellow-500 text-black' : (isDarkMode ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500')}`}>
                        <Flag className="w-3 h-3"/> {editorEvent ? 'Marco Destacado' : 'Marcar Momento'}
                    </button>
                 </div>
                 {(showEventMenu || editorEvent) && (
                     <div className={`p-4 rounded-2xl mb-6 border animate-in slide-in-from-top-2 ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                         <div className="flex justify-between items-center mb-3">
                             <h3 className="text-xs font-bold text-yellow-500 uppercase flex items-center gap-2"><Crown className="w-4 h-4"/> Acontecimento Importante</h3>
                             {editorEvent && <button onClick={() => setEditorEvent(undefined)} className="text-xs text-red-400 hover:underline">Remover</button>}
                         </div>
                         {!editorEvent ? (
                             <div className="grid grid-cols-2 gap-2">
                                 {EVENT_TYPES.map(type => (
                                     <button key={type.id} onClick={() => setEditorEvent({ title: type.label, type: type.id as any, icon: '' })} className={`p-3 rounded-xl border flex items-center gap-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-[#1E1B2E] border-white/10 text-gray-300 hover:border-yellow-500' : 'bg-white border-gray-200 text-gray-700 hover:border-yellow-500'}`}>
                                         <div className={`p-1.5 rounded-full ${type.color} text-white`}>{type.icon}</div>
                                         <span className="text-xs font-bold">{type.label}</span>
                                     </button>
                                 ))}
                             </div>
                         ) : (
                             <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-full text-white ${EVENT_TYPES.find(t => t.id === editorEvent.type)?.color}`}>
                                     {EVENT_TYPES.find(t => t.id === editorEvent.type)?.icon}
                                 </div>
                                 <input 
                                    value={editorEvent.title} 
                                    onChange={(e) => setEditorEvent({...editorEvent, title: e.target.value})}
                                    className={`flex-1 bg-transparent border-b border-dashed outline-none text-sm font-bold ${isDarkMode ? 'border-white/20 text-white' : 'border-gray-400 text-gray-900'}`}
                                    placeholder="Dê um título ao marco (Ex: Promoção!)"
                                    autoFocus
                                 />
                             </div>
                         )}
                     </div>
                 )}
                <input 
                   value={editorTitle} 
                   onChange={e => setEditorTitle(e.target.value)}
                   placeholder="Título da memória..."
                   className={`w-full bg-transparent text-2xl font-bold focus:outline-none mb-4 ${isDarkMode ? 'placeholder-white/40' : 'placeholder-gray-400'} ${FONTS.find(f => f.id === editorFont)?.class}`}
                   style={{ color: isDarkMode ? editorTextColor : (editorTextColor === '#FFFFFF' ? '#1a1a1a' : editorTextColor) }}
                />
                <div className={`p-4 rounded-2xl mb-6 border shadow-lg ${isDarkMode ? 'bg-[#1E1B2E] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-gray-100'}`}>
                     <div className="flex justify-between items-center gap-2 mb-4">
                        {MOODS.map(m => (
                            <button key={m.id} onClick={() => handleMoodChange(m.id)} className={`relative group flex flex-col items-center gap-2 transition-all duration-300 ${editorMood === m.id ? 'scale-110 z-10' : 'opacity-50 hover:opacity-80'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all ${editorMood === m.id ? 'ring-2 ring-offset-2 ring-offset-[#1E1B2E] ring-current' : ''}`} 
                                     style={{
                                         background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}80 100%)`,
                                         color: '#FFF'
                                     }}>
                                    <div className="w-6 h-6">{m.icon}</div>
                                </div>
                                <span className={`text-[10px] font-medium transition-opacity ${editorMood === m.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{color: isDarkMode ? '#AAA' : '#666'}}>{m.label}</span>
                            </button>
                        ))}
                    </div>
                    {isGeneratingQuestions && (
                        <div className="text-center py-2 text-xs animate-pulse text-[#8B5CF6] flex items-center justify-center gap-2">
                            <SparklesIcon className="w-3 h-3"/> Conectando com a Terapeuta IA...
                        </div>
                    )}
                    <div className="flex gap-2 flex-wrap pt-4 border-t border-dashed border-gray-500/20">
                        {TAGS.map(tag => (
                            <button key={tag} onClick={() => toggleEditorTag(tag)} className={`px-3 py-1 rounded-full text-xs border transition-all ${editorTags.includes(tag) ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : (isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500')}`}>
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
                {aiQuestions.length > 0 && (
                     <div className={`p-4 rounded-2xl mb-6 border border-dashed ${isDarkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                                <SparklesIcon className="w-3 h-3"/> Insights da Terapeuta IA
                            </h3>
                            <button onClick={refreshQuestions} className="p-1 rounded-full hover:bg-white/10"><RefreshCw className={`w-3 h-3 ${isGeneratingQuestions ? 'animate-spin' : ''}`}/></button>
                        </div>
                        <div className="space-y-2">
                            {aiQuestions.map((q, i) => (
                                <button key={i} onClick={() => insertQuestion(q)} className={`w-full text-left text-sm p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-indigo-900/40 text-indigo-100 hover:bg-indigo-900/60' : 'bg-white text-indigo-800 hover:bg-indigo-100 shadow-sm'}`}>
                                    {q}
                                </button>
                            ))}
                        </div>
                     </div>
                )}
                 <div className={`p-4 rounded-2xl mb-6 border ${isDarkMode ? 'bg-[#1E1B2E] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className={`flex items-center gap-2 mb-3 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        <CheckSquare className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Tarefas & Avisos</span>
                    </div>
                    <div className="space-y-2 mb-3">
                        {editorTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 group">
                                <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded border flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                    {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                </button>
                                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>{task.text}</span>
                                {task.reminderTime && (
                                    <span className="text-[10px] px-2 py-1 rounded bg-gray-500/20 text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3"/> {task.reminderTime}
                                    </span>
                                )}
                                <button onClick={() => deleteTask(task.id)} className="text-gray-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                         <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Nova tarefa..." className={`flex-1 text-sm px-3 py-2 rounded-lg border outline-none ${isDarkMode ? 'bg-[#13111C] text-white' : 'bg-gray-50 text-gray-900'}`} />
                         <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} className={`text-sm px-3 py-2 rounded-lg border outline-none w-24 ${isDarkMode ? 'bg-[#13111C] text-white' : 'bg-gray-50 text-gray-900'}`} />
                         <button onClick={addTask} className="p-2 bg-green-500 rounded-lg text-white"><PlusCircle className="w-5 h-5"/></button>
                    </div>
                </div>
                <textarea 
                    value={editorContent}
                    onChange={e => setEditorContent(e.target.value)}
                    placeholder="Escreva aqui..."
                    className={`w-full h-full bg-transparent focus:outline-none resize-none leading-relaxed pb-32 ${isDarkMode ? 'placeholder-white/30' : 'placeholder-gray-400'} ${FONTS.find(f => f.id === editorFont)?.class}`}
                    style={{ fontSize: `${editorFontSize}px`, color: isDarkMode ? editorTextColor : (editorTextColor === '#FFFFFF' ? '#1a1a1a' : editorTextColor) }}
                />
            </div>
            <div className="absolute bottom-0 w-full z-10">
                 {!showStyleMenu && (
                     <div className="p-4 flex justify-center">
                         <button onClick={() => setShowStyleMenu(true)} className={`px-6 py-2 backdrop-blur-md rounded-full text-sm font-bold flex items-center gap-2 border shadow-xl ${isDarkMode ? 'bg-black/40 text-white border-white/10' : 'bg-white/80 text-gray-800 border-gray-200'}`}>
                             <Palette className="w-4 h-4"/> Estilo
                         </button>
                     </div>
                 )}
                 {showStyleMenu && (
                     <div className={`rounded-t-3xl border-t p-6 animate-in slide-in-from-bottom ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200 shadow-2xl'}`}>
                         <div className="flex justify-between items-center mb-6">
                             <span className="text-sm font-bold text-gray-400 uppercase">Personalização</span>
                             <button onClick={() => setShowStyleMenu(false)}><X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}/></button>
                         </div>
                         <div className="space-y-6">
                             <div>
                                 <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Fonte</p>
                                 <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                                     {FONTS.map(f => (
                                         <button key={f.id} onClick={() => setEditorFont(f.id)} className={`px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap ${f.class} ${editorFont === f.id ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-gray-600 text-gray-400'}`}>
                                             {f.name}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Tema</p>
                                 <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                                     {THEMES.map(t => (
                                         <button key={t.id} onClick={() => setEditorTheme(t.id)} className={`px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap ${editorTheme === t.id ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-gray-600 text-gray-400'}`}>
                                             {t.name}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Ajustes</p>
                                    <span className="text-xs text-gray-400">{editorFontSize}px</span>
                                </div>
                                <div className="mb-4"><input type="range" min="14" max="32" value={editorFontSize} onChange={(e) => setEditorFontSize(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"/></div>
                                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                                    {['#FFFFFF', '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'].map(color => (
                                        <button key={color} onClick={() => setEditorTextColor(color)} className="w-8 h-8 rounded-full border-2 border-white/20" style={{backgroundColor: color}}></button>
                                    ))}
                                    {!isDarkMode && <button onClick={() => setEditorTextColor('#000000')} className="w-8 h-8 rounded-full border-2 border-gray-200 bg-black"></button>}
                                </div>
                             </div>
                         </div>
                     </div>
                 )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            {showLocationMenu && (
                <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
                    <div className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300 ${isDarkMode ? 'bg-[#1E1B2E] text-white' : 'bg-white text-gray-900'}`}>
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><MapPin className="w-5 h-5"/></div>
                                <h3 className="text-lg font-bold">Lembrete de Localização</h3>
                            </div>
                            <button onClick={() => setShowLocationMenu(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-6 h-6"/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                <span className="text-sm font-medium">Ativar lembretes por local</span>
                                <button onClick={() => setEditorLocationConfig({...editorLocationConfig, active: !editorLocationConfig.active})} 
                                    className={`w-12 h-6 rounded-full transition-colors relative ${editorLocationConfig.active ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editorLocationConfig.active ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className={!editorLocationConfig.active ? 'opacity-50 pointer-events-none' : ''}>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Definir Local</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500"/>
                                        <input 
                                            type="text" 
                                            placeholder="Buscar endereço ou local" 
                                            className={`w-full pl-10 p-3 rounded-xl text-sm outline-none border ${isDarkMode ? 'bg-[#13111C] border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                            value={editorLocationConfig.name}
                                            onChange={(e) => setEditorLocationConfig({...editorLocationConfig, name: e.target.value, address: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Locais Salvos</label>
                                    <div className="space-y-2">
                                        <button onClick={() => setEditorLocationConfig({...editorLocationConfig, name: 'Casa', address: 'Rua das Flores, 123'})} className={`w-full p-3 rounded-xl flex items-center justify-between border transition-colors ${editorLocationConfig.name === 'Casa' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Home className="w-4 h-4"/></div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">Casa</p>
                                                    <p className="text-[10px] text-gray-500">Rua das Flores, 123</p>
                                                </div>
                                            </div>
                                            {editorLocationConfig.name === 'Casa' && <CheckCircle className="w-5 h-5 text-[#8B5CF6]"/>}
                                        </button>
                                        <button onClick={() => setEditorLocationConfig({...editorLocationConfig, name: 'Trabalho', address: 'Av. Principal, 456'})} className={`w-full p-3 rounded-xl flex items-center justify-between border transition-colors ${editorLocationConfig.name === 'Trabalho' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400"><Briefcase className="w-4 h-4"/></div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">Trabalho</p>
                                                    <p className="text-[10px] text-gray-500">Av. Principal, 456</p>
                                                </div>
                                            </div>
                                            {editorLocationConfig.name === 'Trabalho' && <CheckCircle className="w-5 h-5 text-[#8B5CF6]"/>}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Lembrar-me quando eu...</label>
                                    <div className={`relative rounded-xl overflow-hidden border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                        <div className="absolute left-3 top-3.5 z-10 pointer-events-none text-gray-500"><Navigation className="w-4 h-4"/></div>
                                        <select 
                                            className={`w-full p-3 pl-10 outline-none appearance-none ${isDarkMode ? 'bg-[#13111C] text-white' : 'bg-gray-50 text-gray-900'}`}
                                            value={editorLocationConfig.condition}
                                            onChange={(e) => setEditorLocationConfig({...editorLocationConfig, condition: e.target.value as any})}
                                        >
                                            <option value="arrive">Chegar ao local</option>
                                            <option value="leave">Sair do local</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 rotate-90 pointer-events-none"/>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowLocationMenu(false)} className="w-full py-4 bg-[#8B5CF6] rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2">
                                Definir Lembrete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default App;
