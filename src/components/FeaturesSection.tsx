import React from 'react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "智能补全",
      titleEn: "AI Auto-Complete",
      description: "缺失的释义、音标、例句自动生成",
      descriptionEn: "Missing definitions, phonetics & examples auto-generated"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "配图生成",
      titleEn: "Image Generation", 
      description: "为每个单词匹配合适的图片",
      descriptionEn: "Match appropriate images for each word"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 8.464a5 5 0 000 7.072m-2.828-9.9a9 9 0 000 12.728M12 14a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      title: "发音音频",
      titleEn: "Pronunciation Audio",
      description: "标准英语发音，支持批量下载",
      descriptionEn: "Standard English pronunciation, batch download"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "双语支持",
      titleEn: "Bilingual Support",
      description: "中英文对照，适合中国学生",
      descriptionEn: "Chinese-English comparison, perfect for Chinese students"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            智能特性
          </h2>
          <h3 className="text-2xl font-medium text-blue-600 mb-4">
            Smart Features
          </h3>
          <p className="text-xl text-gray-600">
            让单词卡制作变得轻松高效
          </p>
          <p className="text-lg text-gray-500">
            Make word card creation effortless and efficient
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {feature.title}
              </h3>
              <h4 className="text-base font-medium text-blue-600 mb-3">
                {feature.titleEn}
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                {feature.description}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {feature.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 