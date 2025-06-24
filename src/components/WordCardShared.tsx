import React from 'react';

// 统一的单词数据类型
export interface WordEntry {
  Word: string;
  IPA: string;
  PhonicsChunks: string[] | string;
  PhonicsIPA: string[] | string;
  Definition_CN: string;
  Example: string;
  Example_CN: string;
  Picture: string;
  Audio: string;
}

// 共享组件的Props类型
export interface WordCardSharedProps {
  word: WordEntry;
  mode: 'web' | 'pdf';
  side: 'front' | 'back';
  components: {
    View: any;
    Text: any;
    Image: any;
    Svg?: any;
    Line?: any;
  };
  className?: string;
}

// 统一样式配置
const CARD_STYLES = {
  // 区域高度分配
  layout: {
    imageArea: '35%',
    wordArea: '25%', 
    ipaArea: '12%',
    phonicsArea: '28%',
  },

  // 字体大小配置
  fonts: {
    pdf: {
      word: 8,
      ipa: 14,
      phonicBlock: 12,
      ipaBlock: 10,
    }
  },

  // 四线三格配置
  fourLineGrid: {
    web: {
      width: 600, height: 150,
      lines: [20, 60, 100, 140],
      strokeWidth: 1, dashArray: '4,4'
    },
    pdf: {
      width: 60, height: 15,
      lines: [2, 6, 10, 14],
      strokeWidth: 0.25, dashArray: '1,1'
    }
  },

  // 拼读色块颜色
  phonicsColors: [
    { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', name: 'blue' },
    { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', name: 'red' },
    { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', name: 'green' },
    { bg: '#fed7aa', text: '#9a3412', border: '#fdba74', name: 'orange' },
    { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff', name: 'purple' },
    { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8', name: 'pink' },
    { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe', name: 'indigo' },
    { bg: '#fef3c7', text: '#92400e', border: '#fde68a', name: 'yellow' },
    { bg: '#ccfbf1', text: '#134e4a', border: '#99f6e4', name: 'teal' },
    { bg: '#cffafe', text: '#164e63', border: '#a5f3fc', name: 'cyan' },
  ]
};

export const WordCardShared: React.FC<WordCardSharedProps> = ({ 
  word, 
  mode, 
  side,
  components,
  className = '' 
}) => {
  const { View, Text, Image, Svg, Line } = components;
  const isPdf = mode === 'pdf';

  // 处理拼读数据
  const phonicsChunks = Array.isArray(word.PhonicsChunks) 
    ? word.PhonicsChunks 
    : (typeof word.PhonicsChunks === 'string' ? word.PhonicsChunks.split(',').map((s: string) => s.trim()) : []);
  
  const phonicsIPA = Array.isArray(word.PhonicsIPA) 
    ? word.PhonicsIPA 
    : (typeof word.PhonicsIPA === 'string' ? word.PhonicsIPA.split(',').map((s: string) => s.trim()) : []);

  // 四线三格组件
  const FourLineGridComponent = ({ wordText }: { wordText: string }) => {
    const config = CARD_STYLES.fourLineGrid[mode];
    const { width, height, lines, strokeWidth, dashArray } = config;
    
    if (isPdf && Svg && Line) {
      // PDF版本
      return (
        <Svg width={`${width}mm`} height={`${height}mm`} viewBox={`0 0 ${width} ${height}`}>
          {lines.map((y, index) => (
            <Line
              key={index}
              x1="0" y1={y} x2={width} y2={y}
              stroke={index === 2 ? '#dc2626' : '#555555'}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
            />
          ))}
          <Text
            x={width / 2} y={lines[2]}
            style={{
              fontSize: CARD_STYLES.fonts.pdf.word,
              fontWeight: 'normal',
              fill: '#000000',
              textAnchor: 'middle',
            }}
          >
            {wordText}
          </Text>
        </Svg>
      );
    } else {
      // Web版本
      return React.createElement('svg', {
        viewBox: `0 0 ${width} ${height}`,
        style: { display: 'block', margin: '0 auto', width: '100%', height: '100%' }
      }, [
        ...lines.map((y, index) => 
          React.createElement('line', {
            key: index,
            x1: 0, y1: y, x2: width, y2: y,
            stroke: index === 2 ? '#dc2626' : '#555555',
            strokeWidth: strokeWidth,
            strokeDasharray: dashArray
          })
        ),
        React.createElement('text', {
          key: 'word-text',
          x: width / 2, y: lines[2],
          fontSize: Math.min(80, height * 0.53),
          fontWeight: '400',
          fill: '#000000',
          textAnchor: 'middle',
          dominantBaseline: 'alphabetic',
          style: { fontFamily: "'Kalam', sans-serif" }
        }, wordText)
      ]);
    }
  };

  // 正面卡片
  if (side === 'front') {
    if (isPdf) {
      // PDF正面渲染
      const styles = {
        card: {
          width: '85mm', height: '135mm',
          backgroundColor: '#ffffff',
          borderWidth: 1, borderStyle: 'solid', borderColor: '#d1d5db',
          borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        },
        imageContainer: {
          height: '35%', backgroundColor: '#f3f4f6',
          position: 'relative', overflow: 'hidden',
        },
        image: { width: '100%', height: '100%', objectFit: 'contain' },
        wordContainer: {
          height: '25%', paddingHorizontal: '2mm', paddingVertical: '1mm',
          backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomStyle: 'solid',
          borderBottomColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        ipaContainer: {
          height: '12%', paddingHorizontal: '2mm', paddingVertical: '2mm',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        ipaText: {
          fontSize: 14, fontWeight: 'bold', color: '#1d4ed8',
          textAlign: 'center', lineHeight: 1.2,
        },
        phonicsContainer: {
          height: '28%', paddingHorizontal: '1.5mm', paddingVertical: '2mm',
          borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f3f4f6',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        },
        phonicsGroup: {
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
          gap: 2, marginBottom: 3, marginTop: 2,
        },
        phonicsBlock: {
          borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8,
          borderWidth: 1, borderStyle: 'solid',
        },
        phonicsText: {
          fontSize: 12, fontWeight: 'bold', color: '#000000', textAlign: 'center',
        },
        phonicsIPA: {
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
          gap: 2, marginTop: 2,
        },
        ipaBlock: {
          paddingHorizontal: 3, paddingVertical: 1,
          backgroundColor: '#f3f4f6', borderRadius: 3,
        },
        ipaBlockText: {
          fontSize: 10, fontWeight: 'normal', color: '#374151', textAlign: 'center',
        },
      };

      return (
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image 
              style={styles.image} 
              src={word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`}
            />
          </View>
          
          <View style={styles.wordContainer}>
            <FourLineGridComponent wordText={word.Word} />
          </View>
          
          <View style={styles.ipaContainer}>
            <Text style={styles.ipaText}>{word.IPA}</Text>
          </View>
          
          <View style={styles.phonicsContainer}>
            <View style={styles.phonicsGroup}>
              {phonicsChunks.map((chunk: string, index: number) => {
                const color = CARD_STYLES.phonicsColors[index % CARD_STYLES.phonicsColors.length];
                return (
                  <View
                    key={index}
                    style={[styles.phonicsBlock, { backgroundColor: color.bg, borderColor: color.border }]}
                  >
                    <Text style={styles.phonicsText}>{chunk}</Text>
                  </View>
                );
              })}
            </View>
            
            <View style={styles.phonicsIPA}>
              {phonicsIPA.map((ipa: string, index: number) => (
                <View key={index} style={styles.ipaBlock}>
                  <Text style={styles.ipaBlockText}>/{ipa}/</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    } else {
      // Web正面渲染
      return (
        <div className={`w-full max-w-[280px] ${className} group cursor-pointer`}>
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 aspect-[3/4] overflow-hidden transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:z-10 relative"
            style={{ width: '280px', height: '373px' }}
          >
            <div className="h-[35%] bg-gray-100 relative overflow-hidden">
              <img 
                src={word.Picture.startsWith('/media/') ? word.Picture : `/media/${word.Picture}`}
                alt={word.Word}
                crossOrigin="anonymous"
                loading="eager"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="h-[25%] px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <FourLineGridComponent wordText={word.Word} />
              </div>
            </div>
            
            <div className="h-[12%] px-3 flex items-center justify-center">
              <p className="text-base font-bold text-blue-700">{word.IPA}</p>
            </div>
            
            <div className="h-[28%] px-2 py-2 border-t border-gray-100 flex flex-col justify-start">
              <div className="space-y-1.5">
                <div className="flex justify-center space-x-1 flex-wrap gap-1">
                  {phonicsChunks.map((chunk: string, index: number) => {
                    const color = CARD_STYLES.phonicsColors[index % CARD_STYLES.phonicsColors.length];
                    return (
                      <div 
                        key={index}
                        className="px-1.5 py-1 rounded text-xs font-bold border"
                        style={{
                          backgroundColor: color.bg,
                          color: color.text,
                          borderColor: color.border,
                        }}
                      >
                        {chunk}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-center space-x-1 flex-wrap gap-1">
                  {phonicsIPA.map((ipa: string, index: number) => (
                    <div key={index} className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs">
                      /{ipa}/
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
};

export default WordCardShared; 