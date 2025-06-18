import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileText,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface WordConfirmationModalProps {
  words: string[];
  isOpen: boolean;
  onConfirm: (selectedWords: string[]) => void;
  onCancel: () => void;
}

const WordConfirmationModal: React.FC<WordConfirmationModalProps> = ({
  words,
  isOpen,
  onConfirm,
  onCancel
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [duplicateInfo, setDuplicateInfo] = useState<{count: number, words: string[]}>({count: 0, words: []});
  const [lastAddedWord, setLastAddedWord] = useState<string>('');
  
  // Ref for the scrollable container
  const wordListRef = useRef<HTMLDivElement>(null);

  // Initialize selected words and detect duplicates
  useEffect(() => {
    if (words.length > 0) {
      // Detect duplicates with detailed counting
      const wordCounts: {[key: string]: number} = {};
      const duplicates: string[] = [];
      let totalDuplicateCount = 0;
      
      words.forEach(word => {
        const normalizedWord = word.trim().toLowerCase();
        wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
      });

      // Find words that appear more than once
      Object.entries(wordCounts).forEach(([word, count]) => {
        if (count > 1) {
          duplicates.push(word);
          totalDuplicateCount += (count - 1); // Count extra occurrences
        }
      });

      // Remove duplicates and limit to 40
      const uniqueWords = Array.from(new Set(words.map(word => word.trim().toLowerCase())));
      const limitedWords = uniqueWords.slice(0, 40);
      
      setSelectedWords(limitedWords);
      setDuplicateInfo({
        count: totalDuplicateCount,
        words: duplicates
      });
    }
  }, [words]);

  // Auto-scroll to bottom when a new word is added
  useEffect(() => {
    if (lastAddedWord && wordListRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        if (wordListRef.current) {
          wordListRef.current.scrollTo({
            top: wordListRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [lastAddedWord, selectedWords.length]);

  // 控制背景页面滚动
  useEffect(() => {
    if (isOpen) {
      // 禁用背景页面滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复背景页面滚动
      document.body.style.overflow = 'unset';
    }

    // 清理函数：组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleRemoveWord = (wordToRemove: string) => {
    setSelectedWords(prev => prev.filter(word => word !== wordToRemove));
  };

  const handleAddWord = () => {
    if (newWord.trim() && selectedWords.length < 40) {
      const normalizedNewWord = newWord.trim().toLowerCase();
      if (!selectedWords.includes(normalizedNewWord)) {
        setSelectedWords(prev => [...prev, normalizedNewWord]);
        setLastAddedWord(normalizedNewWord); // Track the last added word for scrolling
        setNewWord('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedWords);
  };

  // Check if add button should be disabled
  const isAddDisabled = !newWord.trim() || 
                       selectedWords.length >= 40 || 
                       selectedWords.includes(newWord.trim().toLowerCase());

  // Calculate how many placeholder blocks we need for visual balance
  const getPlaceholderCount = () => {
    const wordsCount = selectedWords.length;
    if (wordsCount === 0) return 0;
    
    // For 3-column layout (xl screens), we want to fill the last row
    const columnsXL = 3;
    const remainderXL = wordsCount % columnsXL;
    
    // If the last row is not complete, add placeholders to fill it
    if (remainderXL !== 0) {
      return columnsXL - remainderXL;
    }
    
    return 0;
  };

  const placeholderCount = getPlaceholderCount();

  // 🔍 增强调试信息
  console.log('🔍 弹窗组件加载了，isOpen:', isOpen);
  console.log('🎯 WordConfirmationModal 渲染:', { 
    isOpen, 
    wordsCount: words.length, 
    selectedWordsCount: selectedWords.length,
    words: words.slice(0, 3) // 显示前3个单词
  });

  if (!isOpen) {
    console.log('❌ 弹窗 isOpen=false，不渲染');
    return null;
  }

  console.log('✅ 弹窗开始渲染DOM...');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[92vh] flex flex-col">
        {/* Ultra Compact Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-2.5 border-b border-gray-200 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-3 h-3 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                确认单词列表 Confirm Word List
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          </div>

          {/* Ultra Compact Status Layout */}
          <div className="flex items-center space-x-3">
            {/* Main Status */}
            <div className="bg-white rounded-md px-2.5 py-1 border border-blue-200 flex-shrink-0">
              <span className="text-sm text-blue-800 font-medium">
                {selectedWords.length}/40 单词
              </span>
            </div>

            {/* Duplicate Info - Show ALL duplicate words, no truncation */}
            {duplicateInfo.count > 0 && (
              <div className="bg-orange-50 rounded-md px-2.5 py-1 border border-orange-200 flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3 h-3 text-orange-600 flex-shrink-0" />
                  <span className="text-xs text-orange-800">
                    去重 {duplicateInfo.count} 个 | Deduplicated {duplicateInfo.count}: {duplicateInfo.words.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Word List Section - Maximum Space */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Minimal Section Header */}
          <div className="px-6 py-1.5 bg-gray-50 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
                单词列表 ({selectedWords.length})
              </h3>
              <span className="text-xs text-gray-500">
                还可添加 {40 - selectedWords.length} 个
              </span>
            </div>
          </div>
          
          {/* Maximized Scrollable Word List Container */}
          <div 
            ref={wordListRef}
            className="flex-1 px-6 py-2 overflow-y-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            {selectedWords.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>暂无单词 | No words available</p>
                </div>
              </div>
            ) : (
              /* Optimized 3-column Grid for Maximum Space Utilization */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pr-2">
                {/* Actual Word Items */}
                {selectedWords.map((word, index) => (
                  <div
                    key={`${word}-${index}`}
                    className={`flex items-center justify-between p-2 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all duration-200 ${
                      word === lastAddedWord ? 'ring-2 ring-green-300 bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      {/* CRITICAL: Full word display with word-break for long words */}
                      <span className="font-medium text-gray-800 break-all leading-tight">
                        {word}
                      </span>
                      {word === lastAddedWord && (
                        <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full animate-pulse flex-shrink-0">
                          新
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveWord(word)}
                      className="w-5 h-5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-1.5"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                
                {/* Placeholder Blocks for Visual Balance */}
                {placeholderCount > 0 && Array.from({ length: placeholderCount }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="p-2 rounded-lg border border-dashed border-gray-200 bg-gray-25 opacity-50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-gray-100 flex-shrink-0"></span>
                      <div className="h-4 bg-gray-100 rounded flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ultra Compact Add New Word Section */}
        <div className="px-6 py-2 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="添加新单词 Add new word..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              disabled={selectedWords.length >= 40}
            />
            <button
              onClick={handleAddWord}
              disabled={isAddDisabled}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1 text-sm font-medium ${
                selectedWords.length >= 40 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : isAddDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>添加</span>
            </button>
          </div>
          
          {/* Minimal Status Message */}
          {selectedWords.length >= 40 ? (
            <p className="text-xs text-orange-600 mt-1">
              已达到最大限制 | Maximum limit reached
            </p>
          ) : newWord.trim() && selectedWords.includes(newWord.trim().toLowerCase()) ? (
            <p className="text-xs text-orange-600 mt-1">
              单词已存在 | Word exists
            </p>
          ) : null}
        </div>

        {/* Ultra Compact Footer */}
        <div className="bg-white px-6 py-2 border-t border-gray-200 flex items-center justify-between flex-shrink-0 rounded-b-2xl">
          <div className="text-sm text-gray-600">
            将生成 {selectedWords.length} 张卡片
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedWords.length === 0}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 text-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>确认生成</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordConfirmationModal;