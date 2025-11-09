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

// 定义句子练习状态类型
interface SentencePracticeState {
  index: number
  passed: boolean | null // null 表示未练习，true 表示通过，false 表示未通过
  recognizedText: string
}

// 定义应用状态类型
interface AppState {
  vocabulary: VocabularyItem[]
  currentScene: string
  dialogue: DialogueItem[]
  isLoading: boolean
  currentSentenceIndex: number
  sentencePracticeStates: SentencePracticeState[]
  addToVocabulary: (word: VocabularyItem) => void
  removeFromVocabulary: (id: string) => void
  setCurrentScene: (scene: string) => void
  setDialogue: (dialogue: DialogueItem[]) => void
  setIsLoading: (loading: boolean) => void
  setCurrentSentenceIndex: (index: number) => void
  updateSentencePracticeState: (index: number, state: Partial<SentencePracticeState>) => void
  resetPracticeStates: () => void
}

// 创建store，使用persist中间件保存到localStorage
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      vocabulary: [],
      currentScene: '',
      dialogue: [],
      isLoading: false,
      currentSentenceIndex: -1,
      sentencePracticeStates: [],
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
          sentencePracticeStates: dialogue.map((_, index) => ({
            index,
            passed: null,
            recognizedText: ''
          }))
        })),
      setIsLoading: (loading) =>
        set(() => ({
          isLoading: loading,
        })),
      setCurrentSentenceIndex: (index) =>
        set(() => ({
          currentSentenceIndex: index,
        })),
      updateSentencePracticeState: (index, state) =>
        set((prevState) => ({
          sentencePracticeStates: prevState.sentencePracticeStates.map(item =>
            item.index === index ? { ...item, ...state } : item
          )
        })),
      resetPracticeStates: () =>
        set((state) => ({
          sentencePracticeStates: state.dialogue.map((_, index) => ({
            index,
            passed: null,
            recognizedText: ''
          })),
          currentSentenceIndex: -1
        }))
    }),
    {
      name: 'lingua-pal-storage', // localStorage的key
    }
  )
)