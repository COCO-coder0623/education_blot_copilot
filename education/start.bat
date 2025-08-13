@echo off
chcp 65001 >nul
echo 🚀 启动AI作业批改项目...
cd /d "d:\01-coco\project-bolt-github-tcwaodf7\project\education"
echo 📂 当前目录: %CD%
echo.

echo 🔍 检查Node.js版本...
node --version
if errorlevel 1 (
    echo ❌ 错误：Node.js未安装，请先安装Node.js 18+
    pause
    exit /b 1
)

echo 📋 检查package.json...
if not exist package.json (
    echo ❌ 错误: 找不到package.json文件
    pause
    exit /b 1
)

echo 📦 检查node_modules...
if not exist node_modules (
    echo 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 错误: 依赖安装失败，尝试清理缓存...
        npm cache clean --force
        rmdir /s /q node_modules 2>nul
        del package-lock.json 2>nul
        npm install
        if errorlevel 1 (
            echo ❌ 依赖安装仍然失败
            pause
            exit /b 1
        )
    )
)

echo.
echo 🌐 启动开发服务器...
echo 🔗 访问地址: http://localhost:5173/
echo 📤 上传页面: http://localhost:5173/upload
echo 🧪 测试页面: http://localhost:5173/test-upload.html
echo.
echo ⚠️ 按Ctrl+C停止服务器
echo.

npx vite --port 5173
if errorlevel 1 (
    echo.
    echo ⚠️ 端口5173被占用，尝试使用5174端口...
    npx vite --port 5174
)

pause
