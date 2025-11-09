'use client';
import React, { useRef, useEffect } from 'react';
import useRecord, { AudioDevice } from '../lib/hooks/useRecord';

interface RecordingTesterProps {
  onClose?: () => void;
}

/**
 * 录音测试组件，使用useRecord Hook进行录音和播放
 */
export default function RecordingTester({ onClose }: RecordingTesterProps) {
  const {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    loadAudioDevices
  } = useRecord();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 组件加载时加载音频设备列表
  useEffect(() => {
    const loadDevices = async () => {
      try {
        await loadAudioDevices();
      } catch (error) {
        console.error('加载音频设备失败:', error);
        alert('无法加载音频设备，请确保已授予麦克风权限');
      }
    };
    
    loadDevices();
  }, []);
  
  // 当audioUrl更新时，自动加载音频
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // 处理录音按钮点击
  const handleRecordClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('录音启动失败:', error);
        alert('无法访问麦克风，请确保已授予权限');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-8">
      <div className="text-center max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          录音测试
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          使用下方按钮开始和停止录音，录制完成后可以在播放器中听到录音内容
        </p>
      </div>
      
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* 音频设备选择框 */}
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              选择录音设备:
            </label>
            <select
              value={selectedDeviceId || ''}
              onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              disabled={isRecording}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {audioDevices.length === 0 ? (
                <option value="" disabled>加载中...</option>
              ) : (
                audioDevices.map((device: AudioDevice) => (
                  <option key={device.id} value={device.id}>
                    {device.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        
        {/* 音频播放器 */}
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                录音内容:
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {audioUrl ? '已录制音频' : '请开始录音'}
              </span>
            </div>
            
            <audio
              ref={audioRef}
              controls
              className="w-full"
            >
              您的浏览器不支持音频元素。
            </audio>
          </div>
        </div>
        
        {/* 录音控制按钮 */}
        <button
          onClick={handleRecordClick}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-full text-lg font-medium
            transition-all duration-300 transform
            ${isRecording 
              ? 'bg-red-600 text-white hover:bg-red-700 scale-105 shadow-lg'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
            }
          `}
        >
          {isRecording ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>停止录音</span>
              </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>开始录音</span>
              </>
          )}
        </button>
      </div>
      
      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-red-600 animate-pulse">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="font-medium">正在录音...</span>
        </div>
      )}
      
      {onClose && (
        <button
          onClick={onClose}
          className="mt-8 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          关闭测试
        </button>
      )}
    </div>
  );
}