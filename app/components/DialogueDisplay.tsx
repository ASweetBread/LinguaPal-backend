'use client'
import React, { useRef, useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { recognizeSpeech as recognizeSpeechApi } from '../lib/apiCalls';
import useRecord from '../lib/hooks/useRecord';
import PracticeFlow from './PracticeFlow'
import { calculateSimilarity } from '../lib/utils/stringCompare'

export default function DialogueDisplay() {
  const { 
    dialogue, 
    currentSentenceIndex, 
    setCurrentSentenceIndex,
    sentencePracticeStates,
    updateSentencePracticeState,
    resetPracticeStates
  } = useAppStore()
  
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // 使用录音Hook
  const {
    isRecording,
    audioUrl,
    startRecording: startRecord,
    stopRecording: stopRecord
  } = useRecord({
    onRecordingComplete: (audioData) => {
      if (currentSentenceIndex !== -1) {
        recognizeSpeech(audioData, currentSentenceIndex);
      }
    }
  });
  const [showPractice, setShowPractice] = useState(false)
  
  if (!dialogue || dialogue.length === 0) {
    // 当没有对话时，不渲染该组件（返回 null）
    return null
  }

  if (showPractice) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <PracticeFlow onFinish={() => setShowPractice(false)} />
      </div>
    )
  }

  // 解析对话内容，分离英文和中文部分
  const parseDialogueText = (text: string) => {
    const parts = text.split('\n')
    return {
      english: parts[0] || '',
      chinese: parts[1] || ''
    }
  }
  
  
  // 开始录音
  const startRecording = async (sentenceIndex: number) => {
    try {
      setCurrentSentenceIndex(sentenceIndex);
      await startRecord();
    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请确保已授予权限');
    }
  }
  
  // 停止录音
  const stopRecording = () => {
    stopRecord();
  }
  
  // 调用语音识别API
  const recognizeSpeech = async (audioData: string, sentenceIndex: number) => {
    try {
      const data = await recognizeSpeechApi(audioData)
      const { recognizedText } = data
      
      // 调用相似度检查
      checkSimilarity(recognizedText, sentenceIndex)
      
    } catch (error) {
      console.error('语音识别失败:', error)
      alert('语音识别失败，请稍后重试')
    }
  }
  
  // 检查相似度（在客户端执行）
  const checkSimilarity = (recognizedText: string, sentenceIndex: number) => {
    try {
      const sentence = dialogue[sentenceIndex]
      const { english } = parseDialogueText(sentence.text)
      
      // 在客户端计算相似度
      const similarity = calculateSimilarity(recognizedText, english)
      const passed = similarity >= 70 // 70% 相似度视为通过
      
      // 更新状态
      updateSentencePracticeState(sentenceIndex, {
        recognizedText,
        passed
      })
      
    } catch (error) {
      console.error('相似度检查失败:', error)
    }
  }
  
  // 播放原句
  const playOriginalSentence = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(parseDialogueText(text).english)
    utterance.lang = 'en-US'
    speechSynthesis.speak(utterance)
  }
  
  // 获取句子的练习状态
  const getSentenceState = (index: number) => {
    return sentencePracticeStates.find(state => state.index === index) || {
      passed: null,
      recognizedText: ''
    }
  }
  
  // 重置所有练习状态
  const handleResetPractice = () => {
    resetPracticeStates()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">生成的对话</h2>
        <div>
          <button
            onClick={() => setShowPractice(true)}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >开始对话练习</button>
        </div>
      </div>
      <div className="space-y-6">
        {dialogue.map((item, index) => {
          const { english, chinese } = parseDialogueText(item.text)
          const sentenceState = getSentenceState(index)
          const isCurrentRecording = isRecording && currentSentenceIndex === index
          
          // 根据练习状态确定背景色
          let bgColorClass = item.role === 'A' ? 'bg-blue-50' : 'bg-green-50'
          if (sentenceState.passed === true) {
            bgColorClass = 'bg-green-100'
          } else if (sentenceState.passed === false) {
            bgColorClass = 'bg-red-50'
          } else if (isCurrentRecording) {
            bgColorClass = 'bg-yellow-50'
          }
          
          return (
            <div
              key={index}
              className={`rounded-lg shadow-sm overflow-hidden ${bgColorClass} transition-colors`}
            >
              <div className={`px-4 py-2 ${item.role === 'A' ? 'bg-blue-100' : 'bg-green-100'}`}>
                <span className={`font-medium ${item.role === 'A' ? 'text-blue-700' : 'text-green-700'}`}>
                  角色 {item.role}
                </span>
                <span className="ml-2 text-sm text-gray-500">第 {index + 1} 句</span>
              </div>
              <div className="p-4">
                <p className="text-gray-800 font-medium mb-2">{english}</p>
                <p className="text-gray-600 mb-4">{chinese}</p>
                
                {/* 语音识别结果显示 */}
                {sentenceState.recognizedText && (
                  <div className="mb-3 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-1">识别结果：</p>
                    <p className="text-gray-800">{sentenceState.recognizedText}</p>
                  </div>
                )}
                
                {/* 练习状态提示 */}
                {sentenceState.passed !== null && (
                  <div className={`mb-3 p-2 rounded-md text-sm font-medium ${sentenceState.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {sentenceState.passed ? '✓ 朗读通过' : '✗ 请再试一次'}
                  </div>
                )}
                
                {/* 控制按钮 */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => playOriginalSentence(item.text)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <span>🔊 播放原句</span>
                  </button>
                  <button
                    onClick={() => {
                      if (isCurrentRecording) {
                        stopRecording()
                      } else {
                        startRecording(index)
                      }
                    }}
                    disabled={isRecording && currentSentenceIndex !== index}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${isCurrentRecording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  >
                    <span>{isCurrentRecording ? '⏹️ 停止录音' : '🎤 开始朗读'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* 重置练习按钮 */}
        {dialogue.length > 0 && sentencePracticeStates.some(state => state.passed !== null) && (
          <div className="mt-6 text-center">
            <button
              onClick={handleResetPractice}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              重置所有练习
            </button>
          </div>
        )}
      </div>
    </div>
  )
}