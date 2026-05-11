import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Habit, JournalEntry, WorkoutLog, BodyStat,
  DeepWorkSession, LearningEntry, Trade,
  KnowledgeItem, Goal, AppSettings, ModuleId
} from "@/types";

interface AppStore {
  // Settings
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  toggleModule: (id: ModuleId) => void;

  // Habits
  habits: Habit[];
  addHabit: (h: Omit<Habit, "id" | "streak" | "completions" | "createdAt">) => void;
  updateHabit: (id: string, h: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (e: Omit<JournalEntry, "id" | "createdAt">) => void;
  updateJournalEntry: (id: string, e: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;

  // Health
  workouts: WorkoutLog[];
  addWorkout: (w: Omit<WorkoutLog, "id">) => void;
  deleteWorkout: (id: string) => void;
  bodyStats: BodyStat[];
  addBodyStat: (s: Omit<BodyStat, "id">) => void;

  // Deep Work
  deepWorkSessions: DeepWorkSession[];
  addDeepWorkSession: (s: Omit<DeepWorkSession, "id">) => void;
  deleteDeepWorkSession: (id: string) => void;

  // Learning
  learningEntries: LearningEntry[];
  addLearningEntry: (e: Omit<LearningEntry, "id">) => void;
  deleteLearningEntry: (id: string) => void;

  // Trading
  trades: Trade[];
  addTrade: (t: Omit<Trade, "id">) => void;
  updateTrade: (id: string, t: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;

  // Knowledge
  knowledgeItems: KnowledgeItem[];
  addKnowledgeItem: (k: Omit<KnowledgeItem, "id" | "createdAt">) => void;
  updateKnowledgeItem: (id: string, k: Partial<KnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;
  toggleKnowledgePin: (id: string) => void;

  // Goals
  goals: Goal[];
  addGoal: (g: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

const defaultSettings: AppSettings = {
  username: "Trader",
  theme: { accentColor: "#0ABAB5", goldColor: "#D4AF37", density: "comfortable" },
  modules: {
    habits: true, journal: true, health: true, deepwork: true,
    learning: true, trading: true, knowledge: true, goals: true, analytics: true,
  },
  dashboardLayout: ["habits", "trading", "deepwork", "journal", "learning", "health", "knowledge", "goals"],
};

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
      toggleModule: (id) => set((st) => ({
        settings: {
          ...st.settings,
          modules: { ...st.settings.modules, [id]: !st.settings.modules[id] },
        },
      })),

      habits: [],
      addHabit: (h) => set((st) => ({
        habits: [...st.habits, { ...h, id: uuid(), streak: 0, completions: {}, createdAt: new Date().toISOString() }],
      })),
      updateHabit: (id, h) => set((st) => ({ habits: st.habits.map((x) => x.id === id ? { ...x, ...h } : x) })),
      deleteHabit: (id) => set((st) => ({ habits: st.habits.filter((x) => x.id !== id) })),
      toggleHabitCompletion: (id, date) => set((st) => ({
        habits: st.habits.map((h) => {
          if (h.id !== id) return h;
          const done = !h.completions[date];
          return { ...h, completions: { ...h.completions, [date]: done } };
        }),
      })),

      journalEntries: [],
      addJournalEntry: (e) => set((st) => ({
        journalEntries: [{ ...e, id: uuid(), createdAt: new Date().toISOString() }, ...st.journalEntries],
      })),
      updateJournalEntry: (id, e) => set((st) => ({ journalEntries: st.journalEntries.map((x) => x.id === id ? { ...x, ...e } : x) })),
      deleteJournalEntry: (id) => set((st) => ({ journalEntries: st.journalEntries.filter((x) => x.id !== id) })),

      workouts: [],
      addWorkout: (w) => set((st) => ({ workouts: [{ ...w, id: uuid() }, ...st.workouts] })),
      deleteWorkout: (id) => set((st) => ({ workouts: st.workouts.filter((x) => x.id !== id) })),
      bodyStats: [],
      addBodyStat: (s) => set((st) => ({ bodyStats: [{ ...s, id: uuid() }, ...st.bodyStats] })),

      deepWorkSessions: [],
      addDeepWorkSession: (s) => set((st) => ({ deepWorkSessions: [{ ...s, id: uuid() }, ...st.deepWorkSessions] })),
      deleteDeepWorkSession: (id) => set((st) => ({ deepWorkSessions: st.deepWorkSessions.filter((x) => x.id !== id) })),

      learningEntries: [],
      addLearningEntry: (e) => set((st) => ({ learningEntries: [{ ...e, id: uuid() }, ...st.learningEntries] })),
      deleteLearningEntry: (id) => set((st) => ({ learningEntries: st.learningEntries.filter((x) => x.id !== id) })),

      trades: [],
      addTrade: (t) => set((st) => ({ trades: [{ ...t, id: uuid() }, ...st.trades] })),
      updateTrade: (id, t) => set((st) => ({ trades: st.trades.map((x) => x.id === id ? { ...x, ...t } : x) })),
      deleteTrade: (id) => set((st) => ({ trades: st.trades.filter((x) => x.id !== id) })),

      knowledgeItems: [],
      addKnowledgeItem: (k) => set((st) => ({
        knowledgeItems: [{ ...k, id: uuid(), createdAt: new Date().toISOString() }, ...st.knowledgeItems],
      })),
      updateKnowledgeItem: (id, k) => set((st) => ({ knowledgeItems: st.knowledgeItems.map((x) => x.id === id ? { ...x, ...k } : x) })),
      deleteKnowledgeItem: (id) => set((st) => ({ knowledgeItems: st.knowledgeItems.filter((x) => x.id !== id) })),
      toggleKnowledgePin: (id) => set((st) => ({ knowledgeItems: st.knowledgeItems.map((x) => x.id === id ? { ...x, pinned: !x.pinned } : x) })),

      goals: [],
      addGoal: (g) => set((st) => ({ goals: [{ ...g, id: uuid(), createdAt: new Date().toISOString() }, ...st.goals] })),
      updateGoal: (id, g) => set((st) => ({ goals: st.goals.map((x) => x.id === id ? { ...x, ...g } : x) })),
      deleteGoal: (id) => set((st) => ({ goals: st.goals.filter((x) => x.id !== id) })),
    }),
    { name: "personal-os-store" }
  )
);
