'use client'
import React from 'react'
import { useAppStore } from '../store'

export default function DialogueDisplay() {
  const { dialogue } = useAppStore()
  if (!dialogue || dialogue.length === 0) {
    // 当没有对话时，不渲染该组件（返回 null）
    return null
  }

  // 解析对话内容，分离英文和中文部分
  const parseDialogueText = (text: string) => {
    const parts = text.split('\n')
    return {
      english: parts[0] || '',
      chinese: parts[1] || ''
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">生成的对话</h2>
      <div className="space-y-6">
        {dialogue.map((item, index) => {
          console.log('Rendering dialogue item:', item)
          const { english, chinese } = parseDialogueText(item.text)
          return (
            <div
              key={index}
              className={`rounded-lg shadow-sm overflow-hidden ${item.role === 'A' ? 'bg-blue-50' : 'bg-green-50'}`}
            >
              <div className={`px-4 py-2 ${item.role === 'A' ? 'bg-blue-100' : 'bg-green-100'}`}>
                <span className={`font-medium ${item.role === 'A' ? 'text-blue-700' : 'text-green-700'}`}>
                  角色 {item.role}
                </span>
              </div>
              <div className="p-4">
                <p className="text-gray-800 font-medium mb-2">{english}</p>
                <p className="text-gray-600">{chinese}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}