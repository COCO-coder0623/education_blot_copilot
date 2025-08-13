# 🎯 AI作业批改使用指南

## 🚀 快速开始

### 1. 环境配置

在 `education/.env` 文件中配置API密钥：

```bash
# 微软Azure Computer Vision API (用于OCR识别)
VITE_AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
VITE_AZURE_VISION_KEY=your_azure_vision_key

# OpenAI API (用于AI批改)
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
```

### 2. 启动应用

```bash
cd education
npm install
npm run dev
```

### 3. 使用步骤

1. **打开上传页面** - 点击导航栏的"上传作业"
2. **上传图片** - 拖拽或点击选择作业图片
3. **一键批改** - 点击紫色的"一键批改"按钮
4. **查看结果** - 自动跳转到分析页面查看批改结果

## 📱 功能说明

### 🟣 一键批改 (推荐)
- **功能**: 自动完成图片优化 → OCR识别 → AI批改的完整流程
- **优势**: 最简单快捷，自动优化图片质量
- **适用**: 图片质量较好，希望快速得到结果

### 🟢 OCR识别题目
- **功能**: 仅使用微软Azure API识别图片中的文字内容
- **优势**: 可以预览和编辑识别结果
- **适用**: 想要检查识别准确性，或手动修正题目

### 🔵 高级批改
- **功能**: 使用当前的OCR结果进行AI批改
- **优势**: 可以先OCR识别，编辑题目后再批改
- **适用**: 需要精确控制批改内容

## 🎯 使用示例

### 场景1：数学作业批改

1. **上传图片**: 清晰拍照数学习题
2. **一键批改**: 等待30-60秒自动处理
3. **查看结果**: 
   - 每道题的对错判断
   - 详细解题步骤
   - 错题解析和建议

### 场景2：英语作业批改

1. **上传图片**: 拍照英语练习题
2. **一键批改**: 自动识别英文内容
3. **查看结果**:
   - 语法错误标注
   - 单词拼写检查
   - 答案正确性分析

### 场景3：语文作业批改

1. **上传图片**: 拍照语文题目
2. **OCR识别**: 先检查中文识别效果
3. **高级批改**: 确认识别准确后批改
4. **查看结果**:
   - 字词理解分析
   - 句子结构评价
   - 内容理解判断

## 🔧 问题排查

### ❌ 常见错误及解决方案

#### 1. "请配置微软Azure Computer Vision API"
**原因**: OCR API未配置
**解决**: 
```bash
# 在 .env 文件中添加
VITE_AZURE_VISION_ENDPOINT=https://your-endpoint/
VITE_AZURE_VISION_KEY=your-key
```

#### 2. "OpenAI API密钥无效"
**原因**: OpenAI API配置错误
**解决**:
```bash
# 检查API密钥格式
VITE_OPENAI_API_KEY=sk-proj-xxxxx
```

#### 3. "图片识别失败"
**原因**: 图片质量问题
**解决**:
- ✅ 确保图片清晰
- ✅ 光线充足
- ✅ 文字完整可见
- ✅ 避免反光和阴影

#### 4. "AI无法处理图片"
**原因**: OpenAI账户无视觉权限或API限制
**解决**:
- 🔄 使用"OCR识别题目"先提取文字
- 🔄 然后使用"高级批改"进行批改
- 🔄 或升级OpenAI账户权限

### 🔍 调试工具

#### 浏览器控制台测试
```javascript
// 测试API配置
testAPIConfig()

// 测试完整流程
testCompleteFlow()

// 查看环境变量
console.log('OCR配置:', import.meta.env.VITE_AZURE_VISION_ENDPOINT ? '✅' : '❌')
console.log('OpenAI配置:', import.meta.env.VITE_OPENAI_API_KEY ? '✅' : '❌')
```

#### 网络请求检查
1. 打开浏览器开发者工具
2. 切换到"Network"标签
3. 执行批改操作
4. 查看API请求状态

## 📊 最佳实践

### 📸 拍照技巧
- **角度**: 正面垂直拍摄，避免倾斜
- **距离**: 保持适当距离，确保内容完整
- **光线**: 使用自然光或均匀人工光源
- **背景**: 选择干净对比度高的背景
- **稳定**: 保持手机稳定，避免模糊

### 🖼️ 图片要求
- **格式**: 支持 JPG、PNG、WEBP
- **大小**: 建议 1-4MB
- **分辨率**: 1000-3000像素最佳
- **内容**: 确保题目和答案都在图片内

### ⚡ 性能优化
- **单次上传**: 建议一次处理一张图片
- **网络环境**: 确保网络连接稳定
- **缓存清理**: 定期清理浏览器缓存
- **错误重试**: 失败后可以重新尝试

## 🎉 成功案例

### 数学题批改结果示例
```json
{
  "totalQuestions": 3,
  "correctAnswers": 2,
  "score": 67,
  "questions": [
    {
      "questionText": "计算: 15 + 28 = ?",
      "studentAnswer": "43",
      "correctAnswer": "43",
      "isCorrect": true,
      "explanation": "正确！15 + 28 = 43"
    },
    {
      "questionText": "计算: 7 × 8 = ?",
      "studentAnswer": "54",
      "correctAnswer": "56",
      "isCorrect": false,
      "explanation": "错误。7 × 8 = 56，不是54。建议复习乘法口诀表。"
    }
  ]
}
```

### 英语作业批改结果示例
```json
{
  "totalQuestions": 2,
  "correctAnswers": 1,
  "score": 50,
  "questions": [
    {
      "questionText": "Fill in the blank: I ___ to school yesterday.",
      "studentAnswer": "go",
      "correctAnswer": "went",
      "isCorrect": false,
      "explanation": "错误。这里需要用过去时 'went'，因为有时间标志词 'yesterday'。"
    }
  ]
}
```

## 📈 功能特色

### 🧠 AI智能分析
- **知识点识别**: 自动识别涉及的知识点
- **错误分类**: 将错误按类型分类
- **学习建议**: 提供个性化学习建议
- **进度跟踪**: 记录学习进步情况

### 📚 错题本集成
- **自动收集**: 错题自动添加到错题本
- **分类整理**: 按科目和知识点分类
- **复习提醒**: 智能推荐复习时机
- **解析详细**: 包含完整解题过程

### 📊 学习分析
- **成绩趋势**: 显示学习成绩变化
- **薄弱环节**: 识别需要加强的知识点
- **练习推荐**: 推荐相关练习题
- **学习报告**: 生成详细学习报告

## 🆘 技术支持

如果遇到问题，请按以下步骤排查：

1. **检查配置**: 确认API密钥正确配置
2. **测试网络**: 确保能正常访问API服务
3. **图片质量**: 检查图片是否清晰可读
4. **浏览器兼容**: 使用最新版本Chrome或Edge
5. **控制台日志**: 查看浏览器控制台错误信息

需要帮助时，请提供：
- 错误信息截图
- 浏览器控制台日志
- 使用的图片样本
- 具体操作步骤

祝您使用愉快！🎉
