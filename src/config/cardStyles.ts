// 统一的卡片样式配置
// 修改这里的数值，网页版和PDF版本会同时更新

export const CARD_CONFIG = {
  // 卡片尺寸 (A4纸张: 210mm x 297mm, 每页2x2布局)
  dimensions: {
    width: '85mm',
    height: '135mm',
    aspectRatio: '3/4', // 对应 85:135 的比例
    webWidth: 280, // 网页版像素宽度
    webHeight: 373, // 网页版像素高度
  },

  // 区域高度分配 (总和应为100%)
  layout: {
    imageArea: '35%',     // 图片区域
    wordArea: '25%',      // 四线三格单词区域
    ipaArea: '12%',       // 音标区域  
    phonicsArea: '28%',   // 自然拼读区域
  },

  // 颜色配置
  colors: {
    background: '#ffffff',
    border: '#d1d5db',
    imageBackground: '#f3f4f6',
    wordBackground: '#f9fafb',
    wordBorder: '#e5e7eb',
    phonicsBorder: '#f3f4f6',
    ipaText: '#1d4ed8', // text-blue-700
    
    // 四线三格颜色
    guideLines: '#555555',
    baseline: '#dc2626', // 红色基准线
  },

  // 字体配置
  fonts: {
    // 四线三格中的单词
    word: {
      size: {
        pdf: 8,           // PDF版本字体大小
        web: 80,          // 网页版基础大小
        webCalculated: (height: number) => Math.min(80, height * 0.53), // 网页版动态计算
      },
      family: "'Kalam', 'Andika', 'Schoolbell', sans-serif",
      weight: 'normal',
      color: '#000000',
    },

    // 音标
    ipa: {
      size: 16, // text-base
      weight: 'bold',
      color: '#1d4ed8', // text-blue-700
    },

    // 拼读块
    phonicBlock: {
      size: 12, // text-xs
      weight: 'bold',
      color: '#000000',
    },

    // IPA块
    ipaBlock: {
      size: 12, // text-xs
      weight: 'normal',
      color: '#374151', // text-gray-700
      background: '#f3f4f6', // bg-gray-100
    },
  },

  // 间距配置
  spacing: {
    cardPadding: {
      horizontal: '2mm',
      vertical: '1mm',
    },
    phonicsPadding: {
      horizontal: '1.5mm',
      vertical: '1.5mm',
    },
    blockPadding: {
      horizontal: '1.5mm',
      vertical: '1mm',
    },
    gap: '1mm',
  },

  // 边框圆角
  borderRadius: {
    card: 8,
    block: 4,
    small: 3,
  },

  // 四线三格配置
  fourLineGrid: {
    pdf: {
      width: 60,
      height: 15,
      linePositions: [2, 6, 10, 14], // y坐标
      strokeWidth: 0.25,
      dashArray: '1,1',
    },
    web: {
      width: 600,
      height: 150,
      linePositions: [20, 60, 100, 140], // y坐标
      strokeWidth: 1,
      dashArray: '4,4',
    },
  },

  // 自然拼读色块颜色
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
  ],
};

// 工具函数：获取拼读块颜色
export const getPhonicsColor = (index: number) => {
  return CARD_CONFIG.phonicsColors[index % CARD_CONFIG.phonicsColors.length];
};

// 工具函数：转换配置为CSS样式
export const getWebStyles = () => ({
  card: {
    width: `${CARD_CONFIG.dimensions.webWidth}px`,
    height: `${CARD_CONFIG.dimensions.webHeight}px`,
    backgroundColor: CARD_CONFIG.colors.background,
    borderRadius: `${CARD_CONFIG.borderRadius.card}px`,
  },
  imageContainer: {
    height: CARD_CONFIG.layout.imageArea,
    backgroundColor: CARD_CONFIG.colors.imageBackground,
  },
  wordContainer: {
    height: CARD_CONFIG.layout.wordArea,
    backgroundColor: CARD_CONFIG.colors.wordBackground,
    borderBottomColor: CARD_CONFIG.colors.wordBorder,
  },
  ipaContainer: {
    height: CARD_CONFIG.layout.ipaArea,
  },
  phonicsContainer: {
    height: CARD_CONFIG.layout.phonicsArea,
    borderTopColor: CARD_CONFIG.colors.phonicsBorder,
  },
});

// 工具函数：转换配置为PDF样式
export const getPdfStyles = () => ({
  card: {
    width: CARD_CONFIG.dimensions.width,
    height: CARD_CONFIG.dimensions.height,
    backgroundColor: CARD_CONFIG.colors.background,
    borderRadius: CARD_CONFIG.borderRadius.card,
  },
  fonts: CARD_CONFIG.fonts,
  colors: CARD_CONFIG.colors,
  spacing: CARD_CONFIG.spacing,
  layout: CARD_CONFIG.layout,
});

export default CARD_CONFIG; 