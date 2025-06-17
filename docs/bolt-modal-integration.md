# 🔗 Bolt弹窗集成指南

## 📋 概述

本文档说明如何将Bolt设计的CSV确认弹窗集成到Word Card Maker应用中。

## 🎯 目标

- **不影响现有功能**：所有当前功能正常运行
- **模块化设计**：弹窗代码完全独立，可随时移除
- **简单集成**：只需替换预留的接入函数

## 📁 文件结构

```
src/
├── App.tsx                          # 主应用（已预留接入点）
├── utils/
│   └── boltModalIntegration.ts      # 🔗 Bolt弹窗集成模块
└── bolt-components/                 # 📂 Bolt组件文件夹（待创建）
    ├── word-modal.html              # Bolt生成的弹窗HTML
    ├── word-modal.css               # Bolt生成的弹窗样式
    └── word-modal.js                # Bolt生成的弹窗交互
```

## 🔄 当前状态

### ✅ 已完成
- 预留了`showWordConfirmationModal`接入点
- CSV上传成功后自动调用弹窗函数
- 提供确认/取消回调机制
- 创建独立的集成模块文件

### 🚧 待集成
- Bolt提供的弹窗HTML/CSS/JS代码
- 实际的弹窗显示逻辑
- 用户交互事件绑定

## 📝 集成步骤

### 1. 接收Bolt文件
将Bolt提供的文件放置在合适位置：
```bash
# 选项1: 放在public目录（静态资源）
public/bolt-modal/
├── word-confirmation.html
├── word-confirmation.css
└── word-confirmation.js

# 选项2: 放在src目录（模块化）
src/bolt-components/
├── word-modal.html
├── word-modal.css
└── word-modal.js
```

### 2. 修改集成模块
编辑 `src/utils/boltModalIntegration.ts`：

```typescript
export const showWordConfirmationModal = (
  validWords: WordData[],
  onConfirm: () => void,
  onCancel: () => void
): void => {
  // 🔄 替换临时实现为实际的Bolt弹窗代码
  
  // 选项A: 直接插入HTML
  const modalHTML = `从Bolt文件复制的HTML内容`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // 选项B: 动态加载Bolt模块
  import('./bolt-components/word-modal').then(module => {
    module.showModal({ words: validWords, onConfirm, onCancel });
  });
  
  // 选项C: 使用全局函数
  window.BoltUI.showWordConfirmation({
    words: validWords,
    onConfirm,
    onCancel
  });
};
```

### 3. 测试集成
```bash
# 1. 启动开发服务器
npm run dev

# 2. 上传测试CSV文件
# 3. 验证弹窗正常显示
# 4. 测试确认/取消按钮
# 5. 确认后续流程正常
```

## 🧪 测试用例

### 基本功能测试
- [ ] 上传CSV后弹窗正常显示
- [ ] 单词信息正确展示
- [ ] 确认按钮继续生成流程
- [ ] 取消按钮回退到上传状态
- [ ] 弹窗关闭后DOM正常清理

### 兼容性测试  
- [ ] 移动端响应式显示
- [ ] 不同浏览器兼容
- [ ] 不与现有样式冲突
- [ ] ESC键可关闭弹窗
- [ ] 点击遮罩可关闭弹窗

## 🔧 回退方案

如果需要临时移除Bolt弹窗：

```typescript
// 在 boltModalIntegration.ts 中恢复临时实现
export const showWordConfirmationModal = (
  validWords: WordData[],
  onConfirm: () => void,
  onCancel: () => void
): void => {
  console.log('回退到自动确认模式');
  onConfirm(); // 直接确认，跳过弹窗
};
```

## 📞 支持与联系

如果在集成过程中遇到问题：
1. 检查浏览器控制台错误信息
2. 确认Bolt文件路径正确
3. 验证回调函数是否正确绑定
4. 查看网络请求是否正常

## 📋 集成检查清单

集成完成后请确认：

### 弹窗显示
- [ ] 弹窗HTML正确渲染
- [ ] CSS样式正常应用
- [ ] 动画效果流畅自然
- [ ] 单词数据正确显示

### 交互功能
- [ ] 确认按钮触发onConfirm回调
- [ ] 取消按钮触发onCancel回调
- [ ] 键盘ESC键可关闭弹窗
- [ ] 点击遮罩可关闭弹窗

### 状态管理
- [ ] 弹窗关闭后DOM元素清理
- [ ] 不影响主应用其他状态
- [ ] 可重复调用不冲突
- [ ] 内存泄漏检查通过

### 功能完整性
- [ ] PDF导出功能正常
- [ ] 卡片预览功能正常
- [ ] 所有下载功能正常
- [ ] 主页功能完全不受影响

---

*集成完成后，此文档可归档保存作为维护参考。* 