import React from 'react';
import { CheckCircle, Download } from 'lucide-react';

interface CSVGuideSectionProps {
  onViewExample?: () => void;
  onDownloadTemplate?: () => void;
}

export const CSVGuideSection: React.FC<CSVGuideSectionProps> = ({ 
  onViewExample, 
  onDownloadTemplate 
}) => {
  return (
    <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              CSV格式要求
            </h2>
            <h3 className="text-xl font-medium text-blue-600 mb-2">
              CSV Format Requirements
            </h3>
            <p className="text-gray-600">
              简单易懂的文件格式说明 | Simple and clear file format guide
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Required */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                必需字段 Required
              </h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono">Word</code>
                  <span className="ml-2 text-sm">单词列</span>
                </li>
              </ul>
            </div>

            {/* Optional */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                可选字段 Optional
              </h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>• Definition (释义)</li>
                <li>• IPA (音标)</li>
                <li>• Example (例句)</li>
                <li>• Example_CN (中文例句)</li>
                <li>• Definition_CN (中文释义)</li>
                <li>• Audio (音频)</li>
                <li>• Picture (图片)</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              智能提示 Smart Tips
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <div>
                <p className="mb-2">
                  <strong>最简格式 Minimal Format:</strong>
                </p>
                <div className="bg-yellow-100 px-3 py-2 rounded font-mono text-xs">
                  Word<br />
                  apple<br />
                  book<br />
                  computer
                </div>
              </div>
              <div>
                <p className="mb-2">
                  <strong>完整格式 Full Format:</strong>
                </p>
                <div className="bg-yellow-100 px-3 py-2 rounded font-mono text-xs">
                  Word,Definition,IPA<br />
                  apple,A fruit,/ˈæpəl/<br />
                  book,Reading material,/bʊk/
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-yellow-800 font-medium mb-2">
                  ✅ 自动生成释义和音标 Auto-generate definitions & phonetics
                </p>
                <p className="text-yellow-800 font-medium mb-2">
                  ✅ 标准发音音频 Standard pronunciation audio
                </p>
              </div>
              <div>
                <p className="text-yellow-800 font-medium mb-2">
                  ✅ 智能配图片 Smart image matching
                </p>
                <p className="text-yellow-800 font-medium mb-2">
                  ✅ 双语例句生成 Bilingual example sentences
                </p>
              </div>
            </div>
            
            <p className="mt-4 text-yellow-800 font-medium">
              💡 只需要单词列，其他信息我们帮您自动补全！
              <br />
              <span className="text-sm font-normal">
                Just need the Word column, we'll auto-complete everything else!
              </span>
            </p>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button 
              onClick={onViewExample}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v5a2 2 0 002 2z" />
              </svg>
              查看示例 View Example
            </button>
            <button 
              onClick={onDownloadTemplate}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              下载模板 Download Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 