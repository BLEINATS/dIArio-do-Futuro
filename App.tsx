
import React, { useState, useEffect, useRef } from 'react';
import { DiaryEntry, UserProgress, IWindow, Achievement, Reward, DailyChallenge, FontStyle, ThemeStyle, BookConfig, Task, LocationConfig, ImportantEvent } from './types';
import { refineText, scanImageToText, getDailyQuote, generateBookStory, generateDailyChallenge, generateTherapeuticQuestions, generateAbundanceMantra } from './services/geminiService';
import { 
  Home, Book, BarChart2, User, Plus, Search, Settings, Calendar as CalendarIcon, 
  Mic, Camera, X, ChevronRight, ChevronLeft, Zap, Lock, Smile, CloudRain, Sun, 
  Trash2, LogOut, Image as ImageIcon, Type, Palette, MapPin, Share2, Headphones,
  Award, Flame, Crown, PenTool, CheckCircle, ArrowRight, StickyNote, ArrowLeft,
  Bell, Clock, MessageSquare, Cloud, RefreshCw, Smartphone, Fingerprint, Shield, 
  Download, HelpCircle, CreditCard, Moon, Database, Tag, ScanText, Edit3, Printer, 
  FileText, Sparkles as SparklesIcon, CheckSquare, PlusCircle, Circle, Coins,
  Gift, Star, Target, Heart, Briefcase, Navigation, Flag, Trophy, Users, Gem
} from 'lucide-react';

// Helper Icon wrapper
const Sparkles = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 9h4"/><path d="M3 5h4"/></svg>
);

// --- Constants & Data ---

const MOODS = [
  { 
    id: 'terrible', 
    label: 'Raiva', 
    color: '#F87171', // Red
    reaction: "Respire fundo. Solte essa energia...",
    effect: 'shake',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <style>{`
          @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
          .angry-face { animation: shake 0.5s infinite; }
        `}</style>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#F87171"/>
        <g className="angry-face">
            <path d="M7 9L10 11" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M17 9L14 11" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8.5" cy="12" r="1.5" fill="#1F2937"/>
            <circle cx="15.5" cy="12" r="1.5" fill="#1F2937"/>
            <rect x="9" y="15" width="6" height="2" rx="1" stroke="#1F2937" strokeWidth="1.5" fill="none"/>
        </g>
      </svg>
    )
  },
  { 
    id: 'bad', 
    label: 'Mal', 
    color: '#FDBA74', // Orange
    reaction: "Está tudo bem não estar bem. Vai passar.",
    effect: 'rain',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <style>{`
          @keyframes blink-sad { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
          @keyframes frown { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(0.5px); } }
          .eye-sad { transform-origin: center; animation: blink-sad 4s infinite; }
          .mouth-sad { animation: frown 3s infinite ease-in-out; }
        `}</style>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#FDBA74"/>
        <circle className="eye-sad" cx="7.5" cy="10" r="1.5" fill="#1F2937"/>
        <circle className="eye-sad" cx="16.5" cy="10" r="1.5" fill="#1F2937"/>
        <path d="M6 8C7 7.5 8 8 8 8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 8C17 7.5 16 8 16 8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
        <path className="mouth-sad" d="M15 15C15 15 13.5 14 12 14C10.5 14 9 15 9 15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    id: 'neutral', 
    label: 'Normal', 
    color: '#E9D5FF', // Lavender
    reaction: "Um dia tranquilo é um presente.",
    effect: 'breathe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
         <style>{`
          @keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
          @keyframes shift { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-1px); } 75% { transform: translateX(1px); } }
          .eye { transform-origin: center; animation: blink 5s infinite; }
          .mouth-line { animation: shift 4s infinite ease-in-out; }
        `}</style>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#E9D5FF"/>
        <circle className="eye" cx="8" cy="10" r="1.5" fill="#1F2937"/>
        <circle className="eye" cx="16" cy="10" r="1.5" fill="#1F2937"/>
        <rect className="mouth-line" x="9" y="15" width="6" height="1.5" rx="0.75" fill="#1F2937"/>
      </svg>
    )
  },
  { 
    id: 'good', 
    label: 'Bem', 
    color: '#93C5FD', // Light Blue
    reaction: "Que bom te ver feliz! Aproveite essa energia.",
    effect: 'confetti',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <style>{`
          @keyframes bounce-face { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1px); } }
          .face-features { animation: bounce-face 2s infinite ease-in-out; }
        `}</style>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#93C5FD"/>
        <g className="face-features">
            <path d="M7 10C7 10 8 8.5 9 8.5C10 8.5 11 10 11 10" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M13 10C13 10 14 8.5 15 8.5C16 8.5 17 10 17 10" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 14C9 14 10 15.5 12 15.5C14 15.5 15 14 15 14" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="6.5" cy="11.5" r="1" fill="#FCA5A5" opacity="0.6"/>
            <circle cx="17.5" cy="11.5" r="1" fill="#FCA5A5" opacity="0.6"/>
        </g>
      </svg>
    )
  },
  { 
    id: 'awesome', 
    label: 'Ótimo', 
    color: '#6EE7B7', // Mint
    reaction: "Uau! Você está radiante hoje!",
    effect: 'stars',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <style>{`
          @keyframes glint { 0% { transform: translateX(-10px); opacity: 0; } 20% { opacity: 0.8; } 40% { transform: translateX(10px); opacity: 0; } 100% { opacity: 0; } }
          .shine { animation: glint 3s infinite linear; }
        `}</style>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#6EE7B7"/>
        <g>
            <path d="M4 11H20V13C20 15.2091 18.2091 17 16 17H8C5.79086 17 4 15.2091 4 13V11Z" fill="#111827"/>
            <path d="M12 11V10" stroke="#111827" strokeWidth="2"/>
            <path className="shine" d="M14 11L17 14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            <path className="shine" d="M6 11L9 14" stroke="white" strokeWidth="2" strokeLinecap="round" style={{animationDelay: '0.2s'}} opacity="0.5"/>
        </g>
        <path d="M9 18C9 18 10 19 12 19C14 19 15 18 15 18" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
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

const GENRES = {
    'Romance': ['Contemporâneo', 'Histórico', 'Drama'],
    'Aventura': ['Viagem', 'Sobrevivência', 'Exploração'],
    'Ficção': ['Científica', 'Fantasia', 'Distopia'],
    'Mistério': ['Suspense', 'Policial', 'Noir'],
    'Pessoal': ['Biografia', 'Memórias', 'Reflexivo']
};

const ONBOARDING_STEPS = [
  { title: "Bem-vindo ao Diário IA", desc: "Seu confidente digital com alma de papel e inteligência artificial.", icon: <Book className="w-16 h-16 text-purple-500"/> },
  { title: "Crie Memórias", desc: "Escreva, fale ou escaneie suas páginas físicas. Adicione fotos e adesivos.", icon: <PenTool className="w-16 h-16 text-blue-500"/> },
  { title: "Tarefas e Metas", desc: "Organize seu dia com listas de tarefas e defina lembretes importantes.", icon: <CheckSquare className="w-16 h-16 text-green-500"/> },
  { title: "Personalize Tudo", desc: "Fontes, temas e adesivos para deixar seu diário com a sua cara.", icon: <Palette className="w-16 h-16 text-pink-500"/> },
  { title: "Humor e Metas", desc: "Acompanhe seu bem-estar emocional com insights inteligentes.", icon: <Smile className="w-16 h-16 text-yellow-500"/> },
  { title: "Seu Livro IA", desc: "Transforme suas memórias em narrativas e livros emocionantes.", icon: <Sparkles className="w-16 h-16 text-purple-500"/> },
];

const ABUNDANCE_EXERCISES = [
  { id: 'positive_aspects', title: 'Livro de Aspectos Positivos', desc: 'Escreva sobre o que você é grato hoje e aspectos positivos.', action: 'write', tag: 'Positividade' },
  { id: 'gratitude_list', title: 'A Lista da Gratidão', desc: 'Liste 10 coisas pelas quais você se sente grato.', action: 'write', tag: 'Gratidão' },
  { id: 'visualization', title: 'Visualização da Abundância', desc: 'Visualize-se vivendo em um estado de abundância.', action: 'check' },
  { id: 'declarations', title: 'Declarações de Prosperidade', desc: 'Repita afirmações como "Eu atraio prosperidade facilmente".', action: 'mantra' },
  { id: 'reframing', title: 'Reenquadramento Positivo', desc: 'Reenquadre um pensamento de escassez em oportunidade.', action: 'check' }
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_entry', title: 'Primeira Entrada', description: 'Crie sua primeira entrada no diário', icon: <PenTool className="w-6 h-6"/>, color: 'text-blue-500 bg-blue-500/20', progress: 1, total: 1, completed: true, xpReward: 50 },
    { id: '7_days', title: 'Diário de 7 Dias', description: 'Escreva por 7 dias seguidos', icon: <CalendarIcon className="w-6 h-6"/>, color: 'text-purple-500 bg-purple-500/20', progress: 4, total: 7, completed: false, xpReward: 150 },
    { id: 'first_book', title: 'Meu Primeiro Livro IA', description: 'Compile suas primeiras 50 entradas', icon: <Book className="w-6 h-6"/>, color: 'text-yellow-500 bg-yellow-500/20', progress: 12, total: 50, completed: false, xpReward: 500 },
    { id: 'mood_master', title: 'Humor Consistente', description: 'Registre seu humor por 30 dias', icon: <Smile className="w-6 h-6"/>, color: 'text-pink-500 bg-pink-500/20', progress: 15, total: 30, completed: false, xpReward: 300 },
    { id: 'abundance_init', title: 'Iniciado na Prosperidade', description: 'Complete o ritual de abundância', icon: <Coins className="w-6 h-6"/>, color: 'text-amber-500 bg-amber-500/20', progress: 1, total: 1, completed: true, xpReward: 100 },
    { id: 'photo_memory', title: 'Memória Fotográfica', description: 'Adicione 10 fotos ao diário', icon: <ImageIcon className="w-6 h-6"/>, color: 'text-cyan-500 bg-cyan-500/20', progress: 3, total: 10, completed: false, xpReward: 100 },
];

const MOCK_REWARDS: Reward[] = [
    { id: 'theme_nature', title: 'Tema "Natureza"', type: 'theme', imageUrl: '', isUnlocked: true, requiredLevel: 1 },
    { id: 'stickers_cosmic', title: 'Adesivos Cósmicos', type: 'sticker_pack', imageUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712555.png', isUnlocked: false, requiredLevel: 3 },
    { id: 'icon_writer', title: 'Ícone "Escritor"', type: 'icon', imageUrl: '', isUnlocked: false, requiredLevel: 5 },
    { id: 'stickers_vintage', title: 'Adesivos Vintage', type: 'sticker_pack', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2665/2665402.png', isUnlocked: false, requiredLevel: 8 },
];

const App: React.FC = () => {
  // --- Global State ---
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'diary' | 'book' | 'analytics' | 'profile'>('home');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({ xp: 0, level: 1, isPro: false, streak: 1, entriesCount: 0, joinedAt: Date.now() });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [appFont, setAppFont] = useState<FontStyle>('inter');
  
  // Home State
  const [dailyMood, setDailyMood] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState("Carregando inspiração...");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTimelineOnly, setShowTimelineOnly] = useState(false); // New state for Timeline filter
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMoodId, setCelebrationMoodId] = useState<string | null>(null);
  const [streakPulse, setStreakPulse] = useState(false);

  // Abundance State
  const [abundanceCompleted, setAbundanceCompleted] = useState<string[]>([]);
  const [showGoldReward, setShowGoldReward] = useState(false);
  const [activeMantra, setActiveMantra] = useState<string | null>(null);
  const [loadingMantra, setLoadingMantra] = useState(false);

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
  const [editorEvent, setEditorEvent] = useState<ImportantEvent | undefined>(undefined); // New state
  const [showEventMenu, setShowEventMenu] = useState(false); // New state

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Therapeutic Questions State
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Settings State
  const [settingsNotifications, setSettingsNotifications] = useState(true);
  const [settingsBackup, setSettingsBackup] = useState(true);
  const [settingsBiometrics, setSettingsBiometrics] = useState(true);
  const [settingsThemeMode, setSettingsThemeMode] = useState('dark');
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementTab, setAchievementTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  useEffect(() => {
    const storedOnboarding = localStorage.getItem('onboarding_complete');
    if (storedOnboarding) setHasSeenOnboarding(true);

    const storedEntries = localStorage.getItem('diary_entries');
    if (storedEntries) setEntries(JSON.parse(storedEntries));

    const storedProgress = localStorage.getItem('user_progress');
    if (storedProgress) setUserProgress(JSON.parse(storedProgress));
    
    const todayKey = new Date().toLocaleDateString();
    const storedAbundance = localStorage.getItem(`abundance_${todayKey}`);
    if (storedAbundance) setAbundanceCompleted(JSON.parse(storedAbundance));

    loadDailyEssentials();
  }, []);

  useEffect(() => {
    localStorage.setItem('diary_entries', JSON.stringify(entries));
    localStorage.setItem('user_progress', JSON.stringify({ ...userProgress, entriesCount: entries.length }));
  }, [entries, userProgress]);
  
  useEffect(() => {
      const todayKey = new Date().toLocaleDateString();
      localStorage.setItem(`abundance_${todayKey}`, JSON.stringify(abundanceCompleted));
      
      if (abundanceCompleted.length === ABUNDANCE_EXERCISES.length && !showGoldReward) {
          setShowGoldReward(true);
          setTimeout(() => setShowGoldReward(false), 4000);
          setUserProgress(prev => ({ ...prev, xp: prev.xp + 100 }));
      }
  }, [abundanceCompleted]);

  useEffect(() => {
    setSettingsThemeMode(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const loadDailyEssentials = async () => {
    const challenge = await generateDailyChallenge();
    setDailyChallenge({
      id: new Date().toISOString().split('T')[0],
      date: new Date().toISOString(),
      prompt: challenge,
      completed: false
    });
    
    const quote = await getDailyQuote('gratidão');
    setDailyQuote(quote);
  };

  // --- Logic ---

  const getFilteredEntries = () => {
    return entries.filter(entry => {
      const matchesSearch = (entry.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             entry.title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = selectedTag ? entry.tags?.includes(selectedTag) : true;
      const matchesTimeline = showTimelineOnly ? !!entry.importantEvent : true;
      return matchesSearch && matchesTag && matchesTimeline;
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
      importantEvent: editorEvent // Save event
    };

    if (editorId) {
        setEntries(entries.map(e => e.id === editorId ? newEntry : e));
    } else {
        setEntries([newEntry, ...entries]);
        setUserProgress(prev => ({
            ...prev,
            xp: prev.xp + 50,
            level: Math.floor((prev.xp + 50) / 1000) + 1
        }));
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

  const openEditorWithPrompt = () => {
    if (dailyChallenge) {
      setEditorContent(`Desafio do Dia: ${dailyChallenge.prompt}\n\n`);
      setEditorTags(['Desafio']);
      setIsEditorOpen(true);
    }
  };
  
  const openEditorForAbundance = (title: string, tag: string, prompt: string) => {
      resetEditor();
      setEditorTitle(title);
      setEditorTags(['Abundância', tag]);
      setEditorContent(prompt + "\n\n");
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
      
      setUserProgress(prev => ({
          ...prev,
          xp: prev.xp + 10
      }));

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

  const handleThemeChange = (mode: 'light' | 'dark' | 'paper') => {
    setSettingsThemeMode(mode);
    if (mode === 'light') {
        setIsDarkMode(false);
    } else if (mode === 'dark') {
        setIsDarkMode(true);
    } else if (mode === 'paper') {
        setIsDarkMode(false);
    }
  };
  
  const handleMantraGeneration = async () => {
      setLoadingMantra(true);
      const mantra = await generateAbundanceMantra();
      setActiveMantra(mantra);
      setLoadingMantra(false);
  };

  // --- Sub-Components ---
  
  const Onboarding = () => {
    const [step, setStep] = useState(0);

    const nextStep = () => {
      if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
      else {
        localStorage.setItem('onboarding_complete', 'true');
        setHasSeenOnboarding(true);
      }
    };

    return (
      <div className="fixed inset-0 z-[100] bg-[#13111C] flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-8 animate-bounce">{ONBOARDING_STEPS[step].icon}</div>
        <h1 className="text-3xl font-bold mb-4 text-white">{ONBOARDING_STEPS[step].title}</h1>
        <p className="text-gray-400 mb-12 text-lg leading-relaxed max-w-xs mx-auto">{ONBOARDING_STEPS[step].desc}</p>
        <div className="flex gap-2 mb-12">
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-[#8B5CF6]' : 'w-2 bg-white/20'}`} />
          ))}
        </div>
        <button onClick={nextStep} className="w-full max-w-xs py-4 bg-[#8B5CF6] rounded-2xl font-bold text-white shadow-xl shadow-purple-900/40">
          {step === ONBOARDING_STEPS.length - 1 ? 'Começar Jornada' : 'Próximo'}
        </button>
      </div>
    );
  };
  
  // Full Book Creator Implementation
  const BookCreator = () => {
      const [step, setStep] = useState(0);
      const [bookConfig, setBookConfig] = useState<BookConfig>({ genre: 'Romance' });
      const [isGenerating, setIsGenerating] = useState(false);
      const [generatedBook, setGeneratedBook] = useState<{title: string, content: string} | null>(null);
      
      const steps = ['Configuração', 'Narrativa', 'Geração'];

      const handleGenerate = async () => {
          setStep(2);
          setIsGenerating(true);
          
          // Filter entries by date if provided
          let filteredEntries = entries;
          if (bookConfig.startDate && bookConfig.endDate) {
              const start = new Date(bookConfig.startDate).getTime();
              const end = new Date(bookConfig.endDate).getTime();
              filteredEntries = entries.filter(e => e.createdAt >= start && e.createdAt <= end);
          }

          // Sort entries
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

      return (
          <div className={`flex flex-col h-full p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {!generatedBook ? (
                  <>
                      <div className="flex justify-between items-center mb-8">
                          {steps.map((s, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= i ? 'bg-[#8B5CF6] text-white' : 'bg-gray-700 text-gray-400'}`}>
                                      {i + 1}
                                  </div>
                                  <span className={`text-[10px] uppercase ${step >= i ? 'text-[#8B5CF6]' : 'text-gray-500'}`}>{s}</span>
                              </div>
                          ))}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto">
                          {step === 0 && (
                              <div className="space-y-6 animate-in fade-in">
                                  <h2 className="text-2xl font-bold mb-4">Configuração do Livro</h2>
                                  
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Período (Opcional)</label>
                                      <div className="flex gap-4">
                                          <input type="date" className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`} onChange={(e) => setBookConfig({...bookConfig, startDate: e.target.value})} />
                                          <input type="date" className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`} onChange={(e) => setBookConfig({...bookConfig, endDate: e.target.value})} />
                                      </div>
                                  </div>

                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Gênero Literário</label>
                                      <div className="grid grid-cols-2 gap-3">
                                          {Object.keys(GENRES).map(g => (
                                              <button 
                                                  key={g} 
                                                  onClick={() => setBookConfig({...bookConfig, genre: g, subGenre: GENRES[g as keyof typeof GENRES][0]})}
                                                  className={`p-4 rounded-xl border text-left transition-all ${bookConfig.genre === g ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : (isDarkMode ? 'bg-[#1E1B2E] border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600')}`}
                                              >
                                                  <span className="font-bold block">{g}</span>
                                              </button>
                                          ))}
                                          <button 
                                               onClick={() => setBookConfig({...bookConfig, genre: 'Outro'})}
                                               className={`p-4 rounded-xl border text-left transition-all ${bookConfig.genre === 'Outro' ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : (isDarkMode ? 'bg-[#1E1B2E] border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600')}`}
                                          >
                                              <span className="font-bold block">Outro (Personalizado)</span>
                                          </button>
                                      </div>
                                  </div>

                                  {bookConfig.genre !== 'Outro' && (
                                      <div>
                                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Subgênero</label>
                                          <div className="flex gap-2 flex-wrap">
                                              {GENRES[bookConfig.genre as keyof typeof GENRES]?.map(sub => (
                                                  <button 
                                                      key={sub}
                                                      onClick={() => setBookConfig({...bookConfig, subGenre: sub})}
                                                      className={`px-4 py-2 rounded-full border text-xs font-bold ${bookConfig.subGenre === sub ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-gray-500 text-gray-500'}`}
                                                  >
                                                      {sub}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {bookConfig.genre === 'Outro' && (
                                      <div>
                                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Descreva o Gênero</label>
                                          <input 
                                              placeholder="Ex: Horror Cósmico, Cyberpunk..." 
                                              className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}
                                              onChange={(e) => setBookConfig({...bookConfig, customGenre: e.target.value})}
                                          />
                                      </div>
                                  )}
                              </div>
                          )}

                          {step === 1 && (
                              <div className="space-y-6 animate-in fade-in">
                                  <h2 className="text-2xl font-bold mb-4">Detalhes da Narrativa</h2>
                                  
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Personagens Principais</label>
                                      <textarea 
                                          placeholder="Liste os personagens (ex: Eu (Protagonista), Sarah (Melhor Amiga)...)" 
                                          className={`w-full p-3 rounded-xl border outline-none h-24 ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}
                                          onChange={(e) => setBookConfig({...bookConfig, characters: e.target.value})}
                                      />
                                  </div>

                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Temas Centrais</label>
                                      <input 
                                          placeholder="Ex: Superação, Amor, Viagem..." 
                                          className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}
                                          onChange={(e) => setBookConfig({...bookConfig, themes: e.target.value})}
                                      />
                                  </div>

                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Sua Orientação para a IA</label>
                                      <textarea 
                                          placeholder="Dê instruções especiais para a IA (ex: 'Foque nos meus sentimentos', 'Seja poético', 'Use humor')..." 
                                          className={`w-full p-3 rounded-xl border outline-none h-24 ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}
                                          onChange={(e) => setBookConfig({...bookConfig, userGuidance: e.target.value})}
                                      />
                                  </div>
                              </div>
                          )}

                          {step === 2 && (
                              <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in">
                                  <div className="w-24 h-24 relative mb-8">
                                      <div className="absolute inset-0 border-4 border-[#8B5CF6]/30 rounded-full"></div>
                                      <div className="absolute inset-0 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                                      <Book className="absolute inset-0 m-auto w-8 h-8 text-[#8B5CF6] animate-pulse" />
                                  </div>
                                  <h2 className="text-2xl font-bold mb-2">Escrevendo sua História...</h2>
                                  <p className="text-gray-500 max-w-xs mx-auto">A IA está analisando suas memórias, conectando os pontos e criando uma narrativa única.</p>
                                  
                                  <div className="mt-8 text-sm font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 px-4 py-2 rounded-full">
                                      Fase: {isGenerating ? "Criando Rascunho..." : "Finalizando..."}
                                  </div>
                              </div>
                          )}
                      </div>

                      {step < 2 && (
                          <div className="mt-6 flex gap-4">
                              {step > 0 && (
                                  <button onClick={() => setStep(step - 1)} className="flex-1 py-4 rounded-xl font-bold border border-gray-500/20 text-gray-500">
                                      Voltar
                                  </button>
                              )}
                              <button onClick={step === 1 ? handleGenerate : () => setStep(step + 1)} className="flex-1 py-4 bg-[#8B5CF6] rounded-xl font-bold text-white shadow-lg shadow-purple-900/20">
                                  {step === 1 ? 'Gerar Livro' : 'Próximo'}
                              </button>
                          </div>
                      )}
                  </>
              ) : (
                  <div className="h-full flex flex-col animate-in zoom-in duration-500">
                      <div className="flex justify-between items-center mb-6">
                          <button onClick={() => setGeneratedBook(null)} className="flex items-center gap-2 text-gray-500 hover:text-white"><ArrowLeft className="w-5 h-5"/> Voltar</button>
                          <div className="flex gap-2">
                              <button className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700"><Printer className="w-5 h-5"/></button>
                              <button className="p-2 rounded-full bg-[#8B5CF6] text-white hover:bg-purple-600"><Download className="w-5 h-5"/></button>
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto bg-[#fdfbf7] text-gray-900 p-8 rounded-xl shadow-2xl font-serif leading-relaxed max-w-2xl mx-auto w-full">
                           <div className="text-center mb-12 pb-12 border-b-2 border-gray-200">
                               <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">UMA MEMÓRIA DE</p>
                               <h1 className="text-4xl font-bold mb-4 text-black">{generatedBook.title}</h1>
                               <p className="italic text-gray-500">Escrito por Você & IA</p>
                           </div>
                           <div className="prose prose-lg mx-auto text-gray-800 whitespace-pre-line">
                               {generatedBook.content}
                           </div>
                           <div className="mt-12 pt-12 border-t border-gray-200 text-center text-gray-400 text-sm italic">
                               Fim do Capítulo
                           </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };


  if (!hasSeenOnboarding) return <Onboarding />;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#13111C] text-white' : 'bg-gray-50 text-gray-900'} relative ${FONTS.find(f => f.id === appFont)?.class || 'font-sans'} overflow-hidden`}>
      
      <style>{`
        @keyframes mood-glow {
          0%, 100% { box-shadow: 0 0 5px var(--mood-color), inset 0 0 2px var(--mood-color); border-color: var(--mood-color); }
          50% { box-shadow: 0 0 2px var(--mood-color), inset 0 0 1px var(--mood-color); border-color: transparent; }
        }
        .animate-mood-border {
          animation: mood-glow 3s ease-in-out infinite;
        }
        @keyframes rain { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        .rain-drop { position: absolute; width: 1px; background: rgba(147, 197, 253, 0.5); animation: rain 1s linear infinite; }
        @keyframes confetti { 0% { transform: translateY(-100vh) rotate(0deg); } 100% { transform: translateY(100vh) rotate(720deg); } }
        .confetti-piece { position: absolute; width: 8px; height: 8px; animation: confetti 3s ease-in infinite; }
        @keyframes breathe-circle { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.5); opacity: 0; } }
        .breathe-ring { position: absolute; border-radius: 50%; border: 2px solid white; animation: breathe-circle 4s infinite; }
        @keyframes screen-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .shake-screen { animation: screen-shake 0.5s ease-in-out infinite; }
      `}</style>
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center 
            ${celebrationMoodId === 'terrible' ? 'shake-screen bg-red-900/20' : ''}
            ${celebrationMoodId === 'bad' ? 'bg-blue-900/20' : ''}
            ${celebrationMoodId === 'neutral' ? 'bg-purple-900/20' : ''}
            ${celebrationMoodId === 'good' || celebrationMoodId === 'awesome' ? 'bg-yellow-500/10' : ''}
        `}>
            {celebrationMoodId === 'bad' && Array.from({length: 20}).map((_, i) => (
                <div key={i} className="rain-drop" style={{left: Math.random()*100+'%', animationDuration: 0.5+Math.random()+'s', height: 10+Math.random()*20+'px'}}></div>
            ))}
            {(celebrationMoodId === 'good' || celebrationMoodId === 'awesome') && Array.from({length: 50}).map((_, i) => (
                <div key={i} className="confetti-piece" style={{left: Math.random()*100+'%', background: ['#FCD34D', '#F87171', '#60A5FA', '#A78BFA'][Math.floor(Math.random()*4)], animationDuration: 2+Math.random()+'s'}}></div>
            ))}
            {celebrationMoodId === 'neutral' && (
                <div className="breathe-ring w-64 h-64"></div>
            )}

            <div className="bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
                 <div className="w-24 h-24 mx-auto mb-4 animate-bounce text-white">
                     {MOODS.find(m => m.id === celebrationMoodId)?.icon}
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-2">Humor Registrado!</h2>
                 <p className="text-[#8B5CF6] font-bold text-xl mb-2">+10 XP</p>
                 <p className="text-gray-300 text-sm italic">"{MOODS.find(m => m.id === celebrationMoodId)?.reaction}"</p>
            </div>
        </div>
      )}

      {/* Gold Reward Overlay */}
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
      
      {activeTab === 'home' && (
        <div className={`px-6 pt-10 pb-4 flex justify-between items-center ${isDarkMode ? 'bg-[#13111C]' : 'bg-gray-50'} z-10`}>
          <div onClick={() => setShowAchievements(true)} className="cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
                <div className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-transform ${streakPulse ? 'animate-pulse scale-110 shadow-yellow-500/50 shadow-lg' : ''}`}>
                    <Flame className="w-3 h-3 fill-white" /> {userProgress.streak}
                </div>
                <div className="bg-[#2D2A4A] text-[#8B5CF6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Lvl {userProgress.level}
                </div>
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Diário IA</h1>
          </div>
          <div className="flex gap-3">
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
             <div 
                className={`mx-6 rounded-3xl p-6 border relative overflow-hidden shadow-lg group transition-all duration-500`}
                style={{
                   background: dailyMood ? `linear-gradient(135deg, ${MOODS.find(m => m.id === dailyMood)?.color}20 0%, ${isDarkMode ? '#1E1B2E' : '#FFFFFF'} 100%)` : undefined,
                   borderColor: dailyMood ? MOODS.find(m => m.id === dailyMood)?.color + '40' : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6')
                }}
            >
              {/* ... Daily Inspiration Content ... */}
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
                    <p className="text-xs text-gray-400">Seu humor hoje:</p>
                    <div className="flex gap-3 justify-between mt-1">
                    {MOODS.map((mood) => (
                        <button
                        key={mood.id}
                        onClick={() => handleHomeMoodSelect(mood.id)}
                        className={`flex flex-col items-center gap-1 transition-all duration-500 ${dailyMood === mood.id ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        >
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${dailyMood === mood.id ? 'shadow-lg scale-110' : ''}`}
                              style={{
                                  backgroundColor: dailyMood === mood.id ? mood.color : 'transparent',
                                  color: dailyMood === mood.id ? '#13111C' : (isDarkMode ? mood.color : mood.color)
                              }}
                         >
                           <div className="w-6 h-6" style={{color: dailyMood === mood.id ? '#13111C' : 'inherit'}}>
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
             {/* Search & Filters */}
            <div className="space-y-3 mx-6">
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
                <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center">
                    <button 
                        onClick={() => setShowTimelineOnly(!showTimelineOnly)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${showTimelineOnly ? 'bg-yellow-500 border-yellow-500 text-black' : `${isDarkMode ? 'bg-[#1E1B2E] border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}`}
                    >
                        <Flag className="w-3 h-3"/> Linha do Tempo
                    </button>
                    <div className="w-px h-6 bg-gray-500/20 mx-1"></div>
                    {TAGS.map(tag => (
                        <button 
                            key={tag} 
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-4 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${selectedTag === tag ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : `${isDarkMode ? 'bg-[#1E1B2E] border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
             {/* Entries Carousel */}
            <div>
              <h2 className={`text-lg font-bold mb-4 px-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{showTimelineOnly ? 'Sua Jornada de Vida' : 'Recentes'}</h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-6 -mx-0 snap-x snap-mandatory">
                {getFilteredEntries().length === 0 ? (
                     <div className="min-w-full text-center py-10 opacity-50 border border-dashed border-white/10 rounded-2xl mx-6">
                        <p className="text-gray-400">Nenhuma memória encontrada.</p>
                     </div>
                ) : (
                    getFilteredEntries().slice(0, 10).map(entry => {
                        const hasImage = entry.images && entry.images.length > 0;
                        const coverImage = hasImage ? entry.images![0] : null;
                        const moodColor = MOODS.find(m => m.id === entry.mood)?.color || '#8B5CF6';
                        const moodIcon = MOODS.find(m => m.id === entry.mood)?.icon;
                        const isImportant = !!entry.importantEvent;

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
                                style={{ '--mood-color': moodColor } as React.CSSProperties}
                                className={`
                                    relative flex-shrink-0 w-[85vw] sm:w-72 h-80 rounded-3xl snap-center overflow-hidden border-2 shadow-lg active:scale-[0.98] transition-transform
                                    ${isImportant ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'animate-mood-border'}
                                    ${!hasImage ? (isDarkMode ? 'bg-[#1E1B2E]' : 'bg-white') : ''}
                                `}
                            >
                                {isImportant && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-lg flex items-center gap-1">
                                        <Crown className="w-3 h-3"/> MARCO
                                    </div>
                                )}

                                {moodIcon && (
                                    <div className="absolute top-3 right-3 z-20">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/10 ${hasImage ? 'bg-black/30 backdrop-blur-md' : (isDarkMode ? 'bg-white/5' : 'bg-gray-100')}`}>
                                            <div className="w-5 h-5">
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
                                             <span className="text-xs font-bold text-gray-500 uppercase">{new Date(entry.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${!hasImage ? 'flex-1 min-h-0' : 'max-h-[75%]'}`}>
                                        {entry.importantEvent && (
                                            <span className="text-[10px] text-yellow-400 font-bold uppercase mb-1 flex items-center gap-1">
                                                {EVENT_TYPES.find(t => t.id === entry.importantEvent?.type)?.icon}
                                                {entry.importantEvent.type}
                                            </span>
                                        )}
                                        <h3 className={`font-bold mb-2 leading-tight shrink-0 ${hasImage ? 'text-2xl text-white' : (isDarkMode ? 'text-xl text-white' : 'text-xl text-gray-900')}`}>{entry.title}</h3>
                                        <div className="overflow-y-auto pr-1 mb-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
                                            <p className={`text-sm whitespace-pre-wrap ${hasImage ? 'text-gray-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{entry.content}</p>
                                        </div>
                                        
                                        {/* Task Preview in Card */}
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
                                                            <span className={hasImage ? 'text-white' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}>{t.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
        {activeTab === 'analytics' && (
            <div className="p-6 animate-in fade-in">
               {/* Analytics Content */}
               <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Suas Metas</h2>
               <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-slate-900 to-amber-950 p-6 shadow-xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                                <Coins className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-amber-100">Jornada da Prosperidade</h3>
                        </div>
                        <p className="text-amber-200/70 text-sm mb-6">Complete os rituais diários para desbloquear abundância.</p>
                        
                        <div className="space-y-3">
                            {ABUNDANCE_EXERCISES.map(ex => {
                                const isDone = abundanceCompleted.includes(ex.id);
                                return (
                                    <div key={ex.id} className={`p-4 rounded-xl border transition-all duration-300 ${isDone ? 'bg-amber-900/40 border-amber-500/50' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`font-bold ${isDone ? 'text-amber-400' : 'text-gray-200'}`}>{ex.title}</h4>
                                            <button 
                                                onClick={() => handleAbundanceCheck(ex.id)}
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isDone ? 'bg-amber-500 border-amber-500' : 'border-gray-500'}`}
                                            >
                                                {isDone && <CheckCircle className="w-4 h-4 text-white" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-3">{ex.desc}</p>
                                        {ex.action === 'write' && !isDone && (
                                            <button onClick={() => openEditorForAbundance(ex.title, ex.tag || 'Abundância', ex.desc)} className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition-colors">
                                                Escrever no Diário
                                            </button>
                                        )}
                                        {ex.action === 'mantra' && !isDone && (
                                            <button onClick={handleMantraGeneration} className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-1">
                                                {loadingMantra ? 'Gerando...' : 'Gerar Mantra'} <SparklesIcon className="w-3 h-3"/>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'profile' && (
             <div className="p-6 animate-in fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-pink-500 p-1 shadow-xl">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200" alt="Profile" className="w-full h-full object-cover"/>
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Usuário</h2>
                        <p className="text-[#8B5CF6] text-sm font-bold">Membro Pro</p>
                    </div>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className={`p-4 rounded-2xl text-center border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <span className="block text-2xl font-bold text-white">{userProgress.entriesCount}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Memórias</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-center border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                         <span className="block text-2xl font-bold text-[#8B5CF6]">{userProgress.streak}</span>
                         <span className="text-[10px] text-gray-400 uppercase tracking-wider">Dias</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-center border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                         <span className="block text-2xl font-bold text-yellow-500">{userProgress.level}</span>
                         <span className="text-[10px] text-gray-400 uppercase tracking-wider">Nível</span>
                    </div>
                </div>
                
                {/* Modern Mood Board */}
                <div className="mb-8">
                    <h3 className={`text-sm font-bold text-gray-500 uppercase mb-4`}>Mood Board Mensal</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Hero Card */}
                        <div className="col-span-2 p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden shadow-lg text-white">
                            <div className="relative z-10">
                                <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Vibe Predominante</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 text-white">
                                        {MOODS[2].icon} {/* Defaulting to neutral/good if no data, in real app calculate mode */}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold">Equilíbrio</h4>
                                        <p className="text-indigo-100 text-xs">Você manteve a constância este mês.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </div>
                        
                        {/* Palette Card */}
                        <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100'}`}>
                            <p className="text-gray-500 text-[10px] font-bold uppercase mb-3">Sua Paleta</p>
                            <div className="flex h-16 rounded-xl overflow-hidden">
                                {MOODS.map(m => (
                                    <div key={m.id} className="flex-1 h-full" style={{backgroundColor: m.color}}></div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Top Tag Card */}
                        <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100'}`}>
                             <p className="text-gray-500 text-[10px] font-bold uppercase mb-3">Foco Principal</p>
                             <div className="text-center py-2">
                                 <span className="text-2xl font-bold text-[#8B5CF6]">#Gratidão</span>
                             </div>
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowAchievements(true)} className={`w-full py-4 rounded-2xl border flex items-center justify-between px-6 group hover:border-[#8B5CF6] transition-colors ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500 group-hover:scale-110 transition-transform"><Award className="w-6 h-6"/></div>
                        <div className="text-left">
                            <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Conquistas</h4>
                            <p className="text-xs text-gray-400">3 de 12 Desbloqueadas</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500"/>
                </button>
            </div>
        )}
      </div>
      
      {/* Bottom Nav */}
      <div className={`h-20 backdrop-blur-md border-t flex items-center px-6 justify-between z-20 absolute bottom-0 w-full ${isDarkMode ? 'bg-[#13111C]/95 border-white/5' : 'bg-white/95 border-gray-200'}`}>
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><Home className="w-6 h-6"/><span className="text-[10px] mt-1">Início</span></button>
        <button onClick={() => setActiveTab('book')} className={`flex flex-col items-center ${activeTab === 'book' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><Book className="w-6 h-6"/><span className="text-[10px] mt-1">Livro</span></button>
        <div className="-mt-10">
          <button onClick={() => {resetEditor(); setIsEditorOpen(true)}} className="w-16 h-16 bg-[#8B5CF6] rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-600/40 hover:scale-110 transition-transform"><Plus className="w-8 h-8" /></button>
        </div>
        <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center ${activeTab === 'analytics' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><BarChart2 className="w-6 h-6"/><span className="text-[10px] mt-1">Metas</span></button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-[#8B5CF6]' : 'text-gray-500'}`}><User className="w-6 h-6"/><span className="text-[10px] mt-1">Perfil</span></button>
      </div>

      {/* --- EDITOR MODAL --- */}
      {isEditorOpen && (
        <div className={`fixed inset-0 z-50 ${THEMES.find(t => t.id === editorTheme)?.bg || 'bg-[#13111C]'} flex flex-col animate-in slide-in-from-bottom duration-300`}>
            <div className={`flex items-center justify-between p-4 backdrop-blur-md ${isDarkMode ? 'bg-black/20' : 'bg-white/80 border-b border-gray-200'}`}>
                <button onClick={() => setIsEditorOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}><X className="w-6 h-6"/></button>
                <div className="flex items-center gap-3">
                    <button onClick={handleSpeechToText} className={`p-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse text-white' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600')}`}><Mic className="w-5 h-5"/></button>
                    <div className={`w-px h-6 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}><ImageIcon className="w-5 h-5"/></button>
                    <button onClick={handleCameraPhoto} className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}><Camera className="w-5 h-5"/></button>
                    <div className={`w-px h-6 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <button onClick={handleOCR} className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}><ScanText className="w-5 h-5"/></button>
                    <button onClick={() => { setShowLocationMenu(true); }} className={`p-2 rounded-full ${editorLocationConfig.active ? 'bg-green-500 text-white' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600')}`}><MapPin className="w-5 h-5"/></button>
                </div>
                <button onClick={handleSaveEntry} className="px-4 py-2 bg-[#8B5CF6] rounded-full text-white font-bold text-sm shadow-lg shadow-purple-500/20">Salvar</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
                 <div className="flex justify-between items-start mb-4">
                    <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`}>{new Date(editorDate || (editorId ? entries.find(e=>e.id===editorId)!.createdAt : Date.now())).toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'})}</p>
                    <button onClick={() => setShowEventMenu(!showEventMenu)} className={`text-xs px-3 py-1.5 rounded-full border font-bold flex items-center gap-2 transition-all ${editorEvent ? 'bg-yellow-500 border-yellow-500 text-black' : (isDarkMode ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500')}`}>
                        <Flag className="w-3 h-3"/> {editorEvent ? 'Marco Destacado' : 'Marcar Momento'}
                    </button>
                 </div>

                 {/* EVENT SELECTION MENU */}
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
                
                {/* Mood Selector */}
                <div className={`p-4 rounded-2xl mb-6 border shadow-lg ${isDarkMode ? 'bg-[#1E1B2E] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-gray-100'}`}>
                     <div className="flex justify-between items-center gap-2 mb-4">
                        {MOODS.map(m => (
                            <button key={m.id} onClick={() => handleMoodChange(m.id)} className={`relative group flex flex-col items-center gap-2 transition-all duration-300 ${editorMood === m.id ? 'scale-110 z-10' : 'opacity-50 hover:opacity-80'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editorMood === m.id ? 'ring-2 ring-current' : ''}`} style={{color: isDarkMode ? '#FFF' : '#333'}}>{m.icon}</div>
                                <span className={`text-[10px] font-medium transition-opacity ${editorMood === m.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{color: isDarkMode ? '#AAA' : '#666'}}>{m.label}</span>
                            </button>
                        ))}
                    </div>
                    {isGeneratingQuestions && (
                        <div className="text-center py-2 text-xs animate-pulse text-[#8B5CF6] flex items-center justify-center gap-2">
                            <SparklesIcon className="w-3 h-3"/> Conectando com a Terapeuta...
                        </div>
                    )}
                    {/* Tags Selector */}
                    <div className="flex gap-2 flex-wrap pt-4 border-t border-dashed border-gray-500/20">
                        {TAGS.map(tag => (
                            <button key={tag} onClick={() => toggleEditorTag(tag)} className={`px-3 py-1 rounded-full text-xs border transition-all ${editorTags.includes(tag) ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : (isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500')}`}>
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Therapeutic Questions */}
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

                {/* Tasks */}
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
                
                {/* Main Text Area */}
                <textarea 
                    value={editorContent}
                    onChange={e => setEditorContent(e.target.value)}
                    placeholder="Escreva aqui..."
                    className={`w-full h-full bg-transparent focus:outline-none resize-none leading-relaxed pb-32 ${isDarkMode ? 'placeholder-white/30' : 'placeholder-gray-400'} ${FONTS.find(f => f.id === editorFont)?.class}`}
                    style={{ fontSize: `${editorFontSize}px`, color: isDarkMode ? editorTextColor : (editorTextColor === '#FFFFFF' ? '#1a1a1a' : editorTextColor) }}
                />
            </div>

            <div className="absolute bottom-0 w-full z-10">
                {/* Style Menu Button */}
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
                             {/* Fonts */}
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

                             {/* Themes */}
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

                             {/* Size & Color */}
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

            {/* LOCATION MENU OVERLAY */}
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
                            {/* Toggle Switch */}
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
      
      {activeMantra && (
          <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
              <div className="w-full max-w-md bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl p-8 shadow-2xl border-4 border-amber-400 relative overflow-hidden animate-in zoom-in duration-300">
                  <div className="absolute top-4 right-4 z-20">
                       <button onClick={() => setActiveMantra(null)} className="p-2 rounded-full bg-amber-900/10 hover:bg-amber-900/20 text-amber-900"><X className="w-6 h-6"/></button>
                  </div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/30 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-400/30 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <SparklesIcon className="w-8 h-8"/>
                      </div>
                      <h3 className="text-amber-900 font-serif text-xl mb-2 font-bold uppercase tracking-widest">Seu Mantra de Riqueza</h3>
                      <p className="text-amber-800/60 text-sm mb-8">Repita em voz alta 3 vezes</p>
                      
                      <div className="mb-8 py-6 border-y-2 border-amber-900/10">
                          <p className="text-2xl sm:text-3xl font-bold text-amber-900 leading-tight font-serif italic">
                              "{activeMantra}"
                          </p>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveMantra(null);
                            setAbundanceCompleted(prev => {
                                if(prev.includes('declarations')) return prev;
                                return [...prev, 'declarations'];
                            });
                        }} 
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl font-bold text-black shadow-lg shadow-amber-900/50 hover:scale-105 transition-transform cursor-pointer relative z-10"
                      >
                          Está Feito!
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SETTINGS MODAL - FULL IMPLEMENTATION */}
      {isSettingsOpen && (
          <div className={`fixed inset-0 z-[60] ${isDarkMode ? 'bg-[#13111C]' : 'bg-gray-50'} flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto`}>
              <div className={`p-6 flex items-center gap-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'} sticky top-0 bg-inherit z-10`}>
                 <button onClick={() => setIsSettingsOpen(false)}><ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}/></button>
                 <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configurações</h2>
             </div>
             
             <div className="p-6 space-y-8 pb-24">
                 {/* Subscription */}
                 <section>
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Assinatura</h3>
                     <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                         <div className="relative z-10">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <p className="text-gray-300 text-xs uppercase">Plano Atual</p>
                                     <h4 className="text-xl font-bold text-white">Plano Pro</h4>
                                 </div>
                                 <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white border border-white/20">Ativo</span>
                             </div>
                             <p className="text-indigo-200 text-sm mb-4">Sua assinatura será renovada em 15 de Julho de 2024.</p>
                             <div className="space-y-2">
                                 <button className="w-full py-3 bg-white text-purple-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                                     <SparklesIcon className="w-4 h-4"/> Gerenciar Assinatura
                                 </button>
                                 <button className="w-full py-3 bg-transparent text-white border border-white/20 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                                     <CreditCard className="w-4 h-4"/> Histórico de Pagamentos
                                 </button>
                             </div>
                         </div>
                         <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
                     </div>
                 </section>

                 {/* Reminders */}
                 <section>
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Lembretes do Diário</h3>
                     <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                         <div className="p-4 flex items-center justify-between border-b border-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Bell className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Lembretes Diários</span>
                             </div>
                             <button onClick={() => setSettingsNotifications(!settingsNotifications)} className={`w-12 h-6 rounded-full transition-colors relative ${settingsNotifications ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settingsNotifications ? 'left-7' : 'left-1'}`}></div>
                             </button>
                         </div>
                         <button className="w-full p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Clock className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Horário do Lembrete</span>
                             </div>
                             <div className="flex items-center gap-2 text-gray-500">
                                 <span>20:00</span>
                                 <ChevronRight className="w-4 h-4"/>
                             </div>
                         </button>
                         <button className="w-full p-4 flex items-center justify-between hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><MessageSquare className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Mensagem Personalizada</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500"/>
                         </button>
                     </div>
                 </section>

                 {/* Backup */}
                 <section>
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Backup e Restauração</h3>
                     <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                         <div className="p-4 flex items-center justify-between border-b border-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><RefreshCw className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Backup Automático</span>
                             </div>
                             <button onClick={() => setSettingsBackup(!settingsBackup)} className={`w-12 h-6 rounded-full transition-colors relative ${settingsBackup ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settingsBackup ? 'left-7' : 'left-1'}`}></div>
                             </button>
                         </div>
                         <button className="w-full p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400"><Cloud className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Fazer Backup Agora</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500"/>
                         </button>
                         <button className="w-full p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Database className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Restaurar do Backup</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500"/>
                         </button>
                     </div>
                 </section>

                 {/* Appearance */}
                 <section>
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Aparência e Personalização</h3>
                     <div className={`p-4 rounded-2xl border mb-4 ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                         <div className="flex items-center gap-3 mb-4">
                             <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Palette className="w-5 h-5"/></div>
                             <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Tema</span>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => handleThemeChange('light')} className={`py-2 rounded-lg border text-sm font-medium ${settingsThemeMode === 'light' ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-gray-600 text-gray-400'}`}>Claro</button>
                             <button onClick={() => handleThemeChange('dark')} className={`py-2 rounded-lg border text-sm font-medium ${settingsThemeMode === 'dark' ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-gray-600 text-gray-400'}`}>Escuro</button>
                             <button onClick={() => handleThemeChange('paper')} className={`py-2 rounded-lg border text-sm font-medium ${settingsThemeMode === 'paper' ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-gray-600 text-gray-400'}`}>Papel</button>
                         </div>
                     </div>
                     <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Type className="w-5 h-5"/></div>
                                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Fonte</span>
                            </div>
                            <span className="text-sm text-gray-400">Lora</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Tamanho da Fonte</span>
                            <span className="text-sm text-gray-400">16px</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">Tt</span>
                            <input type="range" className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]" />
                            <span className="text-lg text-gray-500">Tt</span>
                        </div>
                     </div>
                 </section>

                 {/* Security */}
                 <section>
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Segurança e Privacidade</h3>
                     <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                         <div className="p-4 flex items-center justify-between border-b border-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><Fingerprint className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Bloqueio por Biometria</span>
                             </div>
                             <button onClick={() => setSettingsBiometrics(!settingsBiometrics)} className={`w-12 h-6 rounded-full transition-colors relative ${settingsBiometrics ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
                                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settingsBiometrics ? 'left-7' : 'left-1'}`}></div>
                             </button>
                         </div>
                         <button className="w-full p-4 flex items-center justify-between hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-gray-500/20 rounded-lg text-gray-400"><Shield className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Política de Privacidade</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500"/>
                         </button>
                     </div>
                 </section>

                 {/* Data Management */}
                 <section>
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Gerenciamento de Dados</h3>
                     <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                         <button className="w-full p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Share2 className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Exportar Entradas</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500"/>
                         </button>
                         <button className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 group">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-5 h-5"/></div>
                                 <span className="text-red-400 group-hover:text-red-500">Apagar todos os dados</span>
                             </div>
                         </button>
                     </div>
                 </section>

                 {/* Support */}
                 <section>
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Conta e Suporte</h3>
                     <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200'}`}>
                         <button className="w-full p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><HelpCircle className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Ajuda e Suporte</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-500"/>
                         </button>
                         <button className="w-full p-4 flex items-center justify-between hover:bg-white/5">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-gray-500/20 rounded-lg text-gray-400"><LogOut className="w-5 h-5"/></div>
                                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Fazer Logout</span>
                             </div>
                         </button>
                     </div>
                 </section>
             </div>
          </div>
      )}
      
      {/* Achievements Modal */}
      {showAchievements && (
         <div className={`fixed inset-0 z-[70] ${isDarkMode ? 'bg-[#13111C]' : 'bg-gray-50'} flex flex-col animate-in slide-in-from-right duration-300`}>
             <div className={`p-6 flex items-center gap-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                 <button onClick={() => setShowAchievements(false)}><ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}/></button>
                 <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Minhas Conquistas</h2>
             </div>
             
             <div className="p-6 flex-1 overflow-y-auto">
                 {/* Tabs */}
                 <div className="flex p-1 rounded-xl bg-gray-800/50 mb-8">
                     <button onClick={() => setAchievementTab('all')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${achievementTab === 'all' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-gray-400'}`}>Todas</button>
                     <button onClick={() => setAchievementTab('unlocked')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${achievementTab === 'unlocked' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-gray-400'}`}>Desbloqueadas</button>
                     <button onClick={() => setAchievementTab('locked')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${achievementTab === 'locked' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-gray-400'}`}>Bloqueadas</button>
                 </div>
                 
                 <div className="mb-8">
                     <h3 className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Conquistas</h3>
                     <div className="space-y-4">
                         {MOCK_ACHIEVEMENTS.filter(a => achievementTab === 'all' ? true : (achievementTab === 'unlocked' ? a.completed : !a.completed)).map(ach => (
                             <div key={ach.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${ach.completed ? (isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200') : 'opacity-60 grayscale bg-transparent border-dashed border-gray-600'}`}>
                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ach.color}`}>
                                     {ach.completed ? ach.icon : <Lock className="w-5 h-5"/>}
                                 </div>
                                 <div className="flex-1">
                                     <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ach.title}</h4>
                                     <p className="text-xs text-gray-500">{ach.description}</p>
                                     <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                         <div className="h-full bg-[#8B5CF6]" style={{width: `${(ach.progress/ach.total)*100}%`}}></div>
                                     </div>
                                     <p className="text-[10px] text-right mt-1 text-gray-500">{ach.progress}/{ach.total}</p>
                                 </div>
                                 {ach.completed && <CheckCircle className="w-6 h-6 text-green-500"/>}
                             </div>
                         ))}
                     </div>
                 </div>
                 
                 <div>
                     <h3 className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Minhas Recompensas</h3>
                     <div className="grid grid-cols-2 gap-4">
                         {MOCK_REWARDS.map(reward => (
                             <div key={reward.id} className={`p-4 rounded-2xl border text-center relative overflow-hidden ${reward.isUnlocked ? (isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200') : 'opacity-50 bg-transparent border-dashed border-gray-600'}`}>
                                 {!reward.isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10"><Lock className="text-white w-8 h-8"/></div>}
                                 {reward.isUnlocked && <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#8B5CF6] text-white text-[8px] font-bold rounded-full">NOVO</div>}
                                 <div className="w-full aspect-square bg-gray-800/50 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                                     {reward.imageUrl ? <img src={reward.imageUrl} className="w-full h-full object-cover"/> : <Sparkles className="w-8 h-8 text-gray-500"/>}
                                 </div>
                                 <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reward.title}</p>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
         </div>
      )}
      
      {/* CALENDAR MODAL */}
      {isCalendarOpen && (
        <div className={`fixed inset-0 z-[60] ${isDarkMode ? 'bg-[#13111C]/95' : 'bg-white/95'} backdrop-blur-md flex items-center justify-center p-6`}>
            <div className={`w-full max-w-sm ${isDarkMode ? 'bg-[#1E1B2E] border-white/10' : 'bg-white border-gray-200 shadow-2xl'} rounded-3xl border p-6 animate-in zoom-in duration-300`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Calendário</h2>
                    <button onClick={() => setIsCalendarOpen(false)} className="p-2 rounded-full hover:bg-gray-500/10"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-500/10"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="font-bold text-lg capitalize">{currentCalendarDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-500/10"><ChevronRight className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <span key={d} className="text-xs font-bold text-gray-500">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: getFirstDayOfMonth(currentCalendarDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: getDaysInMonth(currentCalendarDate) }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day).toDateString();
                        const hasEntry = entries.some(e => new Date(e.createdAt).toDateString() === dateStr);
                        return (
                            <button 
                                key={day} 
                                onClick={() => handleDateClick(day)}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all hover:bg-[#8B5CF6]/20 ${hasEntry ? 'font-bold text-[#8B5CF6]' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                            >
                                {day}
                                {hasEntry && <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
