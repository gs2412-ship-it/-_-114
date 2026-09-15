@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   铁工技能考试刷题 Web版 V2.0
echo   正在启动本地测试服务器...
echo ========================================
echo.
where py >nul 2>nul
if %errorlevel%==0 (
    set "PYTHON=py"
) else (
    where python >nul 2>nul
    if %errorlevel%==0 (
        set "PYTHON=python"
    ) else (
        echo [错误] 没有检测到 Python。
        echo 请先安装 Python，然后重新双击本文件。
        pause
        exit /b 1
    )
)
start "" http://localhost:8000
%PYTHON% -m http.server 8000
pause
