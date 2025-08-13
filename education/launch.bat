@echo off
title AI作业批改系统 - 启动向导
color 0A
echo.
echo     ╔═══════════════════════════════════════╗
echo     ║        🚀 AI作业批改系统启动向导        ║
echo     ║                                       ║
echo     ║  解决"localhost拒绝连接"问题           ║
echo     ╚═══════════════════════════════════════╝
echo.

cd /d "d:\01-coco\project-bolt-github-tcwaodf7\project\education"

echo 📍 当前目录: %cd%
echo.

echo 🔍 检查环境状态...
echo ────────────────────────────────────────

echo 📦 Node.js: 
node --version
echo.

echo 📦 npm: 
npm --version
echo.

echo 📦 Vite: 
npx vite --version
echo.

echo 📂 项目文件检查:
if exist package.json (echo ✅ package.json) else (echo ❌ package.json 缺失)
if exist node_modules (echo ✅ node_modules) else (echo ❌ 依赖未安装)
if exist src\main.tsx (echo ✅ 入口文件) else (echo ❌ 入口文件缺失)
if exist .env (echo ✅ 环境配置) else (echo ❌ 环境配置缺失)
echo.

echo ⚠️  重要提示:
echo ────────────────────────────────────────
echo 1. 确保没有其他程序占用5173端口
echo 2. 如果之前启动过，请先关闭
echo 3. 防火墙可能需要允许Node.js访问网络
echo.

echo 🚀 正在启动开发服务器...
echo ────────────────────────────────────────
echo.
echo 💡 启动成功后您将看到:
echo    ➤ Local:   http://localhost:5173/
echo    ➤ Network: http://192.168.x.x:5173/
echo.
echo 🌐 可访问的页面:
echo    ➤ 主页: http://localhost:5173/
echo    ➤ 上传页面: http://localhost:5173/upload
echo    ➤ 测试页面: http://localhost:5173/test-upload.html
echo.
echo ⏳ 正在启动，请稍候...
echo.

timeout /t 3 /nobreak >nul

npm run dev

echo.
echo 🔄 如果启动失败，请尝试:
echo    1. 关闭所有浏览器标签页
echo    2. 重新运行此脚本
echo    3. 或手动运行: npx vite --port 5174
echo.
pause
