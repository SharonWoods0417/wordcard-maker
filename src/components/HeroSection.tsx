import React from 'react';
import { Upload, Edit3, FileText, FolderOpen, Download } from 'lucide-react';

interface HeroSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onManualInput: () => void;
  status: string;
  onDownloadTemplate: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onFileUpload, 
  fileInputRef, 
  onManualInput,
  status,
  onDownloadTemplate
}) => {
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* 首页中间标题区域 - 完整结构 */}
        <div className="text-center mb-16">
          {/* 主标题区域 */}
          <div className="mb-8">
            {/* 中文主标题 - 渐变大字 */}
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                制作专业单词卡片
              </span>
            </h1>
            
            {/* 英文副标题 */}
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-8 tracking-wide">
              Create Professional Word Cards
            </h2>
            
            {/* 副标语区域 */}
            <div className="max-w-2xl mx-auto space-y-3">
              {/* 中文副标语 */}
              <p className="text-xl font-semibold text-gray-800">
                让英语学习变得简单有趣
              </p>
              {/* 英文副标语 */}
              <p className="text-lg text-gray-600 font-medium">
                Make English Learning Simple and Fun
              </p>
            </div>
          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { text: "智能补全", color: "bg-blue-100 text-blue-700 border-blue-200" },
              { text: "专业排版", color: "bg-purple-100 text-purple-700 border-purple-200" },
              { text: "一键导出", color: "bg-green-100 text-green-700 border-green-200" },
              { text: "支持Anki", color: "bg-orange-100 text-orange-700 border-orange-200" }
            ].map((badge, index) => (
              <span key={index} className={`px-4 py-2 rounded-full text-sm font-semibold border ${badge.color} shadow-sm`}>
                {badge.text}
              </span>
            ))}
          </div>
        </div>

        {/* 双入口选择区域 */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">选择您的起始方式</h2>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Choose Your Starting Method</h2>
            <p className="text-gray-600">根据您的情况选择最适合的方式开始制作单词卡片</p>
          </div>

          {/* 下载CSV模板按钮 - 移动到起始方式选择框上面 */}
          <div className="mb-8 text-center">
            <button
              onClick={onDownloadTemplate}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              <span>下载 CSV 模板</span>
              <span className="text-blue-100 text-sm ml-2">Download Template</span>
            </button>
            <p className="text-sm text-blue-600 mt-2 font-medium">
              💡 不知道如何填写单词表？先下载模板查看示例格式
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* 我已有单词文件 */}
            <div 
              className="border-2 border-dashed border-blue-300 rounded-2xl p-8 bg-white/50 hover:bg-white/80 hover:border-blue-400 transition-all duration-300 cursor-pointer group"
              onClick={handleUploadClick}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FolderOpen className="w-8 h-8 text-blue-600" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    我已有单词文件
                  </h3>
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">
                    I Have Word Files
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    上传 CSV/Excel/Word/TXT 文件
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    Upload CSV/Excel/Word/TXT files
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-blue-700 text-xs font-medium">
                      ✅ 适合：已准备好单词列表的用户
                    </p>
                    <p className="text-blue-600 text-xs">
                      Perfect for: Users with prepared word lists
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 我没有文件，直接输入 */}
            <div 
              className="border-2 border-dashed border-green-300 rounded-2xl p-8 bg-white/50 hover:bg-white/80 hover:border-green-400 transition-all duration-300 cursor-pointer group"
              onClick={onManualInput}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Edit3 className="w-8 h-8 text-green-600" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    我没有文件，直接输入
                  </h3>
                  <h3 className="text-lg font-semibold text-green-600 mb-3">
                    Manual Input
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    手动输入单词，一行一个
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    Type words manually, one per line
                  </p>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-700 text-xs font-medium">
                      ✅ 适合：临时制作少量单词卡片
                    </p>
                    <p className="text-green-600 text-xs">
                      Perfect for: Quick creation of few cards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.docx,.txt"
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