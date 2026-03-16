import { create } from "zustand";
import { translations, Language, TranslationKey } from "@/i18n/translations";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "en",
  setLanguage: (lang: Language) => set({ language: lang }),
  t: (key: TranslationKey) => {
    const lang = get().language;
    return (translations[lang] as Record<string, string>)[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  },
}));