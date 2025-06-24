import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 🎯 简化版PDF导出 - 仅用于测试布局
export const usePDFExport = () => {
  const exportToPDF = useCallback(async (filename: string = 'test-cards.pdf') => {
    try {
      console.log('🚀 开始简化版PDF导出测试...');

      // 🎯 创建测试页面DOM元素
      const testPage = document.createElement('div');
      testPage.style.cssText = `
        width: 794px;
        height: 1123px;
        background: white;
        padding: 50px;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 30px;
        position: fixed;
        top: -9999px;
        left: -9999px;
      `;

      // 🎯 创建4个测试卡片 - 使用与预览页面相同的尺寸
      // 预览页面计算：794px宽度，减去padding(30px)和gap(16px) = 748px
      // 每个卡片宽度：748px ÷ 2 = 374px
      // A6比例 (8.5:5.5)：374px × (5.5/8.5) ≈ 242px
      for (let i = 0; i < 4; i++) {
        const card = document.createElement('div');
        card.style.cssText = `
          width: 374px;
          height: 242px;
          background: #f8f9fa;
          border: 3px solid #dc2626;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: #374151;
        `;
        card.textContent = `卡片 ${i + 1} (374×242)`;
        testPage.appendChild(card);
      }

      // 🎯 临时添加到DOM
      document.body.appendChild(testPage);

      console.log('📸 创建canvas...');
      
      // 🎯 使用最简单的html2canvas配置
      const canvas = await html2canvas(testPage, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123
      });

      console.log(`Canvas尺寸: ${canvas.width}x${canvas.height}`);

      // 🎯 移除临时DOM元素
      document.body.removeChild(testPage);

      // 🎯 创建PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // 🎯 直接使用A4尺寸，不做任何缩放
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      
      console.log('💾 保存PDF...');
      pdf.save(filename);
      console.log('✅ 简化版PDF导出完成！');
      
    } catch (error) {
      console.error('❌ PDF导出失败:', error);
      alert('PDF导出失败，请查看控制台');
    }
  }, []);

  return { exportToPDF };
};

/**
 * 🖨️ 浏览器原生打印Hook - 最佳清晰度和质量
 * 
 * 优势：
 * 1. 原生浏览器渲染，100%清晰度
 * 2. 完美的CSS支持，不会有拉伸问题
 * 3. 用户可以直接选择打印到PDF
 * 4. 支持真正的A4尺寸
 */
export const useNativePrint = () => {
  const printToNativePDF = useCallback((isBackSide: boolean = false) => {
    console.log('🖨️ 启动浏览器原生打印...', { isBackSide });
    
    try {
      // 1. 查找目标预览容器
      const allPreviewContainers = document.querySelectorAll('[data-component="PrintPreviewWithReact"]');
      
      if (allPreviewContainers.length === 0) {
        alert('找不到预览区域，请确保页面已加载完成');
        return;
      }
      
      // 2. 选择要打印的容器
      let targetContainer: HTMLElement;
      if (isBackSide && allPreviewContainers.length > 1) {
        targetContainer = allPreviewContainers[1] as HTMLElement;
        console.log('📄 选择反面预览容器进行打印');
      } else {
        targetContainer = allPreviewContainers[0] as HTMLElement;
        console.log('📄 选择正面预览容器进行打印');
      }
      
      // 3. 创建打印窗口
      const printWindow = window.open('', '_blank', 'width=794,height=1123');
      if (!printWindow) {
        alert('无法打开打印窗口，请检查浏览器弹窗设置');
        return;
      }
      
      // 4. 复制所有样式到打印窗口
      const allStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(style => {
          if (style.tagName === 'LINK') {
            const link = style as HTMLLinkElement;
            return `<link rel="stylesheet" href="${link.href}">`;
          } else {
            return `<style>${style.innerHTML}</style>`;
          }
        }).join('\n');
      
      // 5. 创建优化的打印HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>单词卡片 - ${isBackSide ? '反面' : '正面'}</title>
          ${allStyles}
          <style>
            /* 🎯 打印专用样式 - 确保完美显示 */
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            /* 隐藏所有非打印元素 */
            .no-print {
              display: none !important;
            }
            
            /* 🔧 强制图片等比缩放，解决拉伸问题 */
            .h-\\[35\\%\\] img {
              object-fit: contain !important;
              object-position: center !important;
              width: 100% !important;
              height: 100% !important;
              background-color: #f8f9fa !important;
              transform: none !important;
              image-rendering: auto !important;
            }
            
            /* 确保容器尺寸正确 */
            .print-page {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 auto !important;
              background: white !important;
              box-sizing: border-box !important;
            }
            
            /* 打印时的页面设置 */
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              
              body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* 确保图片在打印时保持等比缩放 */
              img {
                object-fit: contain !important;
                object-position: center !important;
                max-width: 100% !important;
                max-height: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          ${targetContainer.outerHTML}
          
          <script>
            // 等待所有资源加载完成后自动打印
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
                
                // 打印完成后关闭窗口
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            });
            
            // 如果用户取消打印，也关闭窗口
            window.addEventListener('afterprint', function() {
              window.close();
            });
          </script>
        </body>
        </html>
      `;
      
      // 6. 写入打印窗口并触发打印
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      console.log('✅ 浏览器原生打印窗口已准备就绪');
      console.log('📝 用户提示：请在打印对话框中选择"另存为PDF"');
      
    } catch (error) {
      console.error('❌ 浏览器原生打印失败:', error);
      alert('打印失败：' + (error instanceof Error ? error.message : String(error)));
    }
  }, []);

  return {
    printToNativePDF
  };
};