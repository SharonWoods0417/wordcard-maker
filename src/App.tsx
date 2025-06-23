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
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { WordCard } from './components/WordCard';
import { PrintPage } from './components/PrintPage';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CardShowcaseSection } from './components/CardShowcaseSection';
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
  // 新增字段支持拼读教学
  PhonicsChunks: string[] | string;
  PhonicsIPA: string[] | string;
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
      Picture: word.Picture ? (word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`) : `/media/${word.Word.toLowerCase()}.jpg`,
      // 添加默认的拼读字段
      PhonicsChunks: [],
      PhonicsIPA: []
    };

    console.log(`Generated card for: ${word.Word} using local resources`);
    return completed;
  };

  // Handle file upload (CSV/TXT)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 重置应用状态，确保干净的开始
    resetAppState();
    
    // 基础文件验证
    const validationResult = validateFile(file);
    if (!validationResult.isValid) {
      setStatus('uploadError');
      addToast('error', validationResult.errorMessage);
      return;
    }
    
    setStatus('uploading');

    // 根据文件类型选择不同的处理方式
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      handleCSVUpload(file);
    } else if (fileExtension === 'txt') {
      handleTXTUpload(file);
    } else if (fileExtension === 'docx') {
      handleDOCXUpload(file);
    } else if (fileExtension === 'xlsx') {
      handleXLSXUpload(file);
    } else {
      setStatus('uploadError');
      addToast('error', '❌ 不支持的文件格式。请上传CSV、TXT、DOCX或XLSX文件。');
    }
  };

  // 文件验证函数
  const validateFile = (file: File): { isValid: boolean; errorMessage: string } => {
    // 检查文件是否存在
    if (!file) {
      return { isValid: false, errorMessage: '❌ 未选择任何文件，请重新选择。' };
    }

    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, errorMessage: '❌ 文件过大，请上传小于10MB的文件。' };
    }

    // 检查文件是否为空
    if (file.size === 0) {
      return { isValid: false, errorMessage: '❌ 文件为空，请选择包含内容的文件。' };
    }

    // 检查文件名
    if (!file.name || file.name.trim() === '') {
      return { isValid: false, errorMessage: '❌ 文件名无效，请重新选择文件。' };
    }

    // 检查文件扩展名
    const fileName = file.name.toLowerCase();
    const supportedExtensions = ['.csv', '.txt', '.docx', '.xlsx'];
    const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return { 
        isValid: false, 
        errorMessage: '❌ 不支持的文件格式。支持的格式：CSV、TXT、DOCX、XLSX。' 
      };
    }

    // 检查文件类型（MIME type）
    const validMimeTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream' // 某些系统可能返回这个通用类型
    ];

    // 对于某些文件，浏览器可能不能正确识别MIME类型，所以这个检查相对宽松
    if (file.type && !validMimeTypes.includes(file.type)) {
      console.warn(`文件MIME类型警告: ${file.type}，但将继续处理`);
    }

    return { isValid: true, errorMessage: '' };
  };

  // Handle CSV upload
  const handleCSVUpload = (file: File) => {
    addToast('info', '📄 正在解析CSV文件...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // 检查解析错误
          if (results.errors && results.errors.length > 0) {
            const errorMessages = results.errors.map(err => err.message).join('; ');
            setStatus('uploadError');
            clearToastsByType('info');
            setTimeout(() => {
              addToast('error', `❌ CSV解析错误：${errorMessages}`);
            }, 100);
            return;
          }

          // 检查是否有数据
          if (!results.data || results.data.length === 0) {
            setStatus('uploadError');
            clearToastsByType('info');
            setTimeout(() => {
              addToast('error', '❌ CSV文件为空或无法读取数据。');
            }, 100);
            return;
          }

          const parsedWords = results.data as WordData[];
          
          // 检查是否有Word列
          const firstRow = parsedWords[0];
          if (!firstRow || !('Word' in firstRow)) {
            setStatus('uploadError');
            clearToastsByType('info');
            setTimeout(() => {
              addToast('error', '❌ CSV文件格式错误：未找到"Word"列。请确保第一行包含列标题"Word"。');
            }, 100);
            return;
          }

          // 过滤有效单词
          const validWords = parsedWords.filter(word => word.Word && word.Word.trim());
          
          if (validWords.length === 0) {
            setStatus('uploadError');
            clearToastsByType('info');
            setTimeout(() => {
              addToast('error', '❌ CSV文件中没有找到有效单词。请检查"Word"列是否包含英文单词。');
            }, 100);
            return;
          }

          // 验证单词格式
          const englishWords = validWords.filter(word => 
            /^[a-zA-Z\s\-']+$/.test(word.Word.trim())
          );

          if (englishWords.length === 0) {
            setStatus('uploadError');
            clearToastsByType('info');
            setTimeout(() => {
              addToast('error', '❌ CSV文件中没有找到有效的英文单词。');
            }, 100);
            return;
          }

          if (englishWords.length < validWords.length) {
            addToast('info', `ℹ️ 已过滤掉 ${validWords.length - englishWords.length} 个无效单词，保留 ${englishWords.length} 个有效英文单词。`);
          }

          processUploadedWords(englishWords, 'CSV');
        } catch (error) {
          console.error('CSV parsing error:', error);
          setStatus('uploadError');
          clearToastsByType('info');
          setTimeout(() => {
            addToast('error', '❌ CSV文件处理失败：文件可能损坏或格式不正确。');
          }, 100);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', `❌ CSV文件读取失败：${error.message || '文件可能损坏'}`);
        }, 100);
      }
    });
  };

  // Handle TXT upload
  const handleTXTUpload = (file: File) => {
    addToast('info', '📝 正在解析TXT文件...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // 检查文件内容
        if (!text) {
          setStatus('uploadError');
          clearToastsByType('info');
          setTimeout(() => {
            addToast('error', '❌ TXT文件读取失败：无法获取文件内容。');
          }, 100);
          return;
        }

        if (text.trim() === '') {
          setStatus('uploadError');
          clearToastsByType('info');
          setTimeout(() => {
            addToast('error', '❌ TXT文件为空：请选择包含单词的文件。');
          }, 100);
          return;
        }

        // 检查文件大小（内容长度）
        if (text.length > 50000) { // 约50KB文本内容
          addToast('info', '⚠️ 文件内容较大，正在处理...');
        }

        // 智能解析：支持多种分隔符
        const words = parseTXTContent(text);

        if (words.length === 0) {
          setStatus('uploadError');
          clearToastsByType('info');
          setTimeout(() => {
            addToast('error', '❌ TXT文件中没有找到有效的英文单词。支持的分隔符：换行符、空格、逗号、分号。');
          }, 100);
          return;
        }

        // 检查单词数量限制
        if (words.length > 1000) {
          addToast('info', `⚠️ 文件包含 ${words.length} 个单词，数量较多，处理时间可能较长。`);
        }

        // 转换为WordData格式
        const wordDataList: WordData[] = words.map(word => ({
          Word: word
          // 其他字段将在后续自动补全
        }));

        processUploadedWords(wordDataList, 'TXT');
      } catch (error) {
        console.error('TXT parsing error:', error);
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ TXT文件处理失败：文件可能包含不支持的字符或格式错误。');
        }, 100);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setStatus('uploadError');
      clearToastsByType('info');
      setTimeout(() => {
        addToast('error', '❌ TXT文件读取失败：无法访问文件内容，请检查文件是否损坏。');
      }, 100);
    };

    // 尝试以UTF-8编码读取，如果失败，某些情况下会自动回退
    try {
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      console.error('FileReader readAsText error:', error);
      setStatus('uploadError');
      clearToastsByType('info');
      setTimeout(() => {
        addToast('error', '❌ TXT文件读取失败：无法启动文件读取器。');
      }, 100);
    }
  };

  // 智能解析TXT文件内容，支持多种分隔符
  const parseTXTContent = (text: string): string[] => {
    // 支持的分隔符：换行符(\n、\r)、空格、英文逗号(,)、中文逗号(，)、英文分号(;)、中文分号(；)
    // 使用正则表达式将所有分隔符统一替换为英文逗号
    const normalizedText = text.replace(/[\n\r\s,，;；]+/g, ',');
    
    // 以逗号分割
    const rawWords = normalizedText.split(',');
    
    // 清洗数据：去除空白字符、过滤空值、去重
    const cleanWords = rawWords
      .map(word => word.trim()) // 去除首尾空格
      .filter(word => word.length > 0) // 过滤空值
      .filter(word => /^[a-zA-Z\s-']+$/.test(word)) // 只保留英文单词（包含空格、连字符、撇号）
      .map(word => word.toLowerCase()) // 转为小写统一处理
      .filter((word, index, array) => array.indexOf(word) === index); // 去重
    
    console.log(`📝 TXT解析结果: 原始内容 -> ${rawWords.length} 项 -> 清洗后 ${cleanWords.length} 个有效单词`);
    console.log('🔍 解析出的单词:', cleanWords.slice(0, 10), cleanWords.length > 10 ? '...' : '');
    
    return cleanWords;
  };

  // Handle DOCX upload
  const handleDOCXUpload = async (file: File) => {
    addToast('info', '📄 正在解析Word文档...');

    try {
      // 检查文件是否为有效的docx文件
      if (!file.name.toLowerCase().endsWith('.docx')) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ 文件格式错误：请确保上传的是.docx格式的Word文档。');
        }, 100);
        return;
      }

      // 先获取ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // 检查文件是否被正确读取
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Word文档读取失败：文件可能损坏或无法访问。');
        }, 100);
        return;
      }

      // 使用mammoth库解析DOCX文件
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      // 检查是否成功提取到文本
      if (!text) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Word文档解析失败：无法提取文本内容，文件可能损坏。');
        }, 100);
        return;
      }

      if (text.trim() === '') {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Word文档为空：请确保文档包含文本内容。');
        }, 100);
        return;
      }

      // 检查提取的文本长度
      if (text.length > 100000) { // 约100KB文本内容
        addToast('info', '⚠️ Word文档内容较大，正在处理...');
      }

      // 复用TXT解析逻辑，支持多种分隔符
      const words = parseTXTContent(text);

      if (words.length === 0) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Word文档中没有找到有效的英文单词。请确保文档包含英文单词。');
        }, 100);
        return;
      }

      // 检查单词数量
      if (words.length > 1000) {
        addToast('info', `⚠️ 从Word文档中提取到 ${words.length} 个单词，数量较多，处理时间可能较长。`);
      }

      // 转换为WordData格式
      const wordDataList: WordData[] = words.map(word => ({
        Word: word
        // 其他字段将在后续自动补全
      }));

      processUploadedWords(wordDataList, 'DOCX');
    } catch (error) {
      console.error('DOCX parsing error:', error);
      setStatus('uploadError');
      clearToastsByType('info');
      setTimeout(() => {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        addToast('error', `❌ Word文档处理失败：${errorMessage.includes('Invalid') ? '文件格式无效' : '文件可能损坏或不受支持'}`);
      }, 100);
    }
  };

  // Handle XLSX upload
  const handleXLSXUpload = async (file: File) => {
    addToast('info', '📊 正在解析Excel文件...');

    try {
      // 检查文件是否为有效的Excel文件
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ 文件格式错误：请确保上传的是.xlsx或.xls格式的Excel文件。');
        }, 100);
        return;
      }

      // 读取文件为ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // 检查文件是否被正确读取
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Excel文件读取失败：文件可能损坏或无法访问。');
        }, 100);
        return;
      }

      // 使用xlsx库解析Excel文件
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // 检查工作簿是否有效
      if (!workbook || !workbook.SheetNames) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Excel文件解析失败：文件格式无效或损坏。');
        }, 100);
        return;
      }

      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Excel文件中没有找到工作表：请确保文件包含至少一个工作表。');
        }, 100);
        return;
      }
      
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 检查工作表是否有效
      if (!worksheet) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', `❌ 无法读取工作表"${firstSheetName}"：工作表可能损坏。`);
        }, 100);
        return;
      }

      // 将工作表转换为JSON格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (!jsonData || jsonData.length === 0) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', `❌ 工作表"${firstSheetName}"为空：请确保表格包含数据。`);
        }, 100);
        return;
      }
      
      // 检查数据结构
      if (jsonData.length === 1) {
        addToast('info', '⚠️ Excel只有标题行，正在检查是否包含有效数据...');
      }

      // 智能提取单词
      const words = extractWordsFromExcelData(jsonData as any[][]);
      
      if (words.length === 0) {
        setStatus('uploadError');
        clearToastsByType('info');
        setTimeout(() => {
          addToast('error', '❌ Excel文件中没有找到有效的英文单词。请确保表格包含英文单词，推荐使用"Word"列标题。');
        }, 100);
        return;
      }

      // 检查单词数量
      if (words.length > 1000) {
        addToast('info', `⚠️ 从Excel中提取到 ${words.length} 个单词，数量较多，处理时间可能较长。`);
      }

      // 转换为WordData格式
      const wordDataList: WordData[] = words.map(word => ({
        Word: word
        // 其他字段将在后续自动补全
      }));

      processUploadedWords(wordDataList, 'XLSX');
    } catch (error) {
      console.error('XLSX parsing error:', error);
      setStatus('uploadError');
      clearToastsByType('info');
      setTimeout(() => {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        if (errorMessage.includes('Unsupported file type')) {
          addToast('error', '❌ Excel文件格式不受支持：请使用标准的.xlsx或.xls格式。');
        } else if (errorMessage.includes('password')) {
          addToast('error', '❌ Excel文件被密码保护：请使用无密码保护的文件。');
        } else {
          addToast('error', '❌ Excel文件处理失败：文件可能损坏、格式无效或不受支持。');
        }
      }, 100);
    }
  };

  // 从Excel数据中智能提取单词
  const extractWordsFromExcelData = (data: any[][]): string[] => {
    if (!data || data.length === 0) return [];
    
    let allText = '';
    
    // 策略1: 检查是否有"Word"列（类似CSV格式）
    const headerRow = data[0];
    const wordColumnIndex = headerRow.findIndex((cell: any) => 
      typeof cell === 'string' && cell.toLowerCase() === 'word'
    );
    
    if (wordColumnIndex !== -1) {
      // 找到了Word列，提取该列的数据
      console.log('📊 发现Word列，使用结构化提取方式');
      for (let i = 1; i < data.length; i++) {
        const cell = data[i][wordColumnIndex];
        if (cell && typeof cell === 'string') {
          allText += cell + ' ';
        }
      }
    } else {
      // 策略2: 提取第一列的所有数据
      console.log('📊 未发现Word列，使用第一列提取方式');
      for (let i = 0; i < data.length; i++) {
        const cell = data[i][0];
        if (cell && typeof cell === 'string') {
          allText += cell + ' ';
        }
      }
      
      // 策略3: 如果第一列数据不够，提取所有文本内容
      if (allText.trim().length < 10) {
        console.log('📊 第一列数据不足，使用全表提取方式');
        allText = '';
        for (const row of data) {
          for (const cell of row) {
            if (cell && typeof cell === 'string') {
              allText += cell + ' ';
            }
          }
        }
      }
    }
    
    // 使用已有的智能解析函数处理文本
    const words = parseTXTContent(allText);
    
    console.log(`📊 Excel解析结果: 提取文本长度 ${allText.length} -> ${words.length} 个有效单词`);
    
    return words;
  };

  // 统一处理上传的单词数据
  const processUploadedWords = (wordDataList: WordData[], fileType: string) => {
    // 显示确认弹窗
    clearToastsByType('info');
    showWordConfirmationModal(
      wordDataList,
      handleWordConfirmation,
      handleWordCancellation
    );
    
    // 设置初始状态
    setUploadedWordCount(wordDataList.length);
    setWords([]);
    setCurrentPage(0);
    setStatus('uploaded');
    
    setTimeout(() => {
      addToast('success', `✅ ${fileType}解析成功！已识别 ${wordDataList.length} 个单词，请在弹窗中确认处理`);
    }, 100);
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
  const handleManualInputConfirm = async (words: string[]) => {
    setIsManualInputOpen(false);
    
    // 转换为WordData格式
    const wordDataList: WordData[] = words.map(word => ({
      Word: word.trim()
      // 其他字段将在后续自动补全
    }));

    // 直接生成卡片，不再显示确认弹窗
    setUploadedWordCount(wordDataList.length);
    addToast('success', `✅ 已确认 ${wordDataList.length} 个单词，正在生成卡片...`);
    
    // 直接开始生成卡片
    setTimeout(async () => {
      await handleGenerateCardsInternal(wordDataList);
    }, 500); // 给用户一点时间看到确认消息
  };

  // 手动输入的导出CSV功能
  const handleManualInputExportCSV = (words: string[]) => {
    // 构建CSV内容，包含补全的字段
    const csvHeaders = ['Word', 'Definition', 'IPA', 'Example', 'Example_CN', 'Definition_CN', 'Audio', 'Picture'];
    
    // 为每个单词生成补全数据（与autoCompleteWord函数逻辑一致）
    const csvRows = words.map(word => {
      return [
        word,
        `Definition for ${word}`,
        `/ˈwɜːrd/`,
        `This is an example sentence with ${word}.`,
        `这是一个包含 ${word} 的例句。`,
        `n. ${word}的中文释义`,
        `/media/${word.toLowerCase()}.mp3`,
        `/media/${word.toLowerCase()}.jpg`
      ];
    });

    // 构建完整的CSV内容
    const csvContent = [
      csvHeaders,
      ...csvRows
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `manual_words_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('success', `✅ CSV文件导出成功！包含 ${words.length} 个单词`);
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

  const handleDownloadTemplate = async () => {
    try {
      // 从public目录或项目根目录加载现有的模板文件
      const response = await fetch('/wordlist_template.csv');
      if (response.ok) {
        const csvContent = await response.text();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'wordlist_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        addToast('success', '📥 CSV模板下载成功！文件包含完整的字段格式示例');
      } else {
        // 备用方案：如果无法加载文件，使用硬编码的模板
        const csvContent = 'Word,Definition,IPA,Example,Example_CN,Definition_CN,Audio,Picture\napple,a round fruit,/ˈæpəl/,"I eat an apple every day","我每天吃一个苹果","n. 苹果",apple.mp3,apple.jpg\nbook,printed pages bound together,/bʊk/,"I read a book before bed","我睡前读一本书","n. 书",book.mp3,book.jpg';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'wordlist_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast('success', '📥 CSV模板下载成功！');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      addToast('error', '❌ 模板下载失败，请重试');
    }
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
        parsedWordsCount={parsedWords.length}
        onBackToEdit={() => {
          // TODO: 实现返回编辑功能
          console.log('返回编辑功能');
        }}
        onDownloadCSV={() => {
          // TODO: 实现CSV下载功能
          console.log('下载CSV功能');
        }}
        onDownloadAudio={() => {
          // TODO: 实现音频包下载功能
          console.log('下载音频包功能');
        }}
        onDownloadImages={() => {
          // TODO: 实现图片包下载功能
          console.log('下载图片包功能');
        }}
        onBackToHome={() => {
          resetAppState();
          setStatus('idle');
        }}
      />

      {/* 全宽信息栏 - 仅在预览页面显示 */}
      {(status === 'generated' || status === 'generating') && (
        <div className="bg-gray-50 border-b border-gray-200 shadow-sm pt-20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {status === 'generating' ? (
              <div className="flex items-center justify-center">
                <div className="flex items-center text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  正在生成单词卡片，请稍候...
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* 左侧：返回主页 | 显示信息 | 打印说明 */}
                <div className="flex items-center space-x-4">
                  {/* 返回主页按钮 */}
                  <button
                    onClick={() => {
                      resetAppState();
                      setStatus('idle');
                    }}
                    className="flex items-center px-3 py-2 bg-white text-gray-700 rounded border hover:bg-gray-50 transition-all duration-200"
                    title="返回主页重新开始"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    返回主页
                  </button>
                  
                  {/* 分隔线 */}
                  <div className="h-6 w-px bg-gray-300"></div>
                  
                  {/* 卡片统计信息 */}
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="font-medium">
                      显示 {currentPage * CARDS_PER_PAGE + 1}-{Math.min((currentPage + 1) * CARDS_PER_PAGE, words.length)} / {words.length} 张
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      包含正反面，适合打印
                    </span>
                  </div>
                </div>

                {/* 右侧：分页按钮 + 返回编辑（操作区） */}
                <div className="flex items-center space-x-3">
                  {/* 分页导航 */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className="flex items-center px-3 py-2 bg-white text-gray-700 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      title="上一页"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      上一页
                    </button>
                    
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded border text-sm font-medium">
                      第 {currentPage + 1} 页 / {totalPages}
                    </span>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className="flex items-center px-3 py-2 bg-white text-gray-700 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      title="下一页"
                    >
                      下一页
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  
                  {/* 返回编辑按钮 */}
                  <button
                    onClick={() => {
                      showWordConfirmationModal(
                        parsedWords, 
                        handleWordConfirmation, 
                        handleWordCancellation
                      );
                    }}
                    disabled={parsedWords.length === 0}
                    className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="重新编辑单词列表"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    编辑单词表
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={status === 'idle' || status === 'uploading' || status === 'uploaded' || status === 'uploadError' ? "pt-24 pb-8" : "pt-4 pb-8"}>
        {status === 'idle' || status === 'uploading' || status === 'uploaded' || status === 'uploadError' ? (
          // Show new homepage
          <div className="max-w-7xl mx-auto">
            <HeroSection 
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
              onManualInput={handleManualInput}
              status={status}
              onDownloadTemplate={handleDownloadTemplate}
            />
            <CardShowcaseSection />
          </div>
        ) : (
          // Show existing card generation interface (保持原有逻辑)
          <div className="max-w-7xl mx-auto px-4 space-y-6">
            
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
        onExportCSV={handleManualInputExportCSV}
      />
    </div>
  );
}

export default App; 