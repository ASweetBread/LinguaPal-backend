import Link from 'next/link'
import SceneInput from './components/SceneInput'
import DialogueDisplay from './components/DialogueDisplay'

// 定义导航栏组件
function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
          LinguaPal
        </div>
        <div className="space-x-4">
          <Link 
            href="/" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            主页
          </Link>
          <Link 
            href="/vocabulary" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            单词本
          </Link>
        </div>
      </div>
    </nav>
  )
}

// 定义主内容区域组件
function MainContent() {
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
  )
}

// 定义底部状态栏组件
function BottomStatusBar() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
        <p>请输入学习场景开始练习</p>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <MainContent />
      <BottomStatusBar />
    </div>
  )
}