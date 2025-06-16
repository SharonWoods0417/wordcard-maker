import React from 'react';

interface FourLineGridProps {
  word: string;
  width?: number;
  height?: number;
}

/**
 * 四线三格英文书写教学组件 - 精确教学标准版本
 * 
 * 四线三格结构（从上至下）：
 * - 第一条线：上格顶线（ascender line）
 * - 第二条线：中格顶线（x-height top）
 * - 第三条线（红色）：基准线（baseline）
 * - 第四条线：下格底线（descender line）
 * 
 * 字母对齐规则：
 * - 占一个格字母（a, c, e, o, m, n, s等）：第二条线到红线之间（中格）
 * - 占上两格字母（b, d, f, h, k, l, t）：第一条线到红线之间
 * - 占下两格字母（g, j, p, q, y）：第二条线到第四条线
 */
export const FourLineGrid: React.FC<FourLineGridProps> = ({ 
  word, 
  width = 600, 
  height = 150 
}) => {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: 'block',
        margin: '0 auto',
        width: '100%',
        height: '80px', // 固定高度，确保不会因字体大小而变化
        maxWidth: '100%'
      }}
    >
      {/* 四线三格 - 优化线条样式（虚线、深色、细线） */}
      {/* 第一条线（最上）y=20 */}
      <line 
        x1="0" 
        y1="20" 
        x2={width} 
        y2="20" 
        stroke="#555" 
        strokeWidth="1" 
        strokeDasharray="4,4"
      />
      
      {/* 第二条线 y=60 */}
      <line 
        x1="0" 
        y1="60" 
        x2={width} 
        y2="60" 
        stroke="#555" 
        strokeWidth="1" 
        strokeDasharray="4,4"
      />
      
      {/* 第三条线（红线）y=100 */}
      <line 
        x1="0" 
        y1="100" 
        x2={width} 
        y2="100" 
        stroke="#dc2626" 
        strokeWidth="1" 
        strokeDasharray="4,4"
      />
      
      {/* 第四条线 y=140 */}
      <line 
        x1="0" 
        y1="140" 
        x2={width} 
        y2="140" 
        stroke="#555" 
        strokeWidth="1" 
        strokeDasharray="4,4"
      />
      
      {/* 单词展示 - 优化字母间距和样式 */}
      <text
        y="100"
        fontFamily="'Comic Sans MS', 'Patrick Hand', 'Baloo 2', 'Fredoka', 'Schoolbell', sans-serif"
        fontSize="100"
        fontWeight="600"
        fill="#000000"
        dominantBaseline="alphabetic"
      >
        {word.split('').map((letter, index) => {
          const lowerChar = letter.toLowerCase();
          
          // 计算字母的x位置（居中排列）- 增加间距以改善字母显示
          const letterSpacing = Math.min(width * 0.09, 54 * (width / 600)); // 增加间距系数
          const totalWidth = word.length * letterSpacing;
          const startX = (width - totalWidth) / 2 + letterSpacing / 2;
          const letterX = startX + index * letterSpacing;
          
          // 根据字母类型精确设置位置调整
          let dy = 0;
          
          if (['g', 'j', 'p', 'q', 'y'].includes(lowerChar)) {
            // 下降字母：p 的下端应靠近第四线（y=140）
            dy = 0; // 基线对齐，让下降部分自然延伸到第四线
          } else if (['b', 'd', 'f', 'h', 'k', 'l', 't'].includes(lowerChar)) {
            // 上升字母：l 的上端应靠近第一线（y=20）
            dy = 0; // 基线对齐，让上升部分自然延伸到第一线
          } else {
            // 中格字母：a、e 等应正好占满第二线至第三线之间
            dy = 0; // 基线对齐
          }
          
          return (
            <tspan
              key={index}
              x={letterX}
              dy={dy}
            >
              {letter}
            </tspan>
          );
        })}
      </text>
    </svg>
  );
};

export default FourLineGrid; 