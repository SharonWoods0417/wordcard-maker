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
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        margin: '0 auto',
        width: '100%',
        height: '100%', // 继承外部容器高度，不再固定80px
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
      
      {/* 单词展示 - 统一字体大小和间距 */}
      <text
        x={width / 2}
        y={100} // 基线位置
        fontFamily="'Andika', 'Schoolbell', 'Patrick Hand', 'Kalam', 'Architects Daughter', sans-serif"
        fontSize={Math.min(80, height * 0.53)} // 统一字体大小
        fontWeight="400"
        fill="#000000"
        textAnchor="middle"
        dominantBaseline="alphabetic"
        letterSpacing="0.05em" // 统一字母间距
        style={{
          fontFamily: "'Andika', 'Schoolbell', 'Patrick Hand', 'Kalam', 'Architects Daughter', sans-serif",
          fontWeight: "400",
          fontStyle: "normal"
        }}
      >
        {word}
      </text>
    </svg>
  );
};

export default FourLineGrid; 