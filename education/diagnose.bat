@echo off
chcp 65001 >nul
echo 🔍 AI作业批改系统 - 快速诊断
echo ==========================================
echo.

cd /d "d:\01-coco\project-bolt-github-tcwaodf7\project\education"
echo 📂 当前目录: %cd%
echo.

echo 🔍 1. 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装
    echo 💡 请下载安装 Node.js 18+ : https://nodejs.org/
) else (
    echo ✅ Node.js 版本:
    node --version
)
echo.

echo 🔍 2. 检查npm环境...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
) else (
    echo ✅ npm 版本:
    npm --version
)
echo.

echo 🔍 3. 检查项目文件...
if exist package.json (
    echo ✅ package.json 存在
) else (
    echo ❌ package.json 不存在
)

if exist src\main.tsx (
    echo ✅ 主入口文件存在
) else (
    echo ❌ 主入口文件不存在
)

if exist .env (
    echo ✅ .env 配置文件存在
) else (
    echo ❌ .env 配置文件不存在
)
echo.

echo 🔍 4. 检查依赖安装...
if exist node_modules (
    echo ✅ node_modules 目录存在
    for /f %%i in ('dir /b node_modules 2^>nul ^| find /c /v ""') do set count=%%i
    if !count! gtr 0 (
        echo ✅ 已安装依赖包
    ) else (
        echo ⚠️ node_modules 为空，需要安装依赖
    )
) else (
    echo ❌ node_modules 不存在，需要运行 npm install
)
echo.

echo 🔍 5. 检查端口占用...
netstat -an | findstr ":5173" >nul 2>&1
if errorlevel 1 (
    echo ✅ 端口5173 可用
) else (
    echo ⚠️ 端口5173 被占用，建议使用 --port 5174
)
echo.

echo 🔍 6. 检查API配置...
if exist .env (
    findstr "VITE_OPENAI_API_KEY" .env >nul 2>&1
    if errorlevel 1 (
        echo ❌ OpenAI API密钥未配置
    ) else (
        echo ✅ OpenAI API密钥已配置
    )
    
    findstr "VITE_AZURE_VISION" .env >nul 2>&1
    if errorlevel 1 (
        echo ❌ Azure Vision API未配置
    ) else (
        echo ✅ Azure Vision API已配置
    )
) else (
    echo ❌ .env文件不存在
)
echo.

echo 📋 诊断完成！
echo.
echo 🚀 建议的启动命令：
echo npm install ^&^& npx vite
echo.
echo 📖 详细指南请查看：
echo • PROJECT_STATUS.md - 项目状态报告
echo • TROUBLESHOOTING.md - 问题排查指南  
echo • OCR_OPTIMIZATION_GUIDE.md - OCR优化指南
echo.
pause
