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
import ManualInputModal from './components/ManualInputModal';
import { showWordConfirmationModal } from './utils/boltModalIntegration';

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

function App() {
  const [words, setWords] = useState<ProcessedWordData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [uploadedWordCount, setUploadedWordCount] = useState(0);
  const [parsedWords, setParsedWords] = useState<WordData[]>([]);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
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

  // 弹窗处理函数 - 优化后直接生成卡片
  const handleWordConfirmation = async (selectedWordData?: any[]) => {
    if (selectedWordData && selectedWordData.length > 0) {
      setParsedWords(selectedWordData);
      addToast('success', `✅ 已确认处理 ${selectedWordData.length} 个单词，正在生成卡片...`);
      
      // 直接开始生成卡片，无需用户再点击Generate按钮
      setTimeout(async () => {
        await handleGenerateCardsInternal(selectedWordData);
      }, 500); // 给用户一点时间看到确认消息
    }
  };

  const handleWordCancellation = () => {
    addToast('info', '📋 已取消单词处理');
    // 取消时也要重置状态，返回初始状态
    setTimeout(() => {
      resetAppState();
      setStatus('idle');
    }, 1000); // 给用户时间看到取消消息
  };

  // 状态重置函数 - 清理之前的状态，确保干净的开始
  const resetAppState = () => {
    console.log('🔄 重置应用状态...');
    
    // 清理所有状态
    setWords([]);
    setParsedWords([]);
    setCurrentPage(0);
    setUploadedWordCount(0);
    
    // 清理所有通知
    clearToastsByType('success');
    clearToastsByType('error');
    clearToastsByType('info');
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log('✅ 应用状态已重置');
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

    // 重置应用状态，确保干净的开始
    resetAppState();
    
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

          // 显示确认弹窗
          clearToastsByType('info');
          showWordConfirmationModal(
            validWords,
            handleWordConfirmation,
            handleWordCancellation
          );
          
          // 设置初始状态
          setUploadedWordCount(validWords.length);
          setWords([]);
          setCurrentPage(0);
          setStatus('uploaded');
          
          setTimeout(() => {
            addToast('success', `✅ CSV解析成功！已识别 ${validWords.length} 个单词，请在弹窗中确认处理`);
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

  // 内部卡片生成函数 - 接受单词数据参数
  const handleGenerateCardsInternal = async (wordsToProcess: WordData[]) => {
    setStatus('generating');
    addToast('info', '⚙️ 正在处理单词数据...');

    try {
      const completedWords: ProcessedWordData[] = [];
      
      // Process words with progress feedback
      for (let i = 0; i < wordsToProcess.length; i++) {
        const word = wordsToProcess[i];
        const completed = await autoCompleteWord(word);
        completedWords.push(completed);
        
        // Update progress every few words to avoid spamming toasts
        if (i % 3 === 0 || i === wordsToProcess.length - 1) {
          const progress = Math.round(((i + 1) / wordsToProcess.length) * 100);
          clearToastsByType('info');
          addToast('info', `🔄 生成进度: ${progress}% (${i + 1}/${wordsToProcess.length})`);
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

  // 保留原Generate按钮的兼容性（如果需要手动触发）
  const handleGenerateCards = async () => {
    if (parsedWords.length === 0) {
      addToast('error', '❌ 请先上传CSV文件');
      return;
    }
    await handleGenerateCardsInternal(parsedWords);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 手动输入处理函数
  const handleManualInput = () => {
    resetAppState(); // 重置状态
    setIsManualInputOpen(true);
  };

  // 手动输入确认处理
  const handleManualInputConfirm = (words: string[]) => {
    setIsManualInputOpen(false);
    
    // 转换为WordData格式
    const wordDataList: WordData[] = words.map(word => ({
      Word: word.trim()
      // 其他字段将在后续自动补全
    }));

    // 设置状态并显示确认弹窗
    setUploadedWordCount(wordDataList.length);
    setStatus('uploaded');
    
    addToast('success', `✅ 已输入 ${wordDataList.length} 个单词，请在弹窗中确认处理`);
    
    // 显示确认弹窗
    showWordConfirmationModal(
      wordDataList,
      handleWordConfirmation,
      handleWordCancellation
    );
  };

  // 手动输入取消处理
  const handleManualInputCancel = () => {
    setIsManualInputOpen(false);
    addToast('info', '📝 已取消手动输入');
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

  // PDF导出功能
  const handleExportPDF = async () => {
    if (words.length === 0) {
      addToast('error', '❌ 没有可导出的卡片');
      return;
    }

    setStatus('exporting');
    addToast('info', '📄 正在生成PDF文件...');
    
    try {
      const printPages = document.querySelectorAll('.print-page');
      if (printPages.length === 0) {
        clearToastsByType('info');
        addToast('error', '❌ 没有可导出的内容');
        return;
      }

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      for (let i = 0; i < printPages.length; i++) {
        const page = printPages[i] as HTMLElement;
        
        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get actual page dimensions (A4 size in pixels at 96 DPI)
        const pageWidth = Math.round(210 * 3.779527559); // 794px
        const pageHeight = Math.round(297 * 3.779527559); // 1123px
        
        const canvas = await html2canvas(page, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: pageWidth,
          height: pageHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: pageWidth,
          windowHeight: pageHeight,
          foreignObjectRendering: false,
          logging: false,
          onclone: function(clonedDoc) {
            const clonedPage = clonedDoc.querySelector('.print-page') as HTMLElement;
            if (clonedPage) {
              clonedPage.style.width = '210mm';
              clonedPage.style.height = '297mm';
              clonedPage.style.margin = '0';
              clonedPage.style.padding = '4mm';
              clonedPage.style.boxSizing = 'border-box';
              clonedPage.style.background = 'white';
              clonedPage.style.display = 'flex';
              clonedPage.style.flexDirection = 'column';
              
              const grid = clonedPage.querySelector('.grid') as HTMLElement;
              if (grid) {
                grid.style.flex = '1';
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = '1fr 1fr';
                grid.style.gridTemplateRows = '1fr 1fr';
                grid.style.gap = '4mm';
                grid.style.width = '100%';
                grid.style.height = '100%';
              }
            }
          }
        });

        const imgData = canvas.toDataURL('image/png', 0.95);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      pdf.save('word_cards_complete.pdf');
      clearToastsByType('info');
      setTimeout(() => {
        addToast('success', '✅ PDF导出成功！');
      }, 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      clearToastsByType('info');
      setTimeout(() => {
        addToast('error', '❌ PDF生成失败，请重试。');
      }, 100);
    } finally {
      setStatus('generated');
    }
  };

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
        onExportPDF={handleExportPDF}
        status={status}
        uploadedWordCount={uploadedWordCount}
        wordsGenerated={words.length}
      />

      {/* Main Content */}
      <div className="pt-24 pb-8">
        {status === 'idle' || status === 'uploading' || status === 'uploaded' || status === 'uploadError' ? (
          // Show new homepage
          <div className="max-w-7xl mx-auto">
            <HeroSection 
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
              onManualInput={handleManualInput}
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
                    resetAppState();
                    setStatus('idle');
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
            
            {/* ========================================
             * 已验证布局 - 固定尺寸卡片显示区域
             * ======================================== 
             * 
             * ✅ 此版本确保：
             * - 每页固定显示4张卡片（2x2布局）
             * - 每张卡片固定尺寸，不随内容变化
             * - 统一的视觉效果和打印布局
             * 
             * ⚠️ 重要：不要修改此布局结构
             * ======================================== */}
            {words.length > 0 && (
              <div className="max-w-7xl mx-auto px-4">
                {/* Page Navigation */}
                <div className="flex items-center justify-center space-x-4 mb-6 no-print">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    上一页
                  </button>
                  
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-medium">
                    第 {currentPage + 1} 页，共 {totalPages} 页
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                {/* Page Info */}
                <div className="text-center mb-6 no-print">
                  <p className="text-gray-600">
                    显示卡片 {currentPage * CARDS_PER_PAGE + 1} 到 {Math.min((currentPage + 1) * CARDS_PER_PAGE, words.length)}，共 {words.length} 张
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    每页包含正面和背面，适合打印制作实体卡片
                  </p>
                </div>

                {/* Print Pages Container - 使用PrintPage组件确保PDF导出正常 */}
                <div className="space-y-8">
                  {/* Front Side Page */}
                  <PrintPage 
                    words={words}
                    side="front"
                    pageNumber={currentPage}
                  />
                  
                  {/* Back Side Page */}
                  <PrintPage 
                    words={words}
                    side="back"
                    pageNumber={currentPage}
                  />
                </div>
                
                {/* Print Instructions */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg no-print">
                  <h3 className="font-semibold text-yellow-800 mb-2">📖 打印说明：</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 先打印正面页，然后翻转纸张打印背面页</li>
                    <li>• 使用A4纸张获得最佳效果</li>
                    <li>• 每页包含4张A6格式的卡片</li>
                    <li>• 打印后沿卡片边框裁切</li>
                    <li>• 点击PDF按钮下载高质量打印文件</li>
                  </ul>
                </div>
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

      {/* Manual Input Modal */}
      <ManualInputModal
        isOpen={isManualInputOpen}
        onConfirm={handleManualInputConfirm}
        onCancel={handleManualInputCancel}
      />
    </div>
  );
}

export default App; 