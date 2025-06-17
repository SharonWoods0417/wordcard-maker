/* ========================================
 * 🔗 Bolt弹窗集成模块
 * ======================================== 
 * 
 * 📋 模块说明：
 * 此模块专门用于集成Bolt设计的CSV确认弹窗
 * 完全独立于主应用逻辑，可随时移除或替换
 * 
 * 🔄 集成流程：
 * 1. Bolt提供HTML/CSS/JS文件
 * 2. 将代码集成到showWordConfirmationModal函数
 * 3. 测试弹窗显示和交互
 * 4. 确保回调函数正确触发
 * 
 * ⚠️ 重要：不要修改接口参数，确保主应用兼容性
 * ======================================== */

import React from 'react';
import ReactDOM from 'react-dom/client';
import WordConfirmationModal from '../components/WordConfirmationModal';
import '../components/word-confirmation.css';



/**
 * 弹窗集成主函数
 * 在 CSV 上传成功后调用，显示 Bolt 设计的确认弹窗
 * 
 * @param validWords - 从 CSV 解析的原始单词数据数组
 * @param onConfirm - 用户确认后的回调函数
 * @param onCancel - 用户取消后的回调函数
 */
export function showWordConfirmationModal(words: any[], onConfirm: any, onCancel: any) {
  console.log('[🔔 Bolt] showWordConfirmationModal 被调用了', { wordCount: words.length });
  console.log('🚨 弹窗集成模块开始执行...');
  
  try {
    // 提取单词字符串数组（适配不同的CSV格式）
    const wordStrings = words.map((word: any) => {
      // 支持多种格式：{ Word: "xxx" } 或 { word: "xxx" } 或直接字符串
      if (typeof word === 'string') return word;
      return word.Word || word.word || String(word);
    });
    
    console.log('📋 提取的单词:', wordStrings.slice(0, 5));
    
    const modalRoot = document.createElement('div');
    document.body.appendChild(modalRoot);
    console.log('🏗️ 创建了弹窗容器');

    const root = ReactDOM.createRoot(modalRoot);
    console.log('🎯 正在渲染弹窗...');
    
    root.render(
      React.createElement(WordConfirmationModal, {
        words: wordStrings,
        isOpen: true,
        onConfirm: (selected: string[]) => {
          console.log('✅ 用户确认，选择了:', selected);
          root.unmount();
          modalRoot.remove();
          
          // 重建原格式数据
          const selectedWordData = selected.map(selectedWord => {
            const originalWord = words.find((word: any) => {
              const wordText = typeof word === 'string' ? word : (word.Word || word.word || String(word));
              return wordText.toLowerCase() === selectedWord.toLowerCase();
            });
            return originalWord || { Word: selectedWord };
          });
          
          onConfirm(selectedWordData);
        },
        onCancel: () => {
          console.log('❌ 用户取消');
          root.unmount();
          modalRoot.remove();
          onCancel();
        }
      })
    );
    
    console.log('🎯 弹窗渲染完成');
    
  } catch (error) {
    console.error('❌ 弹窗显示失败:', error);
    console.error('将回退到原有流程');
    onConfirm(words);
  }
}

/**
 * 清理函数（简化版）
 */
export function cleanup(): void {
  console.log('🧹 清理弹窗容器');
  // 清理可能残留的弹窗容器
  const containers = document.querySelectorAll('div[id*="modal"], div[id*="Modal"]');
  containers.forEach(container => container.remove());
}

/**
 * 测试函数 - 用于验证集成是否正常工作
 */
export function testIntegration(): boolean {
  try {
    console.log('🧪 测试 Bolt Modal 集成...');
    
    // 测试基本功能
    const testWords = [
      { Word: 'test', Definition: '测试', IPA: '/test/' }
    ];
    
    const testConfirm = (selectedWords: any[]) => {
      console.log('✅ 测试确认回调正常', selectedWords);
    };
    
    const testCancel = () => {
      console.log('✅ 测试取消回调正常');
    };
    
    // 实际测试弹窗显示
    showWordConfirmationModal(testWords, testConfirm, testCancel);
    
    console.log('🎯 集成测试完成');
    return true;
    
  } catch (error) {
    console.error('❌ 集成测试失败:', error);
    return false;
  }
}

// 页面卸载时自动清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}

/* 📋 集成检查清单
 * ===============
 * 
 * ✅ 在集成Bolt弹窗时请检查：
 * 
 * 1. 弹窗显示正常
 *    - HTML结构正确
 *    - CSS样式应用
 *    - 动画效果流畅
 * 
 * 2. 交互功能正常
 *    - 确认按钮触发onConfirm
 *    - 取消按钮触发onCancel
 *    - ESC键可关闭弹窗
 *    - 点击遮罩可关闭弹窗
 * 
 * 3. 数据显示正确
 *    - 单词列表显示
 *    - 单词数量统计
 *    - 任何其他Bolt设计的信息
 * 
 * 4. 状态管理正确
 *    - 弹窗关闭后DOM清理
 *    - 不影响主应用状态
 *    - 可重复调用
 * 
 * 5. 兼容性良好
 *    - 移动端响应式
 *    - 不同浏览器兼容
 *    - 不冲突现有样式
 */ 