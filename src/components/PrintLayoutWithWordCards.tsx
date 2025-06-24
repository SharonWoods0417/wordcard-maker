import React from 'react';
import { WordCard } from './WordCard';

// 示例单词数据
const sampleWords = [
  {
    Word: "apple",
    IPA: "/ˈæp.əl/",
    PhonicsChunks: ["a", "pp", "le"],
    PhonicsIPA: ["/æ/", "/p/", "/əl/"],
    Definition_CN: "苹果",
    Example: "I eat an apple every day.",
    Example_CN: "我每天吃一个苹果。",
    Picture: "apple.jpg",
    Audio: "apple.mp3"
  },
  {
    Word: "banana",
    IPA: "/bəˈnɑː.nə/",
    PhonicsChunks: ["ba", "na", "na"],
    PhonicsIPA: ["/bə/", "/nɑː/", "/nə/"],
    Definition_CN: "香蕉",
    Example: "The banana is yellow and sweet.",
    Example_CN: "香蕉是黄色的，很甜。",
    Picture: "banana.jpg",
    Audio: "banana.mp3"
  },
  {
    Word: "cat",
    IPA: "/kæt/",
    PhonicsChunks: ["c", "a", "t"],
    PhonicsIPA: ["/k/", "/æ/", "/t/"],
    Definition_CN: "猫",
    Example: "The cat is sleeping on the sofa.",
    Example_CN: "猫正在沙发上睡觉。",
    Picture: "adventure.jpg", // 使用现有的测试图片
    Audio: "adventure.mp3"
  },
  {
    Word: "dog",
    IPA: "/dɔːɡ/",
    PhonicsChunks: ["d", "o", "g"],
    PhonicsIPA: ["/d/", "/ɔː/", "/ɡ/"],
    Definition_CN: "狗",
    Example: "My dog loves to play fetch.",
    Example_CN: "我的狗喜欢玩捡球游戏。",
    Picture: "freedom.jpg", // 使用现有的测试图片
    Audio: "freedom.mp3"
  }
];

interface PrintLayoutWithWordCardsProps {
  words?: Array<{
    Word: string;
    IPA: string;
    PhonicsChunks: string[] | string;
    PhonicsIPA: string[] | string;
    Definition_CN: string;
    Example: string;
    Example_CN: string;
    Picture: string;
    Audio: string;
    Definition?: string;
  }>;
  showBothSides?: boolean;
}

/**
 * 包含真实WordCard组件的打印布局
 * 用于React组件渲染PDF导出
 * 精确使用mm单位计算尺寸
 */
export const PrintLayoutWithWordCards: React.FC<PrintLayoutWithWordCardsProps> = ({ 
  words = sampleWords, 
  showBothSides = false 
}) => {
  // 精确的mm转px计算 (96 DPI标准：1mm = 3.7795275591px)
  const mmToPx = (mm: number) => Math.round(mm * 3.7795275591);
  
  // A4纸张标准尺寸：210mm × 297mm
  const a4Width = mmToPx(210);   // 794px
  const a4Height = mmToPx(297);  // 1123px
  
  // 单词卡片标准尺寸：85mm × 135mm (保持真实尺寸)
  const cardWidth = mmToPx(85);   // 321px
  const cardHeight = mmToPx(135); // 510px
  
  // 计算布局参数
  const pagePadding = 20; // 页面内边距
  const cardGapH = 40;    // 水平间距40px，方便裁减
  const cardGapV = 20;    // 垂直间距20px，加上下排卡片下移10px，总共30px
  const titleHeight = 20; // 进一步减小标题区域高度
  
  // 可用区域计算
  const availableWidth = a4Width - (pagePadding * 2);
  const availableHeight = a4Height - (pagePadding * 2) - titleHeight;
  
  return (
    <div 
      className="print-layout-new"
      style={{
        width: `${a4Width}px`,
        height: `${a4Height}px`,
        background: 'white',
        padding: `${pagePadding}px`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        border: '3px solid #2563eb',
        borderRadius: '0px', // A4纸张直角
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        position: 'relative'
      }}
    >
      {/* 页面尺寸标识 */}
      <div 
        style={{
          position: 'absolute',
          top: '-35px',
          left: '0',
          background: '#2563eb',
          color: 'white',
          padding: '4px 12px',
          fontSize: '14px',
          fontFamily: 'monospace',
          borderRadius: '6px',
          fontWeight: 'bold',
          zIndex: 100
        }}
      >
        📄 A4页面: {a4Width}×{a4Height}px (210×297mm) - 96DPI
      </div>

      {/* 页面标题 */}
      <div 
        style={{
          textAlign: 'center',
          marginBottom: '5px', // 减少标题下方间距
          height: `${titleHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <h2 style={{
          margin: 0,
          fontSize: '14px',  // 减小字体
          fontWeight: '600',
          color: '#333'
        }}>
          单词卡片 - {showBothSides ? '反面' : '正面'}
        </h2>
      </div>
      
      {/* 4个WordCard的网格容器 - 使用精确尺寸，向上对齐 */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `${cardWidth}px ${cardWidth}px`,
          gridTemplateRows: `${cardHeight}px ${cardHeight}px`,
          columnGap: `${cardGapH}px`, // 水平间距40px
          rowGap: `${cardGapV}px`,    // 垂直间距30px
          justifyContent: 'center',
          alignContent: 'start',
          width: '100%',
          paddingTop: '0px', // 直接紧贴标题，无额外间距
          // 移除 flex: 1，让容器根据内容自适应高度
          // 这样卡片会靠近顶部，底部自然留白
        }}
      >
        {words.slice(0, 4).map((word, index) => (
          <div
            key={index}
            style={{
              width: `${cardWidth}px`,     // 精确85mm = 321px
              height: `${cardHeight}px`,   // 精确135mm = 510px
              border: '2px solid #dc2626',
              borderRadius: '8px', // 卡片保持圆角
              background: 'white',
              overflow: 'hidden',
              boxSizing: 'border-box',
              position: 'relative',
              // 下排卡片（索引2,3）向下移动10px
              marginTop: index >= 2 ? '10px' : '0px'
            }}
          >
            {/* 卡片尺寸标记 */}
            <div 
              style={{
                position: 'absolute',
                top: '-30px',
                left: '0',
                background: '#dc2626',
                color: 'white',
                padding: '2px 8px',
                fontSize: '10px',
                fontFamily: 'monospace',
                borderRadius: '4px',
                zIndex: 200,
                fontWeight: 'bold'
              }}
            >
              卡片{index + 1}: 85×135mm ({cardWidth}×{cardHeight}px)
            </div>
            
            <div style={{ width: '100%', height: '100%' }}>
              <WordCard 
                word={word} 
                side={showBothSides ? 'back' : 'front'} 
                className="print-card"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 页面底部标识 - 显示计算信息 */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-35px',
          right: '0',
          background: '#2563eb',
          color: 'white',
          padding: '4px 12px',
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}
      >
        精确尺寸计算 ✓ 1mm = 3.78px
      </div>

      {/* 左下角布局信息 */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-35px',
          left: '0',
          background: '#059669',
          color: 'white',
          padding: '4px 12px',
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}
      >
        可用区域: {availableWidth}×{availableHeight}px
      </div>
    </div>
  );
}; 