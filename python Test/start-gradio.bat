@echo off
chcp 65001 > nul
echo 正在启动基于Gradio的数据可视化工具...
echo.

REM 检查Python是否已安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查依赖包是否已安装
echo 正在检查并安装依赖包...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo 警告: 依赖包安装可能失败，请手动安装
)

echo.
echo 正在启动Gradio应用...
echo 应用将在 http://localhost:3000 上运行
echo 按 Ctrl+C 停止应用
echo.

python app.py

pause