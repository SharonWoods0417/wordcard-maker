import React from 'react';
import { PrintLayoutNew } from './PrintLayoutNew';
import { usePDFExportNew } from '../hooks/usePDFExportNew';

/**
 * 新打印布局的预览页面
 */
export const PrintPreviewNew: React.FC = () => {
  const { exportToPDFNew } = usePDFExportNew();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* 顶部工具栏 */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">全新打印布局预览</h1>
              <p className="text-sm text-gray-600 mt-1">
                使用 mm 单位 • A4 标准 • 4张卡片 (85×135mm) • 完全隔离的样式系统
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                ← 返回主页
              </button>
              <button
                onClick={() => window.open('/?preview=react', '_blank')}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
              >
                React测试
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                🖨️ 浏览器打印
              </button>
              <button
                onClick={exportToPDFNew}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                📄 导出PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="max-w-4xl mx-auto px-4">
        <PrintLayoutNew />
      </div>

      {/* 说明信息 */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">重构特点</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">✨ 全新设计</h3>
              <ul className="space-y-1">
                <li>• 使用 mm/pt 单位替代 px</li>
                <li>• 干净的 DOM 结构</li>
                <li>• 独立的 CSS 样式系统</li>
                <li>• 完全隔离的 @media print</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">📐 标准尺寸</h3>
              <ul className="space-y-1">
                <li>• A4 页面：210mm × 297mm</li>
                <li>• 卡片尺寸：85mm × 135mm</li>
                <li>• 页边距：10mm</li>
                <li>• 卡片间距：10mm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 