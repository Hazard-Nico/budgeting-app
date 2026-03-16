import { create } from "zustand";

export const TUTORIAL_DONE_KEY = "okane_tutorial_done";
export const TUTORIAL_PENDING_KEY = "okane_tutorial_pending";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetId: string | null;
  placement: "top" | "bottom" | "left" | "right" | "center";
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Okane Kakeibo! 🎉",
    description: "Let's take a quick tour to help you get started with your budgeting journey.",
    targetId: null,
    placement: "center",
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "This is your main navigation panel. Use it to move between different sections of the app.",
    targetId: "tutorial-sidebar",
    placement: "right",
  },
  {
    id: "quick-add",
    title: "Quick Add Transaction",
    description: "Use this button to quickly log a new income or expense entry at any time.",
    targetId: "tutorial-quick-add",
    placement: "right",
  },
  {
    id: "balance",
    title: "Your Balance",
    description: "This card shows your current total balance, income, and expenses at a glance.",
    targetId: "tutorial-balance",
    placement: "bottom",
  },
  {
    id: "monthly-summary",
    title: "Monthly Summary",
    description: "Here you can see a breakdown of your income, expenses, savings, and net balance for the current month.",
    targetId: "tutorial-monthly-summary",
    placement: "left",
  },
  {
    id: "nav-transactions",
    title: "Transactions",
    description: "View, add, filter and manage all your financial transactions in one place.",
    targetId: "tutorial-nav-transactions",
    placement: "right",
  },
  {
    id: "nav-budgets",
    title: "Budgets",
    description: "Set monthly budgets per category and track how well you're sticking to your plan.",
    targetId: "tutorial-nav-budgets",
    placement: "right",
  },
  {
    id: "nav-trackers",
    title: "Goal Trackers",
    description: "Create savings goals and track your progress towards them over time.",
    targetId: "tutorial-nav-trackers",
    placement: "right",
  },
  {
    id: "nav-reports",
    title: "Reports",
    description: "Get detailed visual reports and analytics about your spending habits.",
    targetId: "tutorial-nav-reports",
    placement: "right",
  },
  {
    id: "nav-settings",
    title: "Settings",
    description: "Customize your currency, language, and other account preferences here.",
    targetId: "tutorial-nav-settings",
    placement: "right",
  },
  {
    id: "done",
    title: "You're all set! 🚀",
    description: "That's the full tour! Start by setting your initial balance and logging your first transaction. Happy budgeting!",
    targetId: null,
    placement: "center",
  },
];

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isActive: false,
  currentStep: 0,

  startTutorial: () => {
    set({ isActive: true, currentStep: 0 });
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      get().completeTutorial();
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  skipTutorial: () => {
    localStorage.setItem(TUTORIAL_DONE_KEY, "true");
    localStorage.removeItem(TUTORIAL_PENDING_KEY);
    set({ isActive: false, currentStep: 0 });
  },

  completeTutorial: () => {
    localStorage.setItem(TUTORIAL_DONE_KEY, "true");
    localStorage.removeItem(TUTORIAL_PENDING_KEY);
    set({ isActive: false, currentStep: 0 });
  },
}));