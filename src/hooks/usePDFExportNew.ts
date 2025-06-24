import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 全新的PDF导出Hook
 * 
 * 设计原则：
 * 1. 配合全新的PrintLayoutNew组件
 * 2. 使用精确的A4尺寸计算
 * 3. 避免复杂的预处理和后处理
 * 4. 确保预览和PDF完全一致
 */
export const usePDFExportNew = () => {
  
    const exportToPDFNew = useCallback(async () => {
    try {
      console.log('🚀 开始新PDF导出流程...');
      
      // 1. 创建带内联样式的完整DOM结构
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        z-index: -1;
        pointer-events: none;
        width: 794px;
        height: 1123px;
        background: #f5f5f5;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
      `;
      
      // 2. 创建打印页面
      const printPage = document.createElement('div');
      printPage.style.cssText = `
        width: 794px;
        height: 1123px;
        background: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      `;
      
      // 3. 创建标题
      const header = document.createElement('div');
      header.style.cssText = `
        text-align: center;
        margin-bottom: 30px;
        flex-shrink: 0;
      `;
      const title = document.createElement('h2');
      title.style.cssText = `
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      `;
      title.textContent = '单词卡片 - 全新布局测试';
      header.appendChild(title);
      
      // 4. 创建卡片网格
      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 20px;
        flex: 1;
        align-items: center;
        justify-items: center;
      `;
      
      // 5. 创建4张卡片
      for (let i = 1; i <= 4; i++) {
        const card = document.createElement('div');
        card.style.cssText = `
          width: 321px;
          height: 510px;
          border: 2px solid #333;
          border-radius: 8px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 500;
          color: #666;
          text-align: center;
        `;
        
        const span = document.createElement('span');
        span.innerHTML = `卡片 ${i}<br/>(85×135mm)`;
        card.appendChild(span);
        grid.appendChild(card);
      }
      
      // 6. 组装DOM结构
      printPage.appendChild(header);
      printPage.appendChild(grid);
      tempContainer.appendChild(printPage);
      document.body.appendChild(tempContainer);
      
      // 7. 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📐 容器尺寸:', tempContainer.offsetWidth, 'x', tempContainer.offsetHeight);
      console.log('📐 页面尺寸:', printPage.offsetWidth, 'x', printPage.offsetHeight);
      
      // 8. 使用html2canvas截图
      console.log('📸 开始截图转换...');
      const canvas = await html2canvas(printPage, {
        width: 794,
        height: 1123,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: true
      });
      
      console.log('📸 截图完成，canvas尺寸:', canvas.width, 'x', canvas.height);
      
      // 9. 清理临时元素
      document.body.removeChild(tempContainer);
      
      // 10. 创建PDF
      console.log('📄 创建PDF文档...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 11. 将canvas图片添加到PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      
      // 12. 保存PDF
      pdf.save('wordcard-new-test.pdf');
      console.log('✅ PDF导出成功！');
      
    } catch (error) {
      console.error('❌ PDF导出失败:', error);
      alert('PDF导出失败：' + (error instanceof Error ? error.message : String(error)));
    }
  }, []);

  return {
    exportToPDFNew
  };
}; 