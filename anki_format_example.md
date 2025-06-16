# Anki CSV 格式转换说明

## 上传CSV格式（原始格式）
```csv
Word,Definition,IPA,Example,Example_CN,Definition_CN,Audio,Picture
apple,A round fruit...,/ˈæp.əl/,She ate a juicy apple...,午饭后她吃了一个多汁的苹果。,n. 苹果（指水果）,apple.mp3,apple.jpg
```

## 导出CSV格式（Anki格式）
```csv
Word,Definition,IPA,Example,Example_CN,Definition_CN,Audio,Picture
apple,A round fruit...,/ˈæp.əl/,She ate a juicy apple...,午饭后她吃了一个多汁的苹果。,n. 苹果（指水果）,[sound:apple.mp3],<img src="apple.jpg">
```

## 字段转换规则

### Audio 字段
- **原始格式**: `apple.mp3`
- **Anki格式**: `[sound:apple.mp3]`

### Picture 字段  
- **原始格式**: `apple.jpg`
- **Anki格式**: `<img src="apple.jpg">`

### 其他字段
- 保持原样，不进行任何转换

## 使用流程

1. **上传CSV**: 使用普通文件名格式（如：`apple.mp3`, `apple.jpg`）
2. **生成卡片**: 应用会自动处理本地路径（添加`/media/`前缀）
3. **下载CSV**: 导出时自动转换为Anki格式
4. **导入Anki**: 下载的CSV可直接导入Anki，媒体文件需同时导入

## 注意事项
- 下载文件名已更改为 `anki_word_cards.csv`
- 成功提示更新为 "Anki-formatted CSV downloaded successfully!"
- 支持路径中包含 `/media/` 前缀的情况，会自动提取文件名 