import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DialogueItem } from './types/dialogue'

// 定义单词类型
interface VocabularyItem {
  id: string
  word: string
  definition: string
  example: string
  timestamp: number
}

// 定义应用状态类型
interface AppState {
  vocabulary: VocabularyItem[]
  currentScene: string
  dialogue: DialogueItem[]
  isLoading: boolean
  addToVocabulary: (word: VocabularyItem) => void
  removeFromVocabulary: (id: string) => void
  setCurrentScene: (scene: string) => void
  setDialogue: (dialogue: DialogueItem[]) => void
  setIsLoading: (loading: boolean) => void
}

// 创建store，使用persist中间件保存到localStorage
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      vocabulary: [],
      currentScene: '',
      dialogue: [],
      isLoading: false,
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
    }),
    {
      name: 'lingua-pal-storage', // localStorage的key
    }
  )
)