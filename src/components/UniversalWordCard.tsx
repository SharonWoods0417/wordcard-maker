import React from 'react';
import { Text, View, Image, StyleSheet, Svg, Line } from '@react-pdf/renderer';

// 统一的样式配置
const cardConfig = {
  card: {
    width: '85mm',
    height: '135mm',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1px solid #d1d5db',
  },
  imageContainer: {
    height: '35%',
    backgroundColor: '#f3f4f6',
  },
  wordContainer: {
    height: '25%',
    backgroundColor: '#f9fafb',
    padding: '2mm',
  },
  ipaContainer: {
    height: '12%',
    padding: '2mm',
  },
  phonicsContainer: {
    height: '28%',
    padding: '1.5mm',
  },
  fonts: {
    wordText: { fontSize: 8 },
    ipaText: { fontSize: 16 },
    phonicBlock: { fontSize: 12 },
    ipaBlock: { fontSize: 12 },
  }
};

// 定义数据类型
type WordData = {
  word: string;
  imageUrl: string;
  ipa: string;
  phonics: { text: string; color: string }[];
};

interface UniversalWordCardProps {
  wordData: WordData;
  renderMode: 'web' | 'pdf';
  className?: string;
}

export const UniversalWordCard: React.FC<UniversalWordCardProps> = ({ 
  wordData, 
  renderMode,
  className = '' 
}) => {
  
  // 四线三格组件 - 支持两种渲染模式
  const FourLineGrid = ({ word }: { word: string }) => {
    const width = renderMode === 'pdf' ? 60 : 600;
    const height = renderMode === 'pdf' ? 15 : 150;
    
    if (renderMode === 'pdf') {
      return (
        <Svg width="60mm" height="15mm" viewBox={`0 0 ${width} ${height}`}>
          <Line x1="0" y1="2" x2={width} y2="2" stroke="#555555" strokeWidth="0.25" strokeDasharray="1,1" />
          <Line x1="0" y1="6" x2={width} y2="6" stroke="#555555" strokeWidth="0.25" strokeDasharray="1,1" />
          <Line x1="0" y1="10" x2={width} y2="10" stroke="#dc2626" strokeWidth="0.25" strokeDasharray="1,1" />
          <Line x1="0" y1="14" x2={width} y2="14" stroke="#555555" strokeWidth="0.25" strokeDasharray="1,1" />
          <Text x={width / 2} y="10" style={{
            fontSize: cardConfig.fonts.wordText.fontSize,
            fontWeight: 'normal',
            fill: '#000000',
            textAnchor: 'middle',
          }}>
            {word}
          </Text>
        </Svg>
      );
    } else {
      // 网页版SVG
      return (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', margin: '0 auto', width: '100%', height: '100%' }}
        >
          <line x1="0" y1="20" x2={width} y2="20" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="0" y1="60" x2={width} y2="60" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="0" y1="100" x2={width} y2="100" stroke="#dc2626" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="0" y1="140" x2={width} y2="140" stroke="#555" strokeWidth="1" strokeDasharray="4,4" />
          <text
            x={width / 2}
            y={100}
            fontSize={Math.min(80, height * 0.53)}
            fontWeight="400"
            fill="#000000"
            textAnchor="middle"
            dominantBaseline="alphabetic"
            style={{ fontFamily: "'Kalam', sans-serif" }}
          >
            {word}
          </text>
        </svg>
      );
    }
  };

  if (renderMode === 'pdf') {
    // PDF版本样式
    const pdfStyles = StyleSheet.create({
      card: {
        width: cardConfig.card.width,
        height: cardConfig.card.height,
        backgroundColor: cardConfig.card.backgroundColor,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#d1d5db',
        borderRadius: cardConfig.card.borderRadius,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      },
      imageContainer: {
        height: cardConfig.imageContainer.height,
        backgroundColor: cardConfig.imageContainer.backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      },
      image: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      },
      wordContainer: {
        height: cardConfig.wordContainer.height,
        paddingHorizontal: '2mm',
        paddingVertical: '1mm',
        backgroundColor: cardConfig.wordContainer.backgroundColor,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      ipaContainer: {
        height: cardConfig.ipaContainer.height,
        paddingHorizontal: '2mm',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      ipaText: {
        fontSize: cardConfig.fonts.ipaText.fontSize,
        fontWeight: 'bold',
        color: '#1d4ed8',
        textAlign: 'center',
      },
      phonicsContainer: {
        height: cardConfig.phonicsContainer.height,
        paddingHorizontal: '1.5mm',
        paddingVertical: '1.5mm',
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: '#f3f4f6',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      },
      phonicsBlocks: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1mm',
        marginBottom: '1.5mm',
      },
      phonicBlock: {
        paddingHorizontal: '1.5mm',
        paddingVertical: '1mm',
        borderRadius: 4,
        fontSize: cardConfig.fonts.phonicBlock.fontSize,
        fontWeight: 'bold',
        borderWidth: 1,
        borderStyle: 'solid',
      },
    });

    return (
      <View style={pdfStyles.card}>
        <View style={pdfStyles.imageContainer}>
          <Image style={pdfStyles.image} src={wordData.imageUrl} />
        </View>
        
        <View style={pdfStyles.wordContainer}>
          <FourLineGrid word={wordData.word} />
        </View>
        
        <View style={pdfStyles.ipaContainer}>
          <Text style={pdfStyles.ipaText}>{wordData.ipa}</Text>
        </View>
        
        <View style={pdfStyles.phonicsContainer}>
          <View style={pdfStyles.phonicsBlocks}>
            {wordData.phonics.map((p, index) => (
              <Text
                key={index}
                style={{
                  ...pdfStyles.phonicBlock,
                  backgroundColor: p.color,
                  borderColor: p.color,
                  color: '#000000',
                }}
              >
                {p.text}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
    
  } else {
    // 网页版本
    return (
      <div className={`w-full max-w-[280px] ${className}`}>
        <div 
          className="bg-white rounded-lg shadow-lg border border-gray-200 aspect-[3/4] overflow-hidden"
          style={{ width: '280px', height: '373px' }}
        >
          {/* 图片区域 */}
          <div className="h-[35%] bg-gray-100 relative overflow-hidden">
            <img 
              src={wordData.imageUrl} 
              alt={wordData.word}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* 单词区域 */}
          <div className="h-[25%] px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              <FourLineGrid word={wordData.word} />
            </div>
          </div>
          
          {/* 音标区域 */}
          <div className="h-[12%] px-3 flex items-center justify-center">
            <p className="text-base font-bold text-blue-700">
              {wordData.ipa}
            </p>
          </div>
          
          {/* 自然拼读区域 */}
          <div className="h-[28%] px-2 py-2 border-t border-gray-100 flex flex-col justify-start">
            <div className="space-y-1.5">
              <div className="flex justify-center space-x-1 flex-wrap gap-1">
                {wordData.phonics.map((chunk, index) => (
                  <div 
                    key={index}
                    className="px-1.5 py-1 rounded text-xs font-bold border"
                    style={{
                      backgroundColor: chunk.color,
                      borderColor: chunk.color,
                      color: '#000000'
                    }}
                  >
                    {chunk.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default UniversalWordCard; 