# Excel文件测试指南

## 📊 支持的Excel文档功能

现在系统已支持上传Excel文档(.xlsx)文件，智能提取工作表中的单词。

### ✨ 功能特点

- **智能列识别**: 优先识别"Word"列，备选第一列或全表内容
- **多策略提取**: 结构化数据优先，文本数据备选
- **智能解析**: 复用多分隔符解析逻辑，支持单元格内多单词
- **自动清洗**: 过滤非英文内容，去重，标准化处理

### 🧪 测试方法

#### 1. 创建测试XLSX文件

**方式一：结构化格式（推荐）**
使用Excel、Google Sheets等创建以下格式：

| Word | Definition | Example |
|------|------------|---------|
| apple | 苹果 | I eat an apple |
| book | 书籍 | Read a book |
| computer | 电脑 | Use a computer |

**方式二：单列格式**
在A列输入单词：
```
A1: apple
A2: book computer
A3: dog, elephant, flower
A4: guitar; house; ice cream
```

**方式三：混合内容格式**
在任意单元格输入：
```
A1: English Vocabulary List
B1: apple book computer
C2: dog, elephant, flower
A3: guitar; house; ice cream
```

#### 2. 智能提取策略

系统会按以下优先级提取单词：

1. **策略1**: 查找"Word"列（不区分大小写）
   - 如果找到，提取该列的所有数据
   - 跳过标题行，处理数据行

2. **策略2**: 提取第一列数据
   - 当没有"Word"列时使用
   - 提取A列的所有文本内容

3. **策略3**: 全表文本提取
   - 当第一列内容不足时使用
   - 提取所有单元格的文本内容

#### 3. 支持的分隔符

每个单元格内支持多种分隔符：
- **空格**: `apple book computer`
- **英文逗号**: `dog, elephant, flower`
- **英文分号**: `guitar; house; ice cream`
- **中文逗号**: `keyboard，laptop，mountain`
- **中文分号**: `notebook；ocean；painting`
- **混合分隔**: `rainbow, sunset tree; cloud，star；moon`

### 🔧 技术实现

- **解析库**: xlsx.js - 专业的Excel解析库
- **提取方式**: 转换为JSON数组，智能识别数据结构
- **处理逻辑**: 复用`parseTXTContent`函数的智能分隔符解析

### 📊 测试用例

#### 测试文件1：结构化格式
```
| Word | Definition |
|------|------------|
| apple | 苹果 |
| book | 书籍 |
| computer | 电脑 |
```
**预期结果**: `apple, book, computer`

#### 测试文件2：单列混合分隔符
```
A1: apple book
A2: dog, cat
A3: tree; flower
A4: sun，moon
A5: star；cloud
```
**预期结果**: `apple, book, dog, cat, tree, flower, sun, moon, star, cloud`

#### 测试文件3：全表内容
```
A1: Learning    B1: apple book
A2: Words:      B2: computer
A3: animals     B3: dog, cat, bird
```
**预期结果**: `apple, book, computer, dog, cat, bird`

### ⚠️ 注意事项

1. **文件格式**: 仅支持.xlsx格式，不支持旧版.xls格式
2. **工作表**: 默认读取第一个工作表
3. **数据类型**: 只提取文本类型的单元格内容
4. **文件大小**: 建议小于10MB
5. **单词要求**: 只保留英文单词（包含空格、连字符、撇号）

### 🐛 常见问题

**Q: 上传后显示"工作表为空"？**
A: 确保Excel文件包含数据，且第一个工作表有内容

**Q: 某些单词没有被识别？**
A: 检查单词是否为纯英文，数字和特殊符号会被过滤

**Q: 为什么没有识别"Word"列？**
A: 确保列标题恰好为"Word"（不区分大小写），没有额外空格

**Q: 如何处理多个工作表？**
A: 目前只读取第一个工作表，建议将所有单词放在第一个表中

### 📋 最佳实践

1. **推荐格式**: 使用"Word"列标题的结构化格式
2. **数据清洁**: 确保单元格内容为纯文本
3. **分隔符**: 可以在单个单元格内使用多种分隔符
4. **测试步骤**: 
   - 创建测试文件
   - 上传验证解析结果
   - 检查控制台日志了解提取策略

### 🚀 下一步

Excel支持已完成！现在系统支持：
- ✅ CSV文件（结构化数据）
- ✅ TXT文件（智能分隔符）
- ✅ Word文档（纯文本提取）
- ✅ Excel文件（智能列识别）

可以开始测试完整的多格式文件支持功能了！ 