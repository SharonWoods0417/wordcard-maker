import React from 'react';
import { FourLineGrid } from './FourLineGrid';

// 新的字段结构，对应CSV格式
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

interface WordCardProps {
  word: ProcessedWordData;
  side: 'front' | 'back';
  className?: string;
}

// 拼读块颜色映射
const phonicsColors = [
  { bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200' },
  { bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200' },
  { bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-200' },
  { bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-200' },
  { bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-200' },
  { bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-200' },
  { bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', borderColor: 'border-indigo-200' },
  { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-200' },
  { bgColor: 'bg-teal-100', textColor: 'text-teal-800', borderColor: 'border-teal-200' },
  { bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-200' }
];

/* ========================================
 * 新版单词卡片 - Bolt设计标准
 * ======================================== 
 * 
 * ✅ 按照Bolt提供的HTML模板重新设计：
 * - 卡片最大宽度: 280px，防止过度拉伸
 * - 宽高比: 3:4 (aspect-[3/4])
 * - 正面区域分配: 图片35% + 单词25% + 音标12% + 拼读28%
 * - 集成拼读教学功能
 * - 保留SVG四线三格精确对齐
 * - 彩色拼读块显示
 * 
 * 🎯 设计特色：
 * - 儿童友好的大图片设计
 * - 手写体字体(Kalam)单词显示
 * - 彩色拼读块区分不同音素
 * - 专业的四线三格书写对齐
 * ======================================== */

export const WordCard: React.FC<WordCardProps> = ({ word, side, className = '' }) => {
  // 处理拼读块数据，确保是数组格式
  const phonicsChunks = Array.isArray(word.PhonicsChunks) 
    ? word.PhonicsChunks 
    : (typeof word.PhonicsChunks === 'string' ? word.PhonicsChunks.split(',').map((s: string) => s.trim()) : []);
  
  const phonicsIPA = Array.isArray(word.PhonicsIPA) 
    ? word.PhonicsIPA 
    : (typeof word.PhonicsIPA === 'string' ? word.PhonicsIPA.split(',').map((s: string) => s.trim()) : []);

  // 判断是否为打印卡片
  const isForPrint = className.includes('print-card');

  if (side === 'front') {
    return (
      <div className={`${isForPrint ? 'w-full h-full print-card' : 'w-full max-w-[280px]'} ${isForPrint ? '' : 'group cursor-pointer'}`} style={isForPrint ? { padding: 0, margin: 0, border: 'none', boxSizing: 'border-box' } : {}}>
        <div className={`${isForPrint ? 'print-card-content w-full h-full' : ''} bg-white rounded-lg ${isForPrint ? '' : 'shadow-lg border border-gray-200'} ${isForPrint ? '' : 'aspect-[3/4]'} overflow-hidden ${isForPrint ? '' : 'transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:z-10'} relative`} style={isForPrint ? { width: '100%', height: '100%', padding: 0, margin: 0, boxSizing: 'border-box' } : { width: '280px', height: '373px' }}>
          
          {/* 正面标签 - 只在非打印版本显示 */}
          {!isForPrint && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
              正面 Front
            </div>
          )}
          
          {/* 图片区域 - 保持35%比例 */}
          <div className="h-[35%] bg-gray-100 relative overflow-hidden">
            <img 
              src={word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`} 
              alt={word.Word}
              crossOrigin="anonymous"
              loading="eager"
              className="w-full h-full object-contain"
              style={{
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                console.log(`Failed to load image: ${word.Picture}`);
              }}
            />
          </div>
          
          {/* 单词区域 - 占比25% */}
          <div className="h-[25%] px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-center">
            <div className="relative w-full">
              {/* 使用SVG四线三格，保持精确对齐 */}
              <div 
                className="flex justify-center"
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FourLineGrid word={word.Word} width={600} height={150} />
              </div>
            </div>
          </div>
          
          {/* 音标区域 - 占比12%，与单词距离更近 */}
          <div className="h-[12%] px-3 flex items-center justify-center">
            <p className="text-base font-bold text-blue-700">
              {word.IPA}
            </p>
          </div>
          
          {/* 自然拼读区域 - 占比28%，分解上提 */}
          <div className="h-[28%] px-2 py-2 border-t border-gray-100 flex flex-col justify-start">
            <div className="space-y-1.5">
                             {/* 音节分解 - 动态生成拼读块，每个块不同颜色 */}
               <div className="flex justify-center space-x-1 flex-wrap gap-1">
                 {phonicsChunks.map((chunk: string, index: number) => {
                   const color = phonicsColors[index % phonicsColors.length];
                   
                   // 为PDF导出优化：使用内联样式代替动态类名
                   const getInlineStyles = () => {
                     const colorMap: Record<string, {bg: string, text: string, border: string}> = {
                       'bg-blue-100': { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
                       'bg-red-100': { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
                       'bg-green-100': { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
                       'bg-orange-100': { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' },
                       'bg-purple-100': { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
                       'bg-pink-100': { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
                       'bg-indigo-100': { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
                       'bg-yellow-100': { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
                       'bg-teal-100': { bg: '#ccfbf1', text: '#134e4a', border: '#99f6e4' },
                       'bg-cyan-100': { bg: '#cffafe', text: '#164e63', border: '#a5f3fc' }
                     };
                     
                     const colorStyle = colorMap[color.bgColor];
                     return colorStyle ? {
                       backgroundColor: colorStyle.bg,
                       color: colorStyle.text,
                       borderColor: colorStyle.border,
                       borderWidth: '1px',
                       borderStyle: 'solid',
                       borderRadius: '4px',
                       padding: '4px 6px',
                       fontSize: '12px',
                       fontWeight: '700',
                       display: 'inline-block'
                     } : {};
                   };
                   
                                        return (
                       <div 
                         key={index}
                         className={isForPrint ? '' : `${color.bgColor} ${color.textColor} ${color.borderColor} px-1.5 py-1 rounded text-xs font-bold border`}
                         style={isForPrint ? getInlineStyles() : {}}
                       >
                         {chunk}
                       </div>
                     );
                 })}
               </div>
               
               {/* 音标对应 - 统一灰色样式 */}
               <div className="flex justify-center space-x-1 flex-wrap gap-1">
                 {phonicsIPA.map((ipa: string, index: number) => (
                   <div 
                     key={index}
                     className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs"
                   >
                     {ipa}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================
   * 背面卡片 - Bolt设计标准
   * ======================================== 
   * 
   * ✅ 按照Bolt提供的反面模板设计：
   * - 音标区域顶部显示
   * - 中文释义区域突出显示
   * - 例句区域包含英文和中文
   * - 简洁清晰的布局
   * - 响应式设计
   * ======================================== */
  
  return (
    <div className={`${isForPrint ? 'w-full h-full print-card word-card-back' : 'w-full max-w-[280px]'} ${isForPrint ? '' : 'group cursor-pointer'}`} style={isForPrint ? { padding: 0, margin: 0, border: 'none', boxSizing: 'border-box' } : {}}>
      <div className={`${isForPrint ? 'print-card-content w-full h-full' : ''} bg-white rounded-lg ${isForPrint ? '' : 'shadow-lg border border-gray-200'} ${isForPrint ? '' : 'aspect-[3/4]'} overflow-hidden ${isForPrint ? '' : 'transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:z-10'} relative`} style={isForPrint ? { width: '100%', height: '100%', padding: 0, margin: 0, boxSizing: 'border-box' } : { width: '280px', height: '373px' }}>
        
        {/* 反面标签 - 只在非打印版本显示 */}
        {!isForPrint && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
            反面 Back
          </div>
        )}
        
        {/* 顶部留白区域 - 为标签预留空间（非打印版本） */}
        <div className={isForPrint ? "h-[6%]" : "h-[12%]"}></div>
        
        {/* 音标区域 - 恢复占比18% */}
        <div className="h-[18%] px-3 flex items-center justify-center">
          <div className="text-center bg-gray-50 rounded-lg py-2 w-full">
            <p className="text-base font-bold text-blue-700">
              {word.IPA}
            </p>
          </div>
        </div>
        
        {/* 中文释义区域 - 占比20% */}
        <div className="h-[20%] px-3 flex flex-col justify-center">
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
            <p className="text-xs font-bold text-gray-800 mb-1">中文释义:</p>
            <p className="text-sm text-gray-700 font-medium">
              {word.Definition_CN}
            </p>
          </div>
        </div>
        
        {/* 例句区域 - 占比50% */}
        <div className="h-[50%] px-3 pb-3 flex flex-col justify-start">
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 h-full overflow-hidden">
            <p className="text-xs font-bold text-gray-800 mb-1">例句:</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-2 font-medium">
              "{word.Example}"
            </p>
            <p className="text-xs font-bold text-gray-800 mb-1">中文解释:</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {word.Example_CN}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};