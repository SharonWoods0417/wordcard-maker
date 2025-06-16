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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CARDS_PER_PAGE = 4;
  const totalPages = Math.ceil(words.length / CARDS_PER_PAGE);

  // Toast management
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, type, message };
    
    // Limit to maximum 4 toasts to prevent screen clutter
    setToasts(prev => {
      const newToasts = [...prev, newToast];
      return newToasts.length > 4 ? newToasts.slice(1) : newToasts;
    });
    
    // Auto-remove toast after different durations based on type
    const duration = type === 'error' ? 7000 : type === 'info' ? 4000 : 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  // Clear toasts by type (useful for clearing progress toasts)
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
      // Use local media resources if available, otherwise use filename format
      Audio: word.Audio ? (word.Audio.startsWith('/media/') ? word.Audio : `/media/${word.Audio}`) : `/media/${word.Word.toLowerCase()}.mp3`,
      Picture: word.Picture ? (word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`) : `/media/${word.Word.toLowerCase()}.jpg`
    };

    // No external API calls during testing phase
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
          
          // Validate that we have at least Word column
          const validWords = parsedWords.filter(word => word.Word && word.Word.trim());
          
          if (validWords.length === 0) {
            setStatus('uploadError');
            clearToastsByType('info'); // 清除解析中提示
            setTimeout(() => {
              addToast('error', '❌ 解析失败：CSV中没有找到有效单词。请确保包含"Word"列。');
            }, 100);
            return;
          }

          setUploadedWordCount(validWords.length);
          setWords([]); // Clear existing words
          setCurrentPage(0);
          setStatus('uploaded');
          clearToastsByType('info'); // 清除解析中提示
          setTimeout(() => {
            addToast('success', `✅ CSV解析成功！已识别 ${validWords.length} 个单词`);
          }, 100);
        } catch (error) {
          setStatus('uploadError');
          clearToastsByType('info'); // 清除解析中提示
          setTimeout(() => {
            addToast('error', '❌ 解析失败：CSV格式无效。');
          }, 100);
        }
      },
      error: (error) => {
        setStatus('uploadError');
        clearToastsByType('info'); // 清除解析中提示
        setTimeout(() => {
          addToast('error', '❌ 解析失败：' + error.message);
        }, 100);
      }
    });
  };

  // Generate cards with auto-completion
  const handleGenerateCards = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      addToast('error', '❌ 请先上传CSV文件');
      return;
    }

    setStatus('generating');
    addToast('info', '⚙️ 正在处理单词数据...');
    
    try {
      const file = fileInputRef.current.files[0];
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const parsedWords = results.data as WordData[];
            const validWords = parsedWords.filter(word => word.Word && word.Word.trim());
            const completedWords: ProcessedWordData[] = [];

            // Process words in batches to avoid overwhelming APIs
            for (let i = 0; i < validWords.length; i++) {
              const word = validWords[i];
              const completed = await autoCompleteWord(word);
              completedWords.push(completed);
              
              // Add small delay to be respectful to APIs
              if (i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }

            setWords(completedWords);
            setCurrentPage(0);
            setStatus('generated');
            clearToastsByType('info'); // 清除处理中提示
            setTimeout(() => {
              addToast('success', `✅ 单词卡片处理完成！共生成 ${completedWords.length} 张卡片`);
            }, 100);
          } catch (error) {
            console.error('Error during generation:', error);
            setStatus('generationError');
            clearToastsByType('info'); // 清除处理中提示
            setTimeout(() => {
              addToast('error', '❌ 处理失败，请检查数据格式。');
            }, 100);
          }
        },
        error: (error) => {
          setStatus('generationError');
          clearToastsByType('info'); // 清除处理中提示
          setTimeout(() => {
            addToast('error', '❌ 处理失败：' + error.message);
          }, 100);
        }
      });
    } catch (error) {
      console.error('Error generating cards:', error);
      setStatus('generationError');
      clearToastsByType('info'); // 清除处理中提示
      setTimeout(() => {
        addToast('error', '❌ 处理失败，请检查数据格式。');
      }, 100);
    }
  };

  // Download completed CSV in Anki format
  const handleDownloadCSV = () => {
    if (words.length === 0) {
      addToast('error', '❌ 没有可导出的卡片');
      return;
    }

    try {
      // Transform words data to Anki format
      const ankiFormattedWords = words.map(word => {
        // Extract filename from path for proper Anki format
        const getFileName = (filePath: string) => {
          if (filePath.startsWith('/media/')) {
            return filePath.replace('/media/', '');
          }
          return filePath;
        };

        return {
          ...word,
          // Transform Audio field to Anki format: [sound:filename.mp3]
          Audio: word.Audio ? `[sound:${getFileName(word.Audio)}]` : '',
          // Transform Picture field to Anki format: <img src="filename.jpg">
          Picture: word.Picture ? `<img src="${getFileName(word.Picture)}">` : ''
        };
      });

      const csv = Papa.unparse(ankiFormattedWords);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'anki_word_cards.csv';
      link.click();
      addToast('success', '✅ Anki格式CSV下载成功！');
    } catch (error) {
      addToast('error', '❌ CSV下载失败');
    }
  };

  // Download images as ZIP
  const handleDownloadImages = async () => {
    if (words.length === 0) {
      addToast('error', '❌ 没有可导出的卡片');
      return;
    }

    setStatus('exporting');
    addToast('info', '📁 正在准备图片下载...');
    const zip = new JSZip();

    try {
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        try {
          // Handle local media resources
          const imagePath = word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`;
          const response = await fetch(imagePath);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(`${word.Word.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, blob);
          }
        } catch (error) {
          console.log(`Failed to download image for ${word.Word}: ${word.Picture}`);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'word_card_images.zip';
      link.click();
      clearToastsByType('info'); // 清除导出中提示
      setTimeout(() => {
        addToast('success', '✅ 图片下载成功！');
      }, 100);
    } catch (error) {
      clearToastsByType('info'); // 清除导出中提示
      setTimeout(() => {
        addToast('error', '❌ 创建图片压缩包失败');
      }, 100);
    } finally {
      setStatus('generated');
    }
  };

  // Download audio as ZIP
  const handleDownloadAudio = async () => {
    if (words.length === 0) {
      addToast('error', '❌ 没有可导出的卡片');
      return;
    }

    setStatus('exporting');
    addToast('info', '🔊 正在准备音频下载...');
    const zip = new JSZip();

    try {
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        try {
          // Handle local media resources
          const audioPath = word.Audio.startsWith('/media/') ? word.Audio : `/media/${word.Audio}`;
          const response = await fetch(audioPath);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(`${word.Word.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`, blob);
          }
        } catch (error) {
          console.log(`Failed to download audio for ${word.Word}: ${word.Audio}`);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'word_card_audio.zip';
      link.click();
      clearToastsByType('info'); // 清除导出中提示
      setTimeout(() => {
        addToast('success', '✅ 音频文件下载成功！');
      }, 100);
    } catch (error) {
      clearToastsByType('info'); // 清除导出中提示
      setTimeout(() => {
        addToast('error', '❌ 创建音频压缩包失败');
      }, 100);
    } finally {
      setStatus('generated');
    }
  };

  // Export to PDF
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
        clearToastsByType('info'); // 清除生成中提示
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
          scale: 1.5, // Reduced scale for better performance and accuracy
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: pageWidth,
          height: pageHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: pageWidth,
          windowHeight: pageHeight,
          foreignObjectRendering: false, // Better CSS rendering
          logging: false,
          onclone: function(clonedDoc) {
            // Ensure styles are applied in cloned document
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
        
        // Add image to PDF with exact A4 dimensions
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      pdf.save('word_cards_complete.pdf');
      clearToastsByType('info'); // 清除导出中提示
      setTimeout(() => {
        addToast('success', '✅ PDF导出成功！');
      }, 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      clearToastsByType('info'); // 清除导出中提示
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

  const isLoading = status === 'uploading' || status === 'generating' || status === 'exporting';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
        {toasts.map((toast, index) => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onClose={removeToast}
            index={index}
          />
        ))}
      </div>

      {/* Fixed Header with Controls */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <BookText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Word Card Maker</h1>
              {words.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({words.length} cards generated)
                </span>
              )}
              {uploadedWordCount > 0 && words.length === 0 && (
                <span className="text-sm text-orange-600">
                  ({uploadedWordCount} words uploaded, ready to generate)
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Upload CSV */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {status === 'uploading' ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                Upload CSV
              </button>
              
              {/* Generate Cards */}
              <button
                onClick={handleGenerateCards}
                disabled={isLoading || status === 'idle'}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {status === 'generating' ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4 mr-1" />
                )}
                Generate
              </button>
              
              {words.length > 0 && (
                <>
                  {/* Download CSV */}
                  <button
                    onClick={handleDownloadCSV}
                    disabled={isLoading}
                    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </button>
                  
                  {/* Download Images */}
                  <button
                    onClick={handleDownloadImages}
                    disabled={isLoading}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {status === 'exporting' ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Image className="w-4 h-4 mr-1" />
                    )}
                    Images
                  </button>
                  
                  {/* Download Audio */}
                  <button
                    onClick={handleDownloadAudio}
                    disabled={isLoading}
                    className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {status === 'exporting' ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-1" />
                    )}
                    Audio
                  </button>
                  
                  {/* Download PDF */}
                  <button
                    onClick={handleExportPDF}
                    disabled={isLoading}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {status === 'exporting' ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {words.length === 0 ? (
            <div className="text-center py-16">
              <BookText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Welcome to Word Card Maker</h2>
              <p className="text-gray-500 mb-6">
                {status === 'uploaded' 
                  ? `${uploadedWordCount} words uploaded! Click "Generate" to create your cards.`
                  : 'Upload a CSV file with your words to get started'
                }
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
                <h3 className="font-semibold text-blue-800 mb-3">📋 CSV Format Requirements:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Required:</strong> Word column</li>
                  <li>• <strong>Optional:</strong> Definition, IPA, Example, Example_CN, Definition_CN, Audio, Picture</li>
                  <li>• Missing fields will be auto-completed using APIs and stock images</li>
                  <li>• Example: <code>Word,Definition,IPA</code></li>
                  <li>• Or just: <code>Word</code> (everything else will be generated)</li>
                </ul>
              </div>
              
              {status === 'uploaded' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
                  <p className="text-green-800 font-medium">
                    ✅ Ready to generate! Click the "Generate" button to create your word cards.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Page Navigation */}
              <div className="flex items-center justify-center space-x-4 mb-6 no-print">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-medium">
                  Page {currentPage + 1} of {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Page Info */}
              <div className="text-center mb-6 no-print">
                <p className="text-gray-600">
                  Showing cards {currentPage * CARDS_PER_PAGE + 1} to {Math.min((currentPage + 1) * CARDS_PER_PAGE, words.length)} of {words.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Each page contains front sides followed by corresponding back sides for printing
                </p>
              </div>

              {/* Print Pages Container */}
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
                <h3 className="font-semibold text-yellow-800 mb-2">📖 Printing Instructions:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Print the front page first, then flip the paper and print the back page</li>
                  <li>• Use A4 paper size for best results</li>
                  <li>• Each page contains 4 cards in A6 format</li>
                  <li>• Cut along the card borders after printing</li>
                  <li>• Download PDF for high-quality printing</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;