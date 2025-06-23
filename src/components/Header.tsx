import React from 'react';
import { BookText, Upload, Settings, HelpCircle, Languages, Info, Download, Loader2, ChevronLeft, Volume2, Image } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onGenerateClick: () => void;
  onExportPDF?: () => void;
  status: string;
  uploadedWordCount: number;
  wordsGenerated?: number;
  // 新增预览页面按钮处理函数
  onBackToEdit?: () => void;
  onDownloadCSV?: () => void;
  onDownloadAudio?: () => void;
  onDownloadImages?: () => void;
  onBackToHome?: () => void;
  parsedWordsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onUploadClick, 
  onGenerateClick, 
  onExportPDF,
  status, 
  uploadedWordCount,
  wordsGenerated = 0,
  onBackToEdit,
  onDownloadCSV,
  onDownloadAudio,
  onDownloadImages,
  onBackToHome,
  parsedWordsCount = 0
}) => {
  
  // 判断是否在预览页面
  const isPreviewPage = status === 'generated' || status === 'generating' || status === 'exporting';
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
            {/* 根据页面状态显示不同的按钮组 */}
            {isPreviewPage ? (
              /* 预览页面按钮组 - 只保留4个下载按钮 */
              <>
                {/* 下载CSV按钮 */}
                <button
                  onClick={onDownloadCSV}
                  disabled={wordsGenerated === 0}
                  className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  title="下载完整CSV文件"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载CSV
                </button>

                {/* 下载音频包按钮 */}
                <button
                  onClick={onDownloadAudio}
                  disabled={wordsGenerated === 0}
                  className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  title="打包下载所有音频文件"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  音频包
                </button>

                {/* 下载图片包按钮 */}
                <button
                  onClick={onDownloadImages}
                  disabled={wordsGenerated === 0}
                  className="flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  title="打包下载所有图片文件"
                >
                  <Image className="w-4 h-4 mr-1" />
                  图片包
                </button>

                {/* 下载PDF按钮 */}
                <button 
                  onClick={onExportPDF}
                  disabled={status === 'exporting' || wordsGenerated === 0}
                  className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  title="下载PDF打印文件"
                >
                  {status === 'exporting' ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-1" />
                  )}
                  下载PDF
                </button>
              </>
            ) : (
              /* 首页按钮组 - 显示专业的导航按钮 */
              <>
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
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}; 