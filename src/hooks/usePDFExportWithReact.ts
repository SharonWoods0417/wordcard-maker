import React, { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 🚀 完整多页PDF导出Hook - 3倍分辨率优化
 * 
 * 主要改进：
 * 1. 支持导出所有页面到一个PDF文件
 * 2. 使用scale=3提高分辨率，确保清晰度
 * 3. 强化图片等比缩放，彻底避免拉伸
 * 4. 自动计算总页数，完整导出
 */
export const usePDFExportWithReact = () => {
  const renderReactComponentToPDF = useCallback(async (
    filename: string = 'wordcards-complete.pdf',
    exportType: 'all' | 'front' | 'back' = 'all'
  ) => {
    try {
      console.log('🎯 开始完整多页PDF导出 (3倍分辨率)...', { filename, exportType });
      
      // 1. 查找所有预览容器
      const allPreviewContainers = document.querySelectorAll('[data-component="PrintPreviewWithReact"]');
      
      if (allPreviewContainers.length === 0) {
        console.error('❌ 找不到任何预览区域容器');
        throw new Error('找不到预览区域，请确保页面已加载完成');
      }
      
      console.log(`📄 找到 ${allPreviewContainers.length} 个预览容器`);
      
      // 2. 创建高清PDF
      console.log('📄 创建高清PDF文档...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = 210;  // A4宽度mm
      const pdfHeight = 297; // A4高度mm
      
      let isFirstPage = true;
      
      // 3. 遍历所有页面，导出到PDF
      for (let i = 0; i < allPreviewContainers.length; i++) {
        const container = allPreviewContainers[i] as HTMLElement;
        
        // 判断是正面还是反面
        const isBackSide = container.textContent?.includes('Back Side') || false;
        const side = isBackSide ? '反面' : '正面';
        
        // 根据导出类型过滤
        if (exportType === 'front' && isBackSide) continue;
        if (exportType === 'back' && !isBackSide) continue;
        
        console.log(`📸 处理第 ${i + 1} 页 (${side})...`);
        
        // 等待当前页面图片完全加载
        const images = container.querySelectorAll('img');
        if (images.length > 0) {
          console.log(`📷 等待第 ${i + 1} 页的 ${images.length} 张图片加载...`);
          await Promise.all(
            Array.from(images).map(img => {
              return new Promise((resolve) => {
                if (img.complete && img.naturalHeight !== 0) {
                  resolve(true);
                } else {
                  img.onload = () => resolve(true);
                  img.onerror = () => {
                    console.warn(`第 ${i + 1} 页图片加载失败: ${img.src}`);
                    resolve(true);
                  };
                  setTimeout(() => resolve(true), 5000);
                }
              });
            })
          );
          
          // 详细尺寸检测
          console.log(`🔍 第 ${i + 1} 页图片详细检测:`);
          images.forEach((img, imgIndex) => {
            const imgContainer = img.parentElement;
            if (imgContainer && img.naturalWidth && img.naturalHeight) {
              const naturalRatio = img.naturalWidth / img.naturalHeight;
              const containerRatio = imgContainer.offsetWidth / imgContainer.offsetHeight;
              const distortion = Math.abs(naturalRatio - containerRatio) / naturalRatio * 100;
              
              console.log(`  📸 图片 ${imgIndex + 1}: ${img.src.split('/').pop()}`, {
                natural: `${img.naturalWidth}×${img.naturalHeight}`,
                container: `${imgContainer.offsetWidth}×${imgContainer.offsetHeight}`,
                distortion: `${distortion.toFixed(1)}%`,
                status: distortion > 5 ? '⚠️ 可能有变形' : '✅ 比例正常'
              });
            }
          });
        }
        
        // 4. 高清HTML转Canvas
        console.log(`🎨 第 ${i + 1} 页转换为高清Canvas...`);
        const canvas = await html2canvas(container, {
          scale: 3, // 3倍分辨率
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false, // 减少日志输出
          imageTimeout: 15000,
          removeContainer: false,
          width: container.offsetWidth,
          height: container.offsetHeight,
          foreignObjectRendering: false,
          windowWidth: container.offsetWidth,
          windowHeight: container.offsetHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            // 简化图片处理：确保所有图片都等比缩放显示
            const images = clonedDoc.querySelectorAll('img');
            images.forEach((img: any) => {
              // 强制应用等比缩放样式
              img.style.objectFit = 'contain';
              img.style.objectPosition = 'center';
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.display = 'block';
            });
            
            // 强制设置拼读色块的固定尺寸和样式
            const phonicsChunks = clonedDoc.querySelectorAll('.space-x-1 > div');
            phonicsChunks.forEach((chunk: any, index) => {
              // 只处理拼读色块（有背景色的div）
              if (chunk.style.backgroundColor || chunk.className.includes('bg-')) {
                // 强制设置固定尺寸和圆角
                chunk.style.cssText = `
                  display: inline-block !important;
                  padding: 4px 8px !important;
                  margin: 2px !important;
                  border-radius: 4px !important;
                  font-size: 12px !important;
                  font-weight: 700 !important;
                  line-height: 1.2 !important;
                  white-space: nowrap !important;
                  border: 1px solid !important;
                  box-sizing: border-box !important;
                  min-width: 24px !important;
                  text-align: center !important;
                  vertical-align: middle !important;
                  ${chunk.style.backgroundColor ? `background-color: ${chunk.style.backgroundColor} !important;` : ''}
                  ${chunk.style.color ? `color: ${chunk.style.color} !important;` : ''}
                  ${chunk.style.borderColor ? `border-color: ${chunk.style.borderColor} !important;` : ''}
                `;
              }
            });
            
            // 处理音标色块（灰色背景的）
            const ipaChunks = clonedDoc.querySelectorAll('.bg-gray-100');
            ipaChunks.forEach((chunk: any) => {
              if (chunk.textContent && chunk.textContent.includes('/')) {
                chunk.style.cssText = `
                  display: inline-block !important;
                  padding: 2px 6px !important;
                  margin: 1px !important;
                  border-radius: 3px !important;
                  font-size: 11px !important;
                  font-weight: 400 !important;
                  line-height: 1.2 !important;
                  white-space: nowrap !important;
                  background-color: #f3f4f6 !important;
                  color: #374151 !important;
                  border: none !important;
                  box-sizing: border-box !important;
                  min-width: 20px !important;
                  text-align: center !important;
                  vertical-align: middle !important;
                `;
              }
            });
          }
        });
        
        console.log(`📸 第 ${i + 1} 页截图完成，canvas尺寸: ${canvas.width}×${canvas.height}px`);
        
        // 5. 添加到PDF
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        console.log(`✅ 第 ${i + 1} 页已添加到PDF`);
      }
      
      // 6. 保存完整PDF
      pdf.save(filename);
      console.log(`🎉 完整多页PDF导出成功！共 ${pdf.getNumberOfPages()} 页`);
      
    } catch (error) {
      console.error('❌ 完整多页PDF导出失败:', error);
      alert('PDF导出失败：' + (error instanceof Error ? error.message : String(error)));
    }
  }, []);

  return {
    renderReactComponentToPDF
  };
}; 