# 🚀 项目启动失败诊断和解决方案

## 📋 快速启动步骤

### 1. 确认目录位置
```bash
cd d:\01-coco\project-bolt-github-tcwaodf7\project\education
```

### 2. 检查必要文件
确认以下文件存在：
- ✅ package.json
- ✅ vite.config.ts  
- ✅ src/main.tsx
- ✅ index.html
- ✅ .env (API配置)

### 3. 清理并重新安装依赖
```bash
# 删除旧的依赖
rmdir /s node_modules
del package-lock.json

# 重新安装
npm install
```

### 4. 启动项目
```bash
# 方法1: 使用npm脚本
npm run dev

# 方法2: 直接使用npx
npx vite

# 方法3: 指定端口
npx vite --port 5174

# 方法4: 调试模式
npx vite --debug
```

## 🔧 常见启动失败原因及解决方案

### 问题1: "vite"不是内部或外部命令
**原因**: Vite未正确安装或不在PATH中
**解决**:
```bash
npx vite  # 使用npx运行
```

### 问题2: 端口被占用
**症状**: `Error: listen EADDRINUSE :::5173`
**解决**:
```bash
npx vite --port 5174  # 使用其他端口
```

### 问题3: 依赖版本冲突
**症状**: 各种模块找不到错误
**解决**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 问题4: Node.js版本过低
**症状**: 语法错误或不支持的特性
**解决**: 升级到Node.js 18+
```bash
node -v  # 检查版本
```

### 问题5: TypeScript编译错误
**症状**: 白屏 + 控制台类型错误
**解决**: 检查src目录下的TypeScript文件

### 问题6: 环境变量问题
**症状**: API相关错误
**解决**: 检查.env文件格式
```
VITE_OPENAI_API_KEY=sk-...
VITE_AZURE_VISION_ENDPOINT=https://...
VITE_AZURE_VISION_KEY=...
```

## 🎯 启动成功验证

启动成功后会看到：
```
  VITE v5.4.8  ready in 818 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 📱 功能测试页面

1. **主页**: http://localhost:5173/
2. **上传页面**: http://localhost:5173/upload  
3. **测试页面**: http://localhost:5173/test-upload.html (推荐先测试这个)

## 🆘 如果仍然失败

### 手动启动步骤:
1. 打开Windows命令提示符(CMD)或PowerShell
2. 运行以下命令:

```bash
cd /d "d:\01-coco\project-bolt-github-tcwaodf7\project\education"
dir  # 确认文件存在
npm install  # 重新安装依赖
npx vite  # 启动服务器
```

### 收集错误信息:
如果启动失败，请提供：
1. 完整的错误消息
2. Node.js版本 (`node -v`)
3. npm版本 (`npm -v`)
4. 是否能看到"ready in"消息

### 备用方案:
如果Vite启动有问题，可以尝试其他开发服务器：
```bash
npx serve -s dist -p 5173  # 需要先build
npx http-server -p 5173    # 简单静态服务器
```

## 🎉 成功启动后的下一步

1. 访问测试页面: http://localhost:5173/test-upload.html
2. 上传一张作业图片测试
3. 使用"一键批改"功能
4. 如果需要真实API功能，确认.env配置正确

---

**💡 提示**: 如果测试页面工作正常，说明项目基础没问题，问题可能在特定的React组件中。
