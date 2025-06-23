import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 🎯 图片预处理函数 - 确保图片在PDF导出时正确显示
const preprocessImagesForPDF = async (): Promise<void> => {
  return new Promise((resolve) => {
    const images = document.querySelectorAll('.print-page img');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      resolve();
      return;
    }

    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      
      // 🔧 强制设置图片样式，确保html2canvas正确捕获
      imgElement.style.setProperty('position', 'absolute', 'important');
      imgElement.style.setProperty('top', '0', 'important');
      imgElement.style.setProperty('left', '0', 'important');
      imgElement.style.setProperty('width', '100%', 'important');
      imgElement.style.setProperty('height', '100%', 'important');
      imgElement.style.setProperty('object-fit', 'cover', 'important');
      imgElement.style.setProperty('object-position', 'center', 'important');
      imgElement.style.setProperty('display', 'block', 'important');
      imgElement.style.setProperty('margin', '0', 'important');
      imgElement.style.setProperty('padding', '0', 'important');
      imgElement.style.setProperty('border', 'none', 'important');
      imgElement.style.setProperty('box-sizing', 'border-box', 'important');

      // 🎯 处理图片容器
      const container = imgElement.parentElement;
      if (container) {
        container.style.setProperty('position', 'relative', 'important');
        container.style.setProperty('overflow', 'hidden', 'important');
        container.style.setProperty('width', '100%', 'important');
        container.style.setProperty('height', '35%', 'important');
        container.style.setProperty('padding', '0', 'important');
        container.style.setProperty('margin', '0', 'important');
      }

      // 📏 如果图片已加载，直接计数；否则等待加载
      if (imgElement.complete && imgElement.naturalHeight !== 0) {
        loadedCount++;
        if (loadedCount === totalImages) {
          // 短暂延迟确保样式应用
          setTimeout(resolve, 100);
        }
      } else {
        imgElement.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setTimeout(resolve, 100);
          }
        };
        imgElement.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setTimeout(resolve, 100);
          }
        };
      }
    });
  });
};

// 🔧 创建canvas时的基础配置 - 简化测试
const createOptimizedCanvas = async (page: HTMLElement): Promise<HTMLCanvasElement> => {
  console.log('📏 Creating canvas with basic settings...');

  return html2canvas(page, {
    // 🎯 基础配置 - 最简单的设置
    scale: 1,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    
    // 🎯 忽略干扰元素
    ignoreElements: (element) => {
      return element.classList.contains('no-print');
    }
  });
};

export const usePDFExport = () => {
  const exportToPDF = useCallback(async (filename: string = 'word-cards.pdf') => {
    try {
      const printPages = document.querySelectorAll('.print-page');
      if (printPages.length === 0) {
        alert('No content to export');
        return;
      }

      console.log(`📄 Starting PDF export for ${printPages.length} pages...`);

      // 🎯 第一步：预处理所有图片
      console.log('🖼️ Preprocessing images...');
      await preprocessImagesForPDF();

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      for (let i = 0; i < printPages.length; i++) {
        const page = printPages[i] as HTMLElement;
        
        console.log(`📸 Rendering page ${i + 1}...`);
        
        // 🎨 创建优化的canvas
        const canvas = await createOptimizedCanvas(page);
        
        // 📊 输出调试信息
        console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
        
        const imgData = canvas.toDataURL('image/png', 1.0); // 最高质量
        
        if (i > 0) {
          pdf.addPage();
        }
        
        // 🔧 简化的PDF尺寸计算 - 基础A4尺寸
        const pdfWidth = 210; // A4宽度(mm)
        const pdfHeight = 297; // A4高度(mm)
        
        // 📐 直接使用A4尺寸，不做复杂计算
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        console.log(`✅ Page ${i + 1} added to PDF (${pdfWidth}x${pdfHeight}mm)`);
      }

      console.log('💾 Saving PDF...');
      pdf.save(filename);
      console.log('✅ PDF export completed successfully!');
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }, []);

  return { exportToPDF };
};