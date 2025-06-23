import React from 'react';
import { WordCard } from './WordCard';

// 更新接口以匹配新的字段结构
interface ProcessedWordData {
  Word: string;                           // 单词本身，主显示内容
  IPA: string;                            // 音标（完整显示）
  PhonicsChunks: string[] | string;       // 拼读拆分块，逗号分隔的拼读单元
  PhonicsIPA: string[] | string;          // 对应每个拼读块的音标，逗号分隔
  Definition_CN: string;                  // 中文释义（简洁）
  Example: string;                        // 英文例句
  Example_CN: string;                     // 例句中文解释
  Picture: string;                        // 图片
  Audio: string;                          // 音频（暂未使用）
}

interface PrintPageProps {
  words: ProcessedWordData[];
  side: 'front' | 'back';
  pageNumber: number;
}

/* ========================================
 * 预览区页面 - 2x2布局，每页4张卡片
 * ======================================== 
 * 
 * ✅ 规定的布局要求：
 * - 每页显示4张卡片，2x2布局
 * - 保持原有的容器尺寸和卡片大小
 * - 适配A4页面打印
 * - 使用CSS Grid实现精确布局
 * 
 * 🎯 布局特点：
 * - 卡片尺寸适配容器，不会被压缩或拉伸
 * - 统一间距，整齐排版
 * - 保持原有的print-page样式
 * ======================================== */

export const PrintPage: React.FC<PrintPageProps> = ({ words, side, pageNumber }) => {
  // Each page shows 4 cards (2x2 grid)
  const startIndex = pageNumber * 4;
  const pageWords = words.slice(startIndex, startIndex + 4);
  
  // Keep the same order for both front and back
  const displayWords = pageWords;

  return (
    <div className="print-page">
      {/* Page Header */}
      <div className="text-center py-1 text-xs text-gray-500 no-print" style={{ height: '20px', flexShrink: 0, zIndex: 50, position: 'relative' }}>
        Page {pageNumber + 1} - {side === 'front' ? 'Front' : 'Back'} Side
      </div>
      
      {/* Card Grid - 2x2 layout for A6 cards on A4 */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        {displayWords.map((word, index) => (
          <div 
            key={`${word?.Word || 'empty'}-${side}-${index}`} 
            className="w-full h-full"
          >
            {word ? (
              <WordCard 
                word={word} 
                side={side}
                className="print-card"
              />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg bg-white flex items-center justify-center">
                <span className="text-gray-400 text-sm">Empty Card</span>
              </div>
            )}
          </div>
        ))}
        
        {/* Fill empty slots if less than 4 cards */}
        {displayWords.length < 4 && 
          Array.from({ length: 4 - displayWords.length }).map((_, index) => (
            <div 
              key={`empty-${index + displayWords.length}`} 
              className="w-full h-full"
            >
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg bg-white flex items-center justify-center">
                <span className="text-gray-400 text-sm">Empty Card</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};