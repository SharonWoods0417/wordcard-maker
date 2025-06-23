import React from 'react';
import { WordCard } from './WordCard';

// 示例卡片数据 - 更新为新字段结构
const showcaseWords = [
  {
    Word: "adventure",
    IPA: "/ədˈventʃər/",
    PhonicsChunks: ["ad", "ven", "t", "ure"],
    PhonicsIPA: ["/əd/", "/ven/", "/t/", "/ʃər/"],
    Definition_CN: "n. 冒险；奇遇",
    Example: "Their trip to the mountains was a great adventure",
    Example_CN: "他们的山区之旅是一次很棒的冒险",
    Audio: "adventure.mp3",
    Picture: "adventure.jpg"
  },
  {
    Word: "knowledge",
    IPA: "/ˈnɒlɪdʒ/",
    PhonicsChunks: ["know", "l", "edge"],
    PhonicsIPA: ["/nəʊ/", "/l/", "/ɪdʒ/"],
    Definition_CN: "n. 知识；学问",
    Example: "Knowledge is power in the modern world",
    Example_CN: "在现代世界，知识就是力量",
    Audio: "knowledge.mp3",
    Picture: "knowledge.jpg"
  }
];

export const CardShowcaseSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            成品卡片展示
          </h2>
          <h3 className="text-2xl font-semibold text-blue-600 mb-6">
            Sample Word Cards
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            专业设计的单词卡片，包含拼读教学、音标、释义、例句等完整信息
          </p>
          <p className="text-base text-gray-500 mt-2">
            Professional word cards with phonics teaching, phonetics, definitions, and examples
          </p>
        </div>

        {/* 卡片展示区域 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {/* 第一张卡片 - 正面 */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">正面 Front</h4>
            <WordCard 
              word={showcaseWords[0]}
              side="front"
            />
          </div>

          {/* 第一张卡片 - 反面 */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">反面 Back</h4>
            <WordCard 
              word={showcaseWords[0]}
              side="back"
            />
          </div>

          {/* 第二张卡片 - 正面 */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">正面 Front</h4>
            <WordCard 
              word={showcaseWords[1]}
              side="front"
            />
          </div>

          {/* 第二张卡片 - 反面 */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">反面 Back</h4>
            <WordCard 
              word={showcaseWords[1]}
              side="back"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 