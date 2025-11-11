import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DialogueItem } from "./types/dialogue";

// 定义单词类型
interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example: string;
  timestamp: number;
}

// 句子练习状态已由各组件各自维护，store 不再公开练习状态

// 定义应用状态类型
interface AppState {
  vocabulary: VocabularyItem[];
  currentScene: string;
  dialogue: DialogueItem[];
  isLoading: boolean;
  currentSentenceIndex: number;
  // 练习状态由组件本地管理，不在store中公开
  addToVocabulary: (word: VocabularyItem) => void;
  removeFromVocabulary: (id: string) => void;
  setCurrentScene: (scene: string) => void;
  setDialogue: (dialogue: DialogueItem[]) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentSentenceIndex: (index: number) => void;
  // update/reset practice state 已移至各组件本地实现
}

// 创建store，使用persist中间件保存到localStorage
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      vocabulary: [],
      currentScene: "",
      dialogue: [],
      isLoading: false,
      currentSentenceIndex: -1,
      addToVocabulary: (word) =>
        set((state) => ({
          vocabulary: [...state.vocabulary, word],
        })),
      removeFromVocabulary: (id) =>
        set((state) => ({
          vocabulary: state.vocabulary.filter((word) => word.id !== id),
        })),
      setCurrentScene: (scene) =>
        set(() => ({
          currentScene: scene,
        })),
      setDialogue: (dialogue) =>
        set(() => ({
          dialogue,
        })),
      setIsLoading: (loading) =>
        set(() => ({
          isLoading: loading,
        })),
      setCurrentSentenceIndex: (index) =>
        set(() => ({
          currentSentenceIndex: index,
        })),
      // practice state handled by components
    }),
    {
      name: "lingua-pal-storage", // localStorage的key
    },
  ),
);
