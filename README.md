# AI Education SaaS Platform

一个基于AI的智能作业批改和学习辅助平台，使用React + TypeScript + Vite构建。

## 🚀 功能特性

- **智能作业批改**: 使用GPT-4o进行图像识别和作业批改
- **OCR文字识别**: 集成微软Computer Vision API进行文字提取
- **错题本管理**: 自动收集和分类错题，支持复习跟踪
- **学习分析**: 生成学习报告和薄弱知识点分析
- **练习推荐**: 基于错题智能推荐相关练习

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- React Router DOM (路由)
- Tailwind CSS (样式)
- Lucide React (图标)

### AI服务
- OpenAI GPT-4o (作业批改)
- Microsoft Computer Vision API (OCR识别)

### 数据存储
- 浏览器localStorage (开发阶段)

## ⚙️ 环境配置

创建 `education/.env` 文件并配置以下环境变量：

```env
# OpenAI配置 (用于作业批改)
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# 微软Azure Computer Vision配置 (用于OCR识别)
VITE_AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
VITE_AZURE_VISION_KEY=your_azure_vision_key_here
```

## 🚀 快速开始

1. **安装依赖**
```bash
cd education
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **构建生产版本**
```bash
npm run build
```

## 📁 项目结构

```
education/
├── src/
│   ├── components/         # 可复用组件
│   │   ├── Header.tsx     # 导航头部
│   │   ├── QuestionDisplay.tsx
│   │   └── OCRDiagnosticPanel.tsx
│   ├── pages/             # 页面组件
│   │   ├── Dashboard.tsx  # 学习概览
│   │   ├── Upload.tsx     # 作业上传
│   │   ├── Analysis.tsx   # 批改分析
│   │   ├── ErrorBook.tsx  # 错题本
│   │   ├── Practice.tsx   # 练习推荐
│   │   └── Profile.tsx    # 个人中心
│   ├── services/          # 业务逻辑
│   │   ├── openai.ts      # GPT-4o服务
│   │   ├── ocr.ts         # OCR识别服务
│   │   ├── errorBook.ts   # 错题管理
│   │   └── gradingHistory.ts # 批改历史
│   └── utils/             # 工具类
│       ├── imageProcessor.ts # 图片处理优化
│       └── ocrDiagnostic.ts  # OCR诊断工具
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 OCR识别优化

如果遇到微软Computer Vision API识别效果差的问题，请参考 `OCR_OPTIMIZATION_GUIDE.md` 获取详细的优化指南。

### 主要优化点：
- **图片预处理**: 自动优化分辨率、对比度和清晰度
- **格式优化**: 使用最佳的图片格式和压缩参数
- **质量检测**: 实时分析图片质量并提供改进建议
- **错误诊断**: 详细的API调用和识别效果诊断

### 使用优化功能：
```typescript
import { ImageProcessor } from './utils/imageProcessor';
import { OCRDiagnostic } from './utils/ocrDiagnostic';

// 优化图片
const optimizedFile = await ImageProcessor.optimizeForOCR(originalFile);

// 诊断识别效果
const diagnostic = new OCRDiagnostic();
const result = await diagnostic.fullDiagnostic(imageFile);
```

## 📊 核心业务流程

1. **图片上传** → 自动优化图片质量
2. **OCR识别** → 提取文字内容（可选）
3. **AI批改** → GPT-4o分析和批改
4. **结果保存** → 存储批改结果和错题
5. **学习分析** → 生成个性化学习报告

## 🔐 安全说明

- ⚠️ 当前版本API密钥存储在前端环境变量中，仅适用于开发和演示
- 🏭 生产环境需要部署后端服务来保护API密钥
- 🗄️ 数据目前存储在浏览器localStorage中

## 🚀 部署为完整SaaS的建议

1. **后端开发**
   - Node.js/Python API服务
   - 数据库设计(PostgreSQL/MongoDB)
   - 用户认证系统
   - API安全防护

2. **功能扩展**
   - 多用户支持
   - 班级和教师管理
   - 支付系统集成
   - 数据分析仪表板

3. **性能优化**
   - CDN加速
   - 图片处理服务
   - 缓存策略
   - 负载均衡

## 📝 开发说明

- 使用TypeScript确保类型安全
- 遵循React Hooks最佳实践
- 组件设计遵循单一职责原则
- 服务层封装所有外部API调用

## 🚨 常见问题解决

### 问题1: OpenAI API图像识别失败
**错误信息**: "I'm unable to process images directly..."

**原因分析**:
- OpenAI API密钥没有GPT-4o视觉功能权限
- 账户余额不足或新账户等待激活
- API配置错误

**解决方案**:
1. **使用OCR+文字模式**（推荐）
   ```bash
   # 1. 配置微软Azure OCR API
   VITE_AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   VITE_AZURE_VISION_KEY=your_azure_key_here
   
   # 2. 使用流程：上传图片 → OCR识别 → 批改
   ```

2. **检查OpenAI配置**
   ```bash
   # 确认API密钥正确
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   
   # 验证账户权限
   # 访问 https://platform.openai.com/account/usage
   ```

3. **查看详细解决方案**
   - 参考: `OPENAI_VISION_SOLUTION.md`

### 问题2: 微软OCR识别效果差
**解决方案**:
- 参考: `OCR_OPTIMIZATION_GUIDE.md`
- 使用内置的图片优化功能
- 遵循拍照最佳实践

### 问题3: 依赖安装问题
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 如果仍有问题，使用yarn
npm install -g yarn
yarn install
```

1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request
6. 测试师傅关联
7. 啊啊啊

## 📄 许可证

本项目采用MIT许可证 - 查看LICENSE文件了解详情。