'use client';
import SceneInput from './SceneInput';
import DialogueDisplay from './DialogueDisplay';

/**
 * 主内容区域组件，包含场景输入和对话显示
 */
export default function MainContent() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-120px)]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">欢迎使用 LinguaPal</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          通过AI生成的场景对话，提升你的英语口语能力
        </p>
        
        {/* 集成场景输入组件 */}
        <SceneInput />
        
        {/* 集成对话显示组件 */}
        <DialogueDisplay />
      </div>
    </main>
  );
}