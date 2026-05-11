export type ModuleId =
  | "habits"
  | "journal"
  | "health"
  | "deepwork"
  | "learning"
  | "trading"
  | "knowledge"
  | "goals"
  | "analytics";

export interface Module {
  id: ModuleId;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  color: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  category: string;
  color: string;
  streak: number;
  completions: Record<string, boolean>; // date -> done
  createdAt: string;
  customFields?: Record<string, any>;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  duration: number; // minutes
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface BodyStat {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  notes?: string;
}

export interface DeepWorkSession {
  id: string;
  date: string;
  task: string;
  category: string;
  duration: number; // minutes
  completed: boolean;
  notes?: string;
}

export interface LearningEntry {
  id: string;
  date: string;
  topic: string;
  category: string;
  duration: number; // minutes
  resource?: string;
  resourceUrl?: string;
  notes?: string;
  tags: string[];
}

export interface Trade {
  id: string;
  date: string;
  asset: string;
  direction: "long" | "short";
  entry: number;
  exit?: number;
  quantity: number;
  strategy: string;
  status: "open" | "closed";
  pnl?: number;
  riskReward?: number;
  notes?: string;
  tags: string[];
  stopLoss?: number;
  target?: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  url?: string;
  content?: string;
  category: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  deadline?: string;
  progress: number; // 0-100
  milestones: Milestone[];
  status: "active" | "completed" | "paused";
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface AppSettings {
  username: string;
  theme: {
    accentColor: string;
    goldColor: string;
    density: "compact" | "comfortable" | "spacious";
  };
  modules: Record<ModuleId, boolean>;
  dashboardLayout: string[];
}
