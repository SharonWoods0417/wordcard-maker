import React from 'react';
import { BookText, Upload, Settings, HelpCircle, Languages, Info, Download, Loader2 } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onGenerateClick: () => void;
  onExportPDF?: () => void;
  status: string;
  uploadedWordCount: number;
  wordsGenerated?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onUploadClick, 
  onGenerateClick, 
  onExportPDF,
  status, 
  uploadedWordCount,
  wordsGenerated = 0
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <BookText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">
              Word Card Maker
            </h1>
            <span className="text-sm text-gray-500">
              专业单词卡片制作工具
            </span>
          </div>
          
          <div className="flex items-center space-x-2 flex-wrap">
            {/* Navigation Items */}
            <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
              <HelpCircle className="w-4 h-4 mr-1" />
              帮助 Help
            </button>
            
            <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
              <Languages className="w-4 h-4 mr-1" />
              中文
            </button>
            
            <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
              <Info className="w-4 h-4 mr-1" />
              关于 About
            </button>
            
            {/* Action Buttons */}
            <button 
              onClick={onUploadClick}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload CSV
            </button>
            
            {/* Generate按钮已优化移除 - 用户确认后自动生成 */}
            {false && (
              <button 
                onClick={onGenerateClick}
                disabled={status !== 'uploaded'}
                className={`flex items-center px-4 py-2 border rounded-md text-sm transition-colors ${
                  status === 'uploaded' 
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Settings className="w-4 h-4 mr-1" />
                {status === 'generating' ? '生成中...' : 'Generate'}
              </button>
            )}
            
            {/* PDF Export Button */}
            {wordsGenerated > 0 && onExportPDF && (
              <button 
                onClick={onExportPDF}
                disabled={status === 'exporting'}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {status === 'exporting' ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                PDF
              </button>
            )}
            
            {/* Status indicator */}
            {uploadedWordCount > 0 && (
              <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-md">
                {uploadedWordCount} 个单词
              </span>
            )}
            {wordsGenerated > 0 && (
              <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-md">
                {wordsGenerated} 张卡片
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 