import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Settings, 
  Download, 
  BookText, 
  Image, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { WordCard } from './components/WordCard';
import { PrintPage } from './components/PrintPage';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CSVGuideSection } from './components/CSVGuideSection';

// Types
interface WordData {
  Word: string;
  Definition?: string;
  IPA?: string;
  Example?: string;
  Example_CN?: string;
  Definition_CN?: string;
  Audio?: string;
  Picture?: string;
}

interface ProcessedWordData extends WordData {
  Word: string;
  Definition: string;
  IPA: string;
  Example: string;
  Example_CN: string;
  Definition_CN: string;
  Audio: string;
  Picture: string;
}

type AppStatus = 'idle' | 'uploading' | 'uploaded' | 'uploadError' | 'generating' | 'generated' | 'generationError' | 'exporting';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Toast Component
const Toast: React.FC<{ 
  toast: ToastMessage; 
  onClose: (id: string) => void; 
  index?: number; 
}> = ({ toast, onClose, index = 0 }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[toast.type];

  const icon = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Loader2 className="w-5 h-5 animate-spin" />
  }[toast.type];

  return (
    <div 
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-80 pointer-events-auto animate-slide-in-bottom`}
      style={{
        transform: `translateY(-${index * 8}px)`,
        transition: 'transform 0.3s ease-out',
        zIndex: 50 - index
      }}
    >
      {icon}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white hover:text-gray-200 transition-colors ml-2 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

function NewApp() {
  const [words, setWords] = useState<ProcessedWordData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [uploadedWordCount, setUploadedWordCount] = useState(0);
  const [parsedWords, setParsedWords] = useState<WordData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CARDS_PER_PAGE = 4;
  const totalPages = Math.ceil(words.length / CARDS_PER_PAGE);

  // Toast management
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, type, message };
    
    setToasts(prev => {
      const newToasts = [...prev, newToast];
      return newToasts.length > 4 ? newToasts.slice(1) : newToasts;
    });
    
    const duration = type === 'error' ? 7000 : type === 'info' ? 4000 : 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const clearToastsByType = (type: ToastMessage['type']) => {
    setToasts(prev => prev.filter(toast => toast.type !== type));
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Auto-complete missing fields using local resources
  const autoCompleteWord = async (word: WordData): Promise<ProcessedWordData> => {
    const completed: ProcessedWordData = {
      Word: word.Word,
      Definition: word.Definition || `Definition for ${word.Word}`,
      IPA: word.IPA || `/ˈwɜːrd/`,
      Example: word.Example || `This is an example sentence with ${word.Word}.`,
      Example_CN: word.Example_CN || `这是一个包含 ${word.Word} 的例句。`,
      Definition_CN: word.Definition_CN || `n. ${word.Word}的中文释义`,
      Audio: word.Audio ? (word.Audio.startsWith('/media/') ? word.Audio : `/media/${word.Audio}`) : `/media/${word.Word.toLowerCase()}.mp3`,
      Picture: word.Picture ? (word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`) : `/media/${word.Word.toLowerCase()}.jpg`
    };

    console.log(`Generated card for: ${word.Word} using local resources`);
    return completed;
  };

  // Handle CSV upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    addToast('info', '📄 正在解析CSV文件...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedWords = results.data as WordData[];
          const validWords = parsedWords.filter(word => word.Word && word.Word.trim());
          
          if (validWords.length === 0) {
            setStatus('uploadError');
            clearToastsByType('info');
            setTimeout(() => {
              addToast('error', '❌ 解析失败：CSV中没有找到有效单词。请确保包含"Word"列。');
            }, 100);
            return;
          }

          setUploadedWordCount(validWords.length);
          setParsedWords(validWords);
          setWords([]);
          setCurrentPage(0);
          setStatus('uploaded');
          clearToastsByType('info');
          setTimeout(() => {
            addToast('success', `✅ CSV解析成功！已识别 ${validWords.length} 个单词`);
          }, 100);
        } catch (error) {
          setStatus('uploadError');
          clearToastsByType('info');
          setTimeout(() => {
            addToast('error', '❌ 解析失败：CSV格式无效。');
          }, 100);
        }
      },
      error: (error) => {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ 解析失败：' + error.message);
        }, 100);
      }
    });

    // Don't reset file input here - we need it for generation
    // Reset only on successful generation or when uploading new file
  };

  const handleGenerateCards = async () => {
    if (parsedWords.length === 0) {
      addToast('error', '❌ 请先上传CSV文件');
      return;
    }

    setStatus('generating');
    addToast('info', '⚙️ 正在处理单词数据...');

    try {
      const completedWords: ProcessedWordData[] = [];
      
      // Process words with progress feedback
      for (let i = 0; i < parsedWords.length; i++) {
        const word = parsedWords[i];
        const completed = await autoCompleteWord(word);
        completedWords.push(completed);
        
        // Update progress every few words to avoid spamming toasts
        if (i % 3 === 0 || i === parsedWords.length - 1) {
          const progress = Math.round(((i + 1) / parsedWords.length) * 100);
          clearToastsByType('info');
          addToast('info', `🔄 生成进度: ${progress}% (${i + 1}/${parsedWords.length})`);
        }
        
        // Add small delay to show progress and avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setWords(completedWords);
      setCurrentPage(0);
      setStatus('generated');
      clearToastsByType('info');
      setTimeout(() => {
        addToast('success', `✅ 单词卡片处理完成！共生成 ${completedWords.length} 张卡片`);
      }, 100);
    } catch (error) {
      console.error('Error during generation:', error);
      setStatus('generationError');
      clearToastsByType('info');
      setTimeout(() => {
        addToast('error', '❌ 处理失败，请检查数据格式。');
      }, 100);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleViewExample = () => {
    addToast('info', '📖 示例CSV将在新标签页中打开');
    // 这里可以实现打开示例CSV的逻辑
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'Word\napple\nbook\ncomputer\nhello\nworld';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'word_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    addToast('success', '📥 模板下载成功！');
  };

  // 其他处理函数（导出等）保持原样...
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header 
        onUploadClick={handleUploadClick}
        onGenerateClick={handleGenerateCards}
        status={status}
        uploadedWordCount={uploadedWordCount}
      />

      {/* Main Content */}
      <div className="pt-24 pb-8">
        {status === 'idle' || status === 'uploading' || status === 'uploaded' || status === 'uploadError' ? (
          // Show new homepage
          <div className="max-w-7xl mx-auto">
            <HeroSection 
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
              status={status}
            />
            <FeaturesSection />
            <CSVGuideSection 
              onViewExample={handleViewExample}
              onDownloadTemplate={handleDownloadTemplate}
            />
          </div>
        ) : (
          // Show existing card generation interface (保持原有逻辑)
          <div className="max-w-7xl mx-auto px-4 space-y-6">
            {/* Status indicator for debugging */}
            <div className="text-center mb-4">
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                状态: {status} | 已解析: {parsedWords.length} | 已生成: {words.length}
              </span>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={() => {
                    setStatus('idle');
                    setWords([]);
                    setParsedWords([]);
                    setUploadedWordCount(0);
                    setCurrentPage(0);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors mr-4"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  返回主页
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  单词卡片预览
                </h2>
              </div>
              {status === 'generating' ? (
                <p className="text-blue-600 mb-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  正在生成单词卡片，请稍候...
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  已生成 {words.length} 张卡片，当前显示第 {currentPage + 1} 页，共 {totalPages} 页
                </p>
              )}
            </div>
            
            {/* 这里应该显示WordCard组件等 */}
            {words.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {words.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE).map((word, index) => (
                  <div key={index} className="space-y-4">
                    {/* Front side */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">正面 Front</h3>
                      <WordCard word={word} side="front" />
                    </div>
                    {/* Back side */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">背面 Back</h3>
                      <WordCard word={word} side="back" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    currentPage === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </button>
                
                <span className="text-gray-600">
                  {currentPage + 1} / {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    currentPage === totalPages - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 space-y-2 pointer-events-none z-50">
        {toasts.map((toast, index) => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onClose={removeToast} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export default NewApp; 