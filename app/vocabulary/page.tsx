import Link from 'next/link'

// 定义导航栏组件（与主页共用）
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

// 定义单词列表容器组件
function VocabularyList() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-120px)]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">我的单词本</h1>
        
        {/* 单词列表容器 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg min-h-[400px]">
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              暂无记录的单词。在学习过程中，系统会自动记录你遇到的生词。
            </p>
            <Link 
              href="/" 
              className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              返回主页开始学习
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function VocabularyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <VocabularyList />
    </div>
  )
}