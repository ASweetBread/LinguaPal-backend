'use client';
import NavBar from './components/NavBar';
import MainContent from './components/MainContent';

// 定义底部状态栏组件
function BottomStatusBar() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
      <p>© 2024 LinguaPal AI语言学习助手 | 专注于提升您的口语能力</p>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <MainContent />
      <BottomStatusBar />
    </div>
  );
}