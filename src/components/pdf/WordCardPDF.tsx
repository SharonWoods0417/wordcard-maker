import React from 'react';
import { Text, View, Image, StyleSheet, Svg, Line } from '@react-pdf/renderer';

// 定义单词卡片的数据结构类型
type WordData = {
  word: string;
  imageUrl: string;
  ipa: string;
  phonics: { text: string; color: string }[];
};

// 定义组件的Props
interface WordCardPDFProps {
  wordData: WordData;
}

// 定义卡片样式 - 与预览页面完全一致
// 纸张A4: 210mm x 297mm
// 卡片尺寸: 85mm x 135mm (3:4 比例)
const styles = StyleSheet.create({
  card: {
    width: '85mm',
    height: '135mm',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  
  // 图片区域 - 35%
  imageContainer: {
    height: '35%', // 47.25mm
    backgroundColor: '#f3f4f6', // bg-gray-100
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  
  // 单词区域 - 25% (包含四线三格)
  wordContainer: {
    height: '25%', // 33.75mm
    paddingHorizontal: '2mm',
    paddingVertical: '1mm',
    backgroundColor: '#f9fafb', // bg-gray-50
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 四线三格容器
  fourLineGridContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 单词文本 (在SVG中) - 匹配网页版大小
  wordText: {
    fontSize: 8, // 对应网页版的相对字体大小
    fontWeight: 'normal',
    fill: '#000000',
    textAnchor: 'middle',
  },
  
  // 音标区域 - 12% (增加内边距防止重叠)
  ipaContainer: {
    height: '12%', // 16.2mm
    paddingHorizontal: '2mm',
    paddingVertical: '2mm', // 增加上下内边距
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ipaText: {
    fontSize: 14, // 稍微减小字体防止重叠
    fontWeight: 'bold',
    color: '#1d4ed8', // text-blue-700
    textAlign: 'center',
    lineHeight: 1.2, // 明确设置行高
  },
  
  // 自然拼读区域 - 28%
  phonicsContainer: {
    height: '28%', // 37.8mm
    paddingHorizontal: '1.5mm',
    paddingVertical: '2mm', // 增加上边距
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  
  // 拼读块容器 - 修复样式
  phonicsGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2, // 使用数字而不是字符串
    marginBottom: 3, // 使用数字
    marginTop: 2, // 添加上边距
  },
  
  // 单个拼读块 - 优化样式
  phonicsBlock: {
    borderRadius: 6, // 增加圆角
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  
  // 拼读块文本
  phonicsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  
  // 音标对应容器
  phonicsIPA: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2, // 使用数字
    marginTop: 2,
  },
  
  // IPA块
  ipaBlock: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    backgroundColor: '#f3f4f6', // bg-gray-100
    borderRadius: 3,
  },
  
  // IPA块文本
  ipaBlockText: {
    fontSize: 10, // 稍微减小字体
    fontWeight: 'normal',
    color: '#374151', // text-gray-700
    textAlign: 'center',
  },
});

const WordCardPDF: React.FC<WordCardPDFProps> = ({ wordData }) => {
  // 四线三格组件 (PDF版本) - 与网页版完全一致
  const FourLineGridPDF = ({ word }: { word: string }) => {
    const width = 60; // SVG宽度 (mm单位的点数)
    const height = 15; // SVG高度 - 恢复原始高度以匹配网页版比例
    
    return (
      <Svg width="60mm" height="15mm" viewBox={`0 0 ${width} ${height}`}>
        {/* 四线三格 - 按照网页版标准 */}
        {/* 第一条线（最上）y=2 */}
        <Line 
          x1="0" y1="2" x2={width} y2="2" 
          stroke="#555555" strokeWidth="0.25" strokeDasharray="1,1"
        />
        
        {/* 第二条线 y=6 */}
        <Line 
          x1="0" y1="6" x2={width} y2="6" 
          stroke="#555555" strokeWidth="0.25" strokeDasharray="1,1"
        />
        
        {/* 第三条线（红色基准线）y=10 */}
        <Line 
          x1="0" y1="10" x2={width} y2="10" 
          stroke="#dc2626" strokeWidth="0.25" strokeDasharray="1,1"
        />
        
        {/* 第四条线 y=14 */}
        <Line 
          x1="0" y1="14" x2={width} y2="14" 
          stroke="#555555" strokeWidth="0.25" strokeDasharray="1,1"
        />
        
        {/* 单词文本 - 基线位置y=10 */}
        <Text
          x={width / 2}
          y="10"
          style={styles.wordText}
        >
          {word}
        </Text>
      </Svg>
    );
  };

  return (
    <View style={styles.card}>
      {/* 图片区域 - 35% */}
      <View style={styles.imageContainer}>
        <Image style={styles.image} src={wordData.imageUrl} />
      </View>
      
      {/* 单词区域 - 25% (包含四线三格) */}
      <View style={styles.wordContainer}>
        <View style={styles.fourLineGridContainer}>
          <FourLineGridPDF word={wordData.word} />
        </View>
      </View>
      
      {/* 音标区域 - 12% */}
      <View style={styles.ipaContainer}>
        <Text style={styles.ipaText}>{wordData.ipa}</Text>
      </View>
      
      {/* 自然拼读区域 - 28% */}
      <View style={styles.phonicsContainer}>
        {/* 拼读块组 - 使用正确的PDF结构 */}
        <View style={styles.phonicsGroup}>
          {wordData.phonics.map((p, index) => (
            <View
              key={index}
              style={[
                styles.phonicsBlock,
                { 
                  backgroundColor: p.color,
                  borderColor: p.color,
                }
              ]}
            >
              <Text style={styles.phonicsText}>
                {p.text}
              </Text>
            </View>
          ))}
        </View>
        
        {/* 音标对应 - 使用View包装Text */}
        <View style={styles.phonicsIPA}>
          {wordData.phonics.map((p, index) => (
            <View key={index} style={styles.ipaBlock}>
              <Text style={styles.ipaBlockText}>
                /{p.text}/
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default WordCardPDF; 