import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  FileText,
  Sparkles,
  Info,
  CheckCircle,
  Trash2,
  Download
} from 'lucide-react';

interface ManualInputModalProps {
  isOpen: boolean;
  onConfirm: (words: string[]) => void;
  onCancel: () => void;
  onExportCSV?: (words: string[]) => void;
}

const ManualInputModal: React.FC<ManualInputModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  onExportCSV
}) => {
  const [inputText, setInputText] = useState('');
  const [wordList, setWordList] = useState<string[]>([]);
  const [lastWordCount, setLastWordCount] = useState(0);
  const [newlyAddedWords, setNewlyAddedWords] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordListContainerRef = useRef<HTMLDivElement>(null);

  // 自动聚焦到输入框
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

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

  // 自动滚动到最新添加的单词
  useEffect(() => {
    if (wordListContainerRef.current && wordList.length > 0) {
      // 每当单词列表有变化时，都滚动到底部
      setTimeout(() => {
        if (wordListContainerRef.current) {
          wordListContainerRef.current.scrollTo({
            top: wordListContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 150); // 稍微延长延迟，确保DOM和动画渲染完成
    }
  }, [wordList.length, wordList]); // 监听both length和wordList本身的变化

  // 实时解析输入的单词
  useEffect(() => {
    const words = inputText
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .slice(0, 40); // 限制最多40个单词
    
    const currentWordCount = words.length;
    
    // 检测新增的单词
    if (currentWordCount > lastWordCount) {
      const newWords = words.slice(lastWordCount);
      setNewlyAddedWords(new Set(newWords));
      
      // 立即触发滚动到新增单词
      setTimeout(() => {
        if (wordListContainerRef.current) {
          wordListContainerRef.current.scrollTo({
            top: wordListContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
      
      // 1秒后清除新单词高亮
      setTimeout(() => {
        setNewlyAddedWords(new Set());
      }, 1000);
    }
    
    setWordList(words);
    setLastWordCount(currentWordCount);
  }, [inputText, lastWordCount]);

  const handleConfirm = () => {
    if (wordList.length === 0) {
      return;
    }
    onConfirm(wordList);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter 快捷键确认
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
    
    // 普通回车键 - 触发滚动到新增单词
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      // 延迟触发滚动，确保新单词已被解析和渲染
      setTimeout(() => {
        if (wordListContainerRef.current) {
          wordListContainerRef.current.scrollTo({
            top: wordListContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 200); // 给更多时间让DOM更新和动画完成
    }
  };

  // 示例单词
  const exampleWords = [
    'apple', 'book', 'computer', 'dog', 'elephant',
    'flower', 'guitar', 'house', 'ice cream', 'jazz'
  ];

  const insertExample = () => {
    setInputText(exampleWords.join('\n'));
  };

  // 删除单词
  const handleRemoveWord = (indexToRemove: number) => {
    const updatedWords = wordList.filter((_, index) => index !== indexToRemove);
    const newInputText = updatedWords.join('\n');
    setInputText(newInputText);
  };

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV(wordList);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                手动输入单词
              </h2>
              <span className="text-lg font-semibold text-green-600">
                Manual Input
              </span>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* 状态指示 */}
          <div className="flex items-center justify-between">
            <div className="bg-white rounded-lg px-3 py-1.5 border border-green-200">
              <span className="text-sm text-green-800 font-medium">
                {wordList.length}/40 单词
              </span>
            </div>
            
            {wordList.length >= 40 && (
              <div className="bg-orange-50 rounded-lg px-3 py-1.5 border border-orange-200">
                <span className="text-xs text-orange-700">
                  已达到最大限制
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* 左侧输入区 */}
          <div className="flex-1 p-6 border-r border-gray-200">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  输入单词列表
                </h3>
                <button
                  onClick={insertExample}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  插入示例
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                每行输入一个单词，最多支持40个单词
              </p>
            </div>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入单词，每行一个：&#10;apple&#10;book&#10;computer&#10;..."
              className="w-full h-80 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm font-mono"
              disabled={wordList.length >= 40}
            />

            <div className="mt-2 text-xs text-gray-500">
              提示：使用 Ctrl/Cmd + Enter 快速确认
            </div>
          </div>

          {/* 右侧预览区 */}
          <div className="w-80 p-6 bg-gray-50 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex-shrink-0">
              单词预览
            </h3>
            
            {/* 单词列表区域 - 弹性布局 */}
            <div className="flex-1 flex flex-col min-h-0">
              {wordList.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm">
                      请在左侧输入单词
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={wordListContainerRef}
                  className="flex-1 space-y-2 overflow-y-auto min-h-0 mb-4"
                >
                  {wordList.map((word, index) => {
                    const isNewlyAdded = newlyAddedWords.has(word);
                    return (
                      <div
                        key={`${word}-${index}`}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 ${
                          isNewlyAdded 
                            ? 'bg-green-100 border-green-300 ring-2 ring-green-200 animate-pulse' 
                            : 'bg-white border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                            isNewlyAdded 
                              ? 'bg-green-200 text-green-700' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-800 break-all leading-tight">
                            {word}
                          </span>
                          {isNewlyAdded && (
                            <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full animate-bounce">
                              新
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveWord(index)}
                          className="w-5 h-5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-1.5"
                          title="删除单词"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 提示信息 - 固定在底部 */}
            <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">确认后将自动：</p>
                  <ul className="space-y-0.5">
                    <li>• 补全单词释义和音标</li>
                    <li>• 生成例句和图片</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 rounded-b-2xl">
          <div className="text-sm text-gray-600">
            已输入 {wordList.length} 个单词
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleExportCSV}
              disabled={wordList.length === 0}
              className="px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>导出CSV</span>
            </button>
            <button
              onClick={handleConfirm}
              disabled={wordList.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>确认生成 ({wordList.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualInputModal; 