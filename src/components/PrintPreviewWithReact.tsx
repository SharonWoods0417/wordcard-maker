import React from 'react';
import { PrintLayoutWithWordCards } from './PrintLayoutWithWordCards';
import { usePDFExportWithReact } from '../hooks/usePDFExportWithReact';

// 定义接口 - 匹配App.tsx中的ProcessedWordData
interface ProcessedWordData {
  Word: string;
  Definition: string;
  IPA: string;
  Example: string;
  Example_CN: string;
  Definition_CN: string;
  Audio: string;
  Picture: string;
  PhonicsChunks: string[] | string;
  PhonicsIPA: string[] | string;
}

interface PrintPreviewWithReactProps {
  words?: ProcessedWordData[];
  currentPage?: number;
  cardsPerPage?: number;
}

/**
 * React组件渲染的预览页面
 */
export const PrintPreviewWithReact: React.FC<PrintPreviewWithReactProps> = ({ 
  words, 
  currentPage = 0, 
  cardsPerPage = 4 
}) => {
  const { renderReactComponentToPDF } = usePDFExportWithReact();

  const handleExportFrontSide = () => {
    renderReactComponentToPDF('wordcard-front-side.pdf', 'front');
  };

  const handleExportBackSide = () => {
    renderReactComponentToPDF('wordcard-back-side.pdf', 'back');
  };

  // 根据当前页面和每页卡片数量计算当前页的单词
  const startIndex = currentPage * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentPageWords = words?.slice(startIndex, endIndex);

  // 调试信息
  console.log(`分页信息 - 当前页: ${currentPage + 1}, 每页: ${cardsPerPage}, 总单词: ${words?.length || 0}`);
  console.log(`显示范围: ${startIndex + 1}-${Math.min(endIndex, words?.length || 0)}, 当前页单词数: ${currentPageWords?.length || 0}`);
  console.log(`当前页单词:`, currentPageWords?.map(w => w.Word).join(', '));

  // 转换数据格式以匹配PrintLayoutWithWordCards的要求
  const convertedWords = currentPageWords?.map(word => ({
    Word: word.Word,
    IPA: word.IPA,
    PhonicsChunks: Array.isArray(word.PhonicsChunks) ? word.PhonicsChunks : word.PhonicsChunks.split(',').map(s => s.trim()),
    PhonicsIPA: Array.isArray(word.PhonicsIPA) ? word.PhonicsIPA : word.PhonicsIPA.split(',').map(s => s.trim()),
    Definition_CN: word.Definition_CN,
    Example: word.Example,
    Example_CN: word.Example_CN,
    Picture: word.Picture,
    Audio: word.Audio,
    Definition: word.Definition
  }));

  // 如果当前页没有单词，显示提示信息
  if (!currentPageWords || currentPageWords.length === 0) {
    return (
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">当前页没有单词卡片</h3>
            <p className="text-gray-500">
              第 {currentPage + 1} 页暂无内容，请返回上一页或重新生成单词卡片
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-8">
      {/* 页面标题显示当前页信息 */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            第 {currentPage + 1} 页单词卡片预览
          </h1>
          <p className="text-gray-600">
            显示第 {startIndex + 1}-{Math.min(endIndex, words?.length || 0)} 张卡片，共 {currentPageWords.length} 张
          </p>
        </div>
      </div>

      {/* 预览区域 - 正面 */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">正面预览</h2>
          <div className="flex justify-center">
            <div 
              data-component="PrintPreviewWithReact"
              style={{ 
                border: '2px solid #10b981',
                borderRadius: '8px',
                overflow: 'visible',
                padding: '50px 20px',
                background: '#f8fafc'
              }}
            >
              <PrintLayoutWithWordCards words={convertedWords} showBothSides={false} />
            </div>
          </div>
        </div>
      </div>

      {/* 分页标识 */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg mx-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">页面分隔 • 第{currentPage + 1}页正面结束 → 第{currentPage + 1}页反面开始</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
        
        {/* 提示信息 */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm text-amber-800 font-medium">
              打印时正面和反面应分别放在不同页面，便于双面打印对齐
            </span>
          </div>
        </div>
      </div>

      {/* 预览区域 - 反面 */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">反面预览</h2>
          <div className="flex justify-center">
            <div 
              data-component="PrintPreviewWithReact"
              style={{ 
                border: '2px solid #10b981',
                borderRadius: '8px',
                overflow: 'visible',
                padding: '50px 20px',
                background: '#f8fafc'
              }}
            >
              <PrintLayoutWithWordCards words={convertedWords} showBothSides={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 