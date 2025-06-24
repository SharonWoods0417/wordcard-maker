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
  Loader2
} from 'lucide-react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// 新的PDF导出组件
import { PDFDownloadLink } from '@react-pdf/renderer';
import PdfDocument from './components/pdf/PdfDocument';
import { WordEntry } from './components/WordCardShared';

import { WordCard } from './components/WordCard';
import { PrintPreviewWithReact } from './components/PrintPreviewWithReact';
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

// PDF组件所需的数据类型已整合到WordEntry中


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

// Toast功能已移除，保持界面简洁

function App() {
  const [words, setWords] = useState<ProcessedWordData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [uploadedWordCount, setUploadedWordCount] = useState(0);
  const [parsedWords, setParsedWords] = useState<WordData[]>([]);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CARDS_PER_PAGE = 4;
  const totalPages = Math.ceil(words.length / CARDS_PER_PAGE);

  // Toast功能已移除，保持界面简洁

  // 弹窗处理函数 - 优化后直接生成卡片
  const handleWordConfirmation = async (selectedWordData?: any[]) => {
    if (selectedWordData && selectedWordData.length > 0) {
      setParsedWords(selectedWordData);
      console.log(`✅ 已确认处理 ${selectedWordData.length} 个单词，正在生成卡片...`);
      
      // 直接开始生成卡片，无需用户再点击Generate按钮
      setTimeout(async () => {
        await handleGenerateCardsInternal(selectedWordData);
      }, 500); // 给用户一点时间看到确认消息
    }
  };

  const handleWordCancellation = () => {
    console.log('📋 已取消单词处理');
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
    
    // Toast功能已移除，消息记录到控制台
    console.log('🔔 已清理所有状态');
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log('✅ 应用状态已重置');
  };

  // Auto-complete missing fields using local resources
  const autoCompleteWord = async (word: WordData): Promise<ProcessedWordData> => {
    // 临时自然拼读生成函数
    const generatePhonics = (word: string): { chunks: string[], ipa: string[] } => {
      const wordLower = word.toLowerCase();
      
      // 简单的拼读规则库（临时使用）
      const phonicsRules: { [key: string]: { chunks: string[], ipa: string[] } } = {
        'apple': { chunks: ['ap', 'ple'], ipa: ['/æp/', '/pəl/'] },
        'banana': { chunks: ['ba', 'na', 'na'], ipa: ['/bə/', '/næ/', '/nə/'] },
        'adventure': { chunks: ['ad', 'ven', 't', 'ure'], ipa: ['/əd/', '/ven/', '/t/', '/ʃər/'] },
        'freedom': { chunks: ['free', 'dom'], ipa: ['/friː/', '/dəm/'] },
        'guitar': { chunks: ['gui', 'tar'], ipa: ['/gɪ/', '/tɑːr/'] },
        'happiness': { chunks: ['hap', 'pi', 'ness'], ipa: ['/hæp/', '/pɪ/', '/nəs/'] },
        'knowledge': { chunks: ['know', 'l', 'edge'], ipa: ['/nəʊ/', '/l/', '/ɪdʒ/'] },
        'mountain': { chunks: ['moun', 'tain'], ipa: ['/maʊn/', '/tən/'] },
        'sunlight': { chunks: ['sun', 'light'], ipa: ['/sʌn/', '/laɪt/'] },
        'whisper': { chunks: ['whis', 'per'], ipa: ['/wɪs/', '/pər/'] }
      };
      
      // 如果在规则库中找到了精确匹配
      if (phonicsRules[wordLower]) {
        return phonicsRules[wordLower];
      }
      
      // 通用拼读规则（简化版）
      const generateGenericPhonics = (word: string): { chunks: string[], ipa: string[] } => {
        // 简单的音节分割规则
        const syllables = word.match(/[aeiou]+[bcdfghjklmnpqrstvwxyz]*|[bcdfghjklmnpqrstvwxyz]*[aeiou]+/gi) || [word];
        
        // 为每个音节生成简单的IPA（这是简化版）
        const ipaMap: { [key: string]: string } = {
          'a': '/æ/', 'e': '/e/', 'i': '/ɪ/', 'o': '/ɒ/', 'u': '/ʌ/',
          'th': '/θ/', 'sh': '/ʃ/', 'ch': '/tʃ/', 'ng': '/ŋ/',
          'ed': '/d/', 'ing': '/ɪŋ/', 'tion': '/ʃən/'
        };
        
        const chunks = syllables.slice(0, 4); // 最多4个块
        const ipa = chunks.map(chunk => {
          // 简单映射，实际应该使用专业的发音库
          for (const [pattern, pronunciation] of Object.entries(ipaMap)) {
            if (chunk.toLowerCase().includes(pattern)) {
              return pronunciation;
            }
          }
          return `/${chunk}/`; // 默认返回
        });
        
        return { chunks, ipa };
      };
      
      return generateGenericPhonics(wordLower);
    };
    
    // 生成拼读内容
    const phonics = generatePhonics(word.Word);
    
    const completed: ProcessedWordData = {
      Word: word.Word,
      Definition: word.Definition || `Definition for ${word.Word}`,
      IPA: word.IPA || `/ˈwɜːrd/`,
      Example: word.Example || `This is an example sentence with ${word.Word}.`,
      Example_CN: word.Example_CN || `这是一个包含 ${word.Word} 的例句。`,
      Definition_CN: word.Definition_CN || `n. ${word.Word}的中文释义`,
      Audio: word.Audio ? (word.Audio.startsWith('/media/') ? word.Audio : `/media/${word.Audio}`) : `/media/${word.Word.toLowerCase()}.mp3`,
      Picture: word.Picture ? (word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`) : `/media/${word.Word.toLowerCase()}.jpg`,
      // 添加生成的拼读字段
      PhonicsChunks: phonics.chunks,
      PhonicsIPA: phonics.ipa
    };

    console.log(`Generated card for: ${word.Word} using local resources`);
    console.log(`  -> Phonics chunks: ${phonics.chunks.join(', ')}`);
    console.log(`  -> Phonics IPA: ${phonics.ipa.join(', ')}`);
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
      console.log("Toast消息已记录到控制台");
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
      console.log("Toast消息已记录到控制台");
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
    console.log("Toast消息已记录到控制台");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // 检查解析错误
          if (results.errors && results.errors.length > 0) {
            const errorMessages = results.errors.map(err => err.message).join('; ');
            setStatus('uploadError');
            console.log("Toast清理已记录到控制台");
            setTimeout(() => {
              console.log("Toast消息已记录到控制台");
            }, 100);
            return;
          }

          // 检查是否有数据
          if (!results.data || results.data.length === 0) {
            setStatus('uploadError');
            console.log("Toast清理已记录到控制台");
            setTimeout(() => {
              console.log("Toast消息已记录到控制台");
            }, 100);
            return;
          }

          const parsedWords = results.data as WordData[];
          
          // 检查是否有Word列
          const firstRow = parsedWords[0];
          if (!firstRow || !('Word' in firstRow)) {
            setStatus('uploadError');
            console.log("Toast清理已记录到控制台");
            setTimeout(() => {
              console.log("Toast消息已记录到控制台");
            }, 100);
            return;
          }

          // 过滤有效单词
          const validWords = parsedWords.filter(word => word.Word && word.Word.trim());
          
          if (validWords.length === 0) {
            setStatus('uploadError');
            console.log("Toast清理已记录到控制台");
            setTimeout(() => {
              console.log("Toast消息已记录到控制台");
            }, 100);
            return;
          }

          // 验证单词格式
          const englishWords = validWords.filter(word => 
            /^[a-zA-Z\s\-']+$/.test(word.Word.trim())
          );

          if (englishWords.length === 0) {
            setStatus('uploadError');
            console.log("Toast清理已记录到控制台");
            setTimeout(() => {
              console.log("Toast消息已记录到控制台");
            }, 100);
            return;
          }

          if (englishWords.length < validWords.length) {
            console.log("Toast消息已记录到控制台");
          }

          processUploadedWords(englishWords, 'CSV');
        } catch (error) {
          console.error('CSV parsing error:', error);
          setStatus('uploadError');
          console.log("Toast清理已记录到控制台");
          setTimeout(() => {
            console.log("Toast消息已记录到控制台");
          }, 100);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
      }
    });
  };

  // Handle TXT upload
  const handleTXTUpload = (file: File) => {
    console.log("Toast消息已记录到控制台");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // 检查文件内容
        if (!text) {
          setStatus('uploadError');
          console.log("Toast清理已记录到控制台");
          setTimeout(() => {
            console.log("Toast消息已记录到控制台");
          }, 100);
          return;
        }

        if (text.trim() === '') {
          setStatus('uploadError');
          console.log("Toast清理已记录到控制台");
          setTimeout(() => {
            console.log("Toast消息已记录到控制台");
          }, 100);
          return;
        }

        // 检查文件大小（内容长度）
        if (text.length > 50000) { // 约50KB文本内容
          console.log("Toast消息已记录到控制台");
        }

        // 智能解析：支持多种分隔符
        const words = parseTXTContent(text);

        if (words.length === 0) {
          setStatus('uploadError');
          console.log("Toast清理已记录到控制台");
          setTimeout(() => {
            console.log("Toast消息已记录到控制台");
          }, 100);
          return;
        }

        // 检查单词数量限制
        if (words.length > 1000) {
          console.log("Toast消息已记录到控制台");
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
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setStatus('uploadError');
      console.log("Toast清理已记录到控制台");
      setTimeout(() => {
        console.log("Toast消息已记录到控制台");
      }, 100);
    };

    // 尝试以UTF-8编码读取，如果失败，某些情况下会自动回退
    try {
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      console.error('FileReader readAsText error:', error);
      setStatus('uploadError');
      console.log("Toast清理已记录到控制台");
      setTimeout(() => {
        console.log("Toast消息已记录到控制台");
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
    console.log("Toast消息已记录到控制台");

    try {
      // 检查文件是否为有效的docx文件
      if (!file.name.toLowerCase().endsWith('.docx')) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 先获取ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // 检查文件是否被正确读取
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 使用mammoth库解析DOCX文件
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      // 检查是否成功提取到文本
      if (!text) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      if (text.trim() === '') {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 检查提取的文本长度
      if (text.length > 100000) { // 约100KB文本内容
        console.log("Toast消息已记录到控制台");
      }

      // 复用TXT解析逻辑，支持多种分隔符
      const words = parseTXTContent(text);

      if (words.length === 0) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 检查单词数量
      if (words.length > 1000) {
        console.log("Toast消息已记录到控制台");
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
      console.log("Toast清理已记录到控制台");
      setTimeout(() => {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.log("Toast消息已记录到控制台");
      }, 100);
    }
  };

  // Handle XLSX upload
  const handleXLSXUpload = async (file: File) => {
    console.log("Toast消息已记录到控制台");

    try {
      // 检查文件是否为有效的Excel文件
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 读取文件为ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // 检查文件是否被正确读取
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 使用xlsx库解析Excel文件
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // 检查工作簿是否有效
      if (!workbook || !workbook.SheetNames) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }
      
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 检查工作表是否有效
      if (!worksheet) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 将工作表转换为JSON格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (!jsonData || jsonData.length === 0) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }
      
      // 检查数据结构
      if (jsonData.length === 1) {
        console.log("Toast消息已记录到控制台");
      }

      // 智能提取单词
      const words = extractWordsFromExcelData(jsonData as any[][]);
      
      if (words.length === 0) {
        setStatus('uploadError');
        console.log("Toast清理已记录到控制台");
        setTimeout(() => {
          console.log("Toast消息已记录到控制台");
        }, 100);
        return;
      }

      // 检查单词数量
      if (words.length > 1000) {
        console.log("Toast消息已记录到控制台");
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
      console.log("Toast清理已记录到控制台");
      setTimeout(() => {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        if (errorMessage.includes('Unsupported file type')) {
          console.log("Toast消息已记录到控制台");
        } else if (errorMessage.includes('password')) {
          console.log("Toast消息已记录到控制台");
        } else {
          console.log("Toast消息已记录到控制台");
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
    console.log("Toast清理已记录到控制台");
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
      console.log("Toast消息已记录到控制台");
    }, 100);
  };

  // 内部卡片生成函数 - 接受单词数据参数
  const handleGenerateCardsInternal = async (wordsToProcess: WordData[]) => {
    setStatus('generating');
    console.log("Toast消息已记录到控制台");

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
          console.log("Toast清理已记录到控制台");
          console.log("Toast消息已记录到控制台");
        }
        
        // Add small delay to show progress and avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setWords(completedWords);
      setCurrentPage(0);
      setStatus('generated');
      console.log("Toast清理已记录到控制台");
      setTimeout(() => {
        console.log("Toast消息已记录到控制台");
      }, 100);
    } catch (error) {
      console.error('Error during generation:', error);
      setStatus('generationError');
      console.log("Toast清理已记录到控制台");
      setTimeout(() => {
        console.log("Toast消息已记录到控制台");
      }, 100);
    }
  };

  // 保留原Generate按钮的兼容性（如果需要手动触发）
  const handleGenerateCards = async () => {
    if (parsedWords.length === 0) {
      console.log("Toast消息已记录到控制台");
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
    console.log("Toast消息已记录到控制台");
    
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
    
    console.log("Toast消息已记录到控制台");
  };

  // 手动输入取消处理
  const handleManualInputCancel = () => {
    setIsManualInputOpen(false);
    console.log("Toast消息已记录到控制台");
  };

  const handleViewExample = () => {
    console.log("Toast消息已记录到控制台");
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
        console.log("Toast消息已记录到控制台");
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
        console.log("Toast消息已记录到控制台");
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      console.log("Toast消息已记录到控制台");
    }
  };

  // 数据格式转换函数：将ProcessedWordData转换为WordEntry格式
  const convertToWordEntry = (processedWords: ProcessedWordData[]): WordEntry[] => {
    return processedWords.map(word => ({
      Word: word.Word,
      IPA: word.IPA,
      PhonicsChunks: word.PhonicsChunks,
      PhonicsIPA: word.PhonicsIPA,
      Definition_CN: word.Definition_CN,
      Example: word.Example,
      Example_CN: word.Example_CN,
      Picture: word.Picture,
      Audio: word.Audio,
    }));
  };

  const handleExportPDF = async () => {
    // 这个函数现在可以被废弃，因为我们将使用PDFDownloadLink组件
    // 但为防止其他地方调用，暂时保留一个空函数或提示
    console.log("PDF导出功能已更新，请点击新的'下载PDF'按钮。");
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // 测试PDF布局功能已移除，保持界面简洁

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header 
        onUploadClick={handleUploadClick}
        onGenerateClick={handleGenerateCards}
        onExportPDF={handleExportPDF}
        onTestPDFLayout={undefined}
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
                    className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="重新编辑单词列表"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    编辑单词表
                  </button>

                  {/* 新的高质量PDF下载按钮 */}
                  <PDFDownloadLink
                    document={<PdfDocument words={convertToWordEntry(words)} />}
                    fileName="wordcards_high_quality.pdf"
                    className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {({ loading }) =>
                      loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          下载PDF
                        </>
                      )
                    }
                  </PDFDownloadLink>
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
                {/* 使用预览页面组件，提供更好的预览体验 */}
                <PrintPreviewWithReact 
                  words={words} 
                  currentPage={currentPage}
                  cardsPerPage={CARDS_PER_PAGE}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast功能已移除，保持界面简洁 */}

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