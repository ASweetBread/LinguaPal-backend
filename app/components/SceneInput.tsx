'use client'
import React, { useState } from 'react'
import { useAppStore } from '../store'

export default function SceneInput() {
  const [scene, setScene] = useState('')
  const { setDialogue, setIsLoading, isLoading } = useAppStore()

  const handleGenerateDialogue = async () => {
    if (!scene.trim()) {
      alert('请输入场景描述')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/generate-dialogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scene: scene.trim() }),
      })

      if (!response.ok) {
        throw new Error('API调用失败')
      }

      const data = await response.json()
      setDialogue(data.dialogue)
    } catch (error) {
      console.error('生成对话时出错:', error)
      alert('生成对话失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <label htmlFor="scene-input" className="block text-sm font-medium text-gray-700 mb-2">
        输入对话场景
      </label>
      <div className="flex gap-2">
        <input
          id="scene-input"
          type="text"
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          placeholder="例如：咖啡店点餐"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateDialogue}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '生成中...' : '生成对话'}
        </button>
      </div>
    </div>
  )
}