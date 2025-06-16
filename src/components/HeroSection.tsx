import React from 'react';
import { Upload } from 'lucide-react';

interface HeroSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  status: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onFileUpload, 
  fileInputRef, 
  status 
}) => {
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            制作专业单词卡片
            <br />
            <span className="text-3xl text-blue-600 font-medium">
              Create Professional Word Cards
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            让英语学习变得简单有趣
          </p>
          <p className="text-lg text-gray-500">
            Make English Learning Simple and Fun
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-12">
          <div 
            className="border-2 border-dashed border-blue-300 rounded-2xl p-12 bg-white/50 hover:bg-white/80 transition-all duration-300 cursor-pointer group"
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  上传CSV文件
                </h3>
                <h3 className="text-xl font-medium text-blue-600 mb-3">
                  Upload CSV File
                </h3>
                <p className="text-gray-600 mb-1">
                  点击上传或拖拽文件到此处
                </p>
                <p className="text-gray-500 mb-1">
                  Click to upload or drag & drop your file here
                </p>
                <p className="text-sm text-gray-500">
                  支持格式: .csv，最大: 10MB | Supported: .csv, Max: 10MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileUpload}
            className="hidden"
          />
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center group">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              1. 上传文件
              <br />
              <span className="text-base font-normal text-gray-600">Upload File</span>
            </h3>
            <p className="text-gray-600 text-sm">
              上传包含单词的CSV文件
              <br />
              Upload CSV with your words
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              2. 智能生成
              <br />
              <span className="text-base font-normal text-gray-600">AI Generate</span>
            </h3>
            <p className="text-gray-600 text-sm">
              自动补全释义、音标、例句
              <br />
              Auto-complete definitions & examples
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              3. 导出打印
              <br />
              <span className="text-base font-normal text-gray-600">Export & Print</span>
            </h3>
            <p className="text-gray-600 text-sm">
              下载PDF、图片、音频文件
              <br />
              Download PDF, images & audio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 