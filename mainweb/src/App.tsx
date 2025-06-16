import React from 'react';
import { 
  Upload, 
  Settings, 
  Download, 
  BookText, 
  Image, 
  Volume2, 
  CheckCircle,
  X,
  Sparkles,
  Brain,
  Headphones,
  FileImage,
  Globe,
  ArrowRight,
  Play,
  HelpCircle,
  Languages,
  Info
} from 'lucide-react';

// Hero Section Component
const HeroSection: React.FC = () => {
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
          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 bg-white/50 hover:bg-white/80 transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  上传CSV文件 Upload CSV File
                </h3>
                <p className="text-gray-600 mb-1">
                  拖拽文件到此处或点击选择 | Drag & drop or click to select
                </p>
                <p className="text-sm text-gray-500">
                  支持格式 Supported: .csv | 最大 Max: 10MB
                </p>
              </div>
            </div>
          </div>
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
              <Sparkles className="w-8 h-8 text-blue-600" />
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
              <Download className="w-8 h-8 text-purple-600" />
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

// Features Section Component
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "智能补全 AI Auto-Complete",
      description: "缺失的释义、音标、例句自动生成 | Missing definitions, phonetics & examples auto-generated"
    },
    {
      icon: <FileImage className="w-8 h-8 text-green-600" />,
      title: "配图生成 Image Generation", 
      description: "为每个单词匹配合适的图片 | Match appropriate images for each word"
    },
    {
      icon: <Headphones className="w-8 h-8 text-purple-600" />,
      title: "发音音频 Pronunciation Audio",
      description: "标准英语发音，支持批量下载 | Standard English pronunciation, batch download"
    },
    {
      icon: <Globe className="w-8 h-8 text-orange-600" />,
      title: "双语支持 Bilingual Support",
      description: "中英文对照，适合中国学生 | Chinese-English comparison, perfect for Chinese students"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            智能特性 Smart Features
          </h2>
          <p className="text-xl text-gray-600">
            让单词卡制作变得轻松高效 | Make word card creation effortless and efficient
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// CSV Format Guide Component
const CSVGuideSection: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              CSV格式要求 CSV Format Requirements
            </h2>
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
                  <code className="bg-green-100 px-2 py-1 rounded text-sm">Word</code>
                  <span className="ml-2 text-sm">单词列</span>
                </li>
              </ul>
            </div>

            {/* Optional */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
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
              <Sparkles className="w-5 h-5 mr-2" />
              智能提示 Smart Tips
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <div>
                <p className="mb-2">
                  <strong>最简格式 Minimal Format:</strong>
                </p>
                <code className="bg-yellow-100 px-3 py-2 rounded block">
                  Word<br />
                  apple<br />
                  book<br />
                  computer
                </code>
              </div>
              <div>
                <p className="mb-2">
                  <strong>完整格式 Full Format:</strong>
                </p>
                <code className="bg-yellow-100 px-3 py-2 rounded block text-xs">
                  Word,Definition,IPA<br />
                  apple,A fruit,/ˈæpəl/<br />
                  book,Reading material,/bʊk/
                </code>
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
            <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Play className="w-5 h-5 mr-2" />
              查看示例 View Example
            </button>
            <button className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Download className="w-5 h-5 mr-2" />
              下载模板 Download Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header with Controls */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <BookText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Word Card Maker</h1>
            </div>
            
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Navigation Items */}
              <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
                <HelpCircle className="w-4 h-4 mr-1" />
                帮助 Help
              </button>
              
              <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
                <Languages className="w-4 h-4 mr-1" />
                中/EN
              </button>
              
              <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
                <Info className="w-4 h-4 mr-1" />
                关于 About
              </button>
              
              {/* Action Buttons */}
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4 mr-1" />
                Upload CSV
              </button>
              
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                <Settings className="w-4 h-4 mr-1" />
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Features Section */}
          <FeaturesSection />
          
          {/* CSV Guide Section */}
          <CSVGuideSection />
        </div>
      </div>
    </div>
  );
}

export default App;