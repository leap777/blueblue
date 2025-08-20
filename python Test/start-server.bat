@echo off
chcp 65001 > nul
echo 正在启动数据可视化服务器...
echo 请确保已安装Node.js和相关依赖包
echo.

REM 检查Node.js是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖包是否已安装
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖包安装失败
        pause
        exit /b 1
    )
) else (
    REM 检查express是否已安装
    node -e "require('express')" >nul 2>&1
    if %errorlevel% neq 0 (
        echo 正在重新安装依赖包...
        npm install
        if %errorlevel% neq 0 (
            echo 错误: 依赖包安装失败
            pause
            exit /b 1
        )
    )
)

echo 正在启动服务器...
echo 服务器将在 http://localhost:3000 上运行
echo 按 Ctrl+C 停止服务器
echo.

node server.js

pause