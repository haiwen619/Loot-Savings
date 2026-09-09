@echo off
chcp 65001 >nul
title 🍯 Loot 存钱罐 - 独立打包推送至 GitHub (haiwen619/Loot-Savings)

cd /d "%~dp0\..\.."
node scripts/loot-deploy-github.cjs
if %errorlevel% neq 0 (
    echo.
    echo [错误] ❌ 打包或推送失败，请查看上方提示。
    pause
    exit /b %errorlevel%
)

echo.
echo 按任意键退出...
pause >nul
