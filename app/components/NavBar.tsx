'use client';
import Link from 'next/link';
import { useState } from 'react';
import Modal from './ui/Modal';
import RecordingTester from './RecordingTester';

/**
 * 导航栏组件，包含录音测试弹窗功能
 */
export default function NavBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                LinguaPal
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                AI语言学习助手
              </span>
            </div>
            
            <nav className="flex items-center gap-6">
              
              {/* 录音测试按钮 */}
              <button
                onClick={openModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                测试弹窗
              </button> 
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                首页
              </Link>
              <Link 
                href="/vocabulary" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                词汇表
              </Link>
              
            </nav>
          </div>
        </div>
      </header>
      
      {/* 录音测试弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="录音功能测试"
      >
        <RecordingTester onClose={closeModal} />
      </Modal>
    </>
  );
}