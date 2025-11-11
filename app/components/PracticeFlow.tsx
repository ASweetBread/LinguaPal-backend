"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../store'
import {
  markDifferencesByWord,
  isInputCorrect,
  calculateSimilarity
} from '../lib/utils/stringCompare'

type Task = {
  promptIndex: number
  targetIndex: number
}

const parseDialogueText = (text: string) => {
  const parts = text.split('\n')
  return {
    english: parts[0] || '',
    chinese: parts[1] || ''
  }
}

export default function PracticeFlow({ onFinish }: { onFinish?: () => void }) {
  const { dialogue } = useAppStore()

  // 本组件本地维护练习状态，避免使用全局store
  const [localPracticeStates, setLocalPracticeStates] = useState<Record<number, { passed: boolean | null; recognizedText: string }>>({})

  useEffect(() => {
    if (!dialogue) return
    const map: Record<number, { passed: boolean | null; recognizedText: string }> = {}
    dialogue.forEach((_, idx) => {
      map[idx] = { passed: null, recognizedText: '' }
    })
    setLocalPracticeStates(map)
  }, [dialogue])

  const [practiceRole, setPracticeRole] = useState<'A' | 'B'>('A')
  const [tasks, setTasks] = useState<Task[]>([])
  const [current, setCurrent] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(null)
  const [lastDiff, setLastDiff] = useState<{ word: string; correct: boolean }[]>([])

  // 错误队列：在一轮结束后若存在错误，会被用于下一轮复习
  const [errorQueue, setErrorQueue] = useState<Task[]>([])
  const [nextErrorQueue, setNextErrorQueue] = useState<Task[]>([])

  // 根据 practiceRole 构建任务队列（提示一方为 practiceRole，用户填写另一方）
  const buildTasksForRole = (role: 'A' | 'B') => {
    const res: Task[] = []
    for (let i = 0; i < dialogue.length; i++) {
      if (dialogue[i].role === role) {
        // 找到下一个不同角色作为目标
        let target = -1
        for (let j = i + 1; j < dialogue.length; j++) {
          if (dialogue[j].role !== role) {
            target = j
            break
          }
        }
        if (target !== -1) res.push({ promptIndex: i, targetIndex: target })
      }
    }
    return res
  }

  // 初始化任务
  useEffect(() => {
    if (!dialogue || dialogue.length === 0) return
    const t = buildTasksForRole(practiceRole)
    setTasks(t)
    setCurrent(0)
    setErrorQueue([])
    setNextErrorQueue([])
    setShowResult(false)
    setUserInput('')
    setLastResultCorrect(null)
  }, [dialogue, practiceRole])

  const currentTask = tasks[current]

  const onSubmit = () => {
    if (!currentTask) return
    const ref = parseDialogueText(dialogue[currentTask.targetIndex].text).english
    const input = userInput

    const correct = isInputCorrect(ref, input)
    const similarity = calculateSimilarity(ref, input)
    const diff = markDifferencesByWord(ref, input)

    setLastDiff(diff)
    setLastResultCorrect(correct)
    setShowResult(true)

    // 更新本地练习状态
    setLocalPracticeStates(prev => ({
      ...prev,
      [currentTask.targetIndex]: { passed: correct, recognizedText: input }
    }))

    if (!correct) {
      // 加入下一轮复习队列，避免重复加入
      setNextErrorQueue(prev => {
        if (prev.some(t => t.targetIndex === currentTask.targetIndex)) return prev
        return [...prev, currentTask]
      })
    }

    console.log('提交结果', { correct, similarity })
  }

  const onNext = () => {
    setShowResult(false)
    setUserInput('')
    setLastResultCorrect(null)
    setLastDiff([])

    const nextIndex = current + 1
    if (nextIndex < tasks.length) {
      setCurrent(nextIndex)
      return
    }

    // 本轮结束，检查是否有错误需要复习
    if (nextErrorQueue.length > 0) {
      // 进入错误复习，清空 nextErrorQueue 在开始新一轮之前
      setTasks(nextErrorQueue)
      setErrorQueue(nextErrorQueue)
      setNextErrorQueue([])
      setCurrent(0)
      return
    }

    // 如果没有错误且当前是 A 轮，则切换到 B；如果是 B 轮且无错误，则结束
    if (practiceRole === 'A') {
      setPracticeRole('B')
      // buildTasksForRole 会在 practiceRole effect 里被触发
      return
    }

    // 两个轮次都完成且无错误，练习结束
    if (onFinish) onFinish()
  }

  // 当处于错误复习阶段，如果用户答对则从 errorQueue 中剔除
  useEffect(() => {
    if (!showResult) return
    if (lastResultCorrect && errorQueue.length > 0) {
      // 从 errorQueue 移除当前任务
      setErrorQueue(prev => prev.filter(t => t.targetIndex !== currentTask?.targetIndex))
    }
  }, [showResult, lastResultCorrect])

  if (!dialogue || dialogue.length === 0) return null

  if (!currentTask) {
    return (
      <div className="p-4 bg-yellow-50 rounded-md">
        <p className="text-sm text-gray-700">当前没有可练习的句子（可能对话结构不完整）。</p>
      </div>
    )
  }

  const promptText = parseDialogueText(dialogue[currentTask.promptIndex].text).english
  const targetText = parseDialogueText(dialogue[currentTask.targetIndex].text).english
  const targetChinese = parseDialogueText(dialogue[currentTask.targetIndex].text).chinese

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">练习：展示 {practiceRole} 的句子，请填写另一方的回复</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">进度：{current + 1}/{tasks.length}</span>
          <button
            onClick={() => {
              // 直接结束练习并调用回调
              if (onFinish) onFinish()
            }}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
          >退出</button>
        </div>
      </div>

      <div className="p-4 mb-4 bg-white rounded shadow-sm">
        <div className="mb-2 text-sm text-gray-600">提示（{practiceRole}）：</div>
        <div className="mb-3 p-3 bg-gray-50 rounded border">{promptText}</div>

        <label className="block text-sm font-medium mb-2">请填写另一方的原句（英文）</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={3}
          className="w-full border rounded p-2 mb-3"
          disabled={showResult}
        />

        {/* 参考中文提示 */}
        <div className="mt-2 text-sm text-gray-600">参考中文：</div>
        <div className="p-2 bg-gray-50 rounded border mb-3">{targetChinese}</div>

        {!showResult && (
          <div className="flex gap-2">
            <button
              onClick={onSubmit}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >提交</button>
            <button
              onClick={() => {
                // 仅显示参考答案，不自动填充用户输入
                setShowResult(true)
                setLastResultCorrect(null)
                setLastDiff(markDifferencesByWord(targetText, userInput))
              }}
              className="px-3 py-1 bg-gray-200 rounded"
            >显示参考答案</button>
          </div>
        )}

        {showResult && (
          <div className="mt-4">
            <div className={`p-3 rounded ${lastResultCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">参考句（已标注差异）：</div>
              <div className="text-gray-800">
                {lastDiff.map((seg, idx) => (
                  <span
                    key={idx}
                    className={seg.correct ? 'px-0' : 'underline decoration-2 decoration-red-400 text-red-700'}
                  >
                    {seg.word}
                    {idx < lastDiff.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {!showResult ? (
              <>
                <div className="mt-3 text-sm text-gray-600">你的输入：</div>
                <div className="p-2 bg-gray-50 rounded border mt-1">{userInput || <em className="text-gray-400">（空）</em>}</div>
              </>
            ) : (
              // 当显示参考句时，隐藏用户输入区域（按需求）
              null
            )}

            <div className="mt-3 flex gap-2">
              <button onClick={onNext} className="px-3 py-1 bg-blue-600 text-white rounded">下一句</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
