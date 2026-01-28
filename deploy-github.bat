@echo off
echo ========================================
echo  ALPS GitHub Deployment Script
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo [ERROR] Failed to initialize Git repository
    pause
    exit /b 1
)

echo [2/5] Adding all files...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to add files
    pause
    exit /b 1
)

echo [3/5] Creating initial commit...
git commit -m "Initial commit - Agentic Light Pollution Sentinel (ALPS)"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create commit
    pause
    exit /b 1
)

echo [4/5] Setting main branch...
git branch -M main
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set branch
    pause
    exit /b 1
)

echo [5/5] Adding remote repository...
git remote add origin https://github.com/contact-shreyas/agentic-light-sentinel.git
if %errorlevel% neq 0 (
    echo [WARNING] Remote might already exist, continuing...
    git remote set-url origin https://github.com/contact-shreyas/agentic-light-sentinel.git
)

echo.
echo ========================================
echo  Ready to push to GitHub!
echo ========================================
echo.
echo Next steps:
echo 1. Create repository at: https://github.com/new
echo    - Repository name: agentic-light-sentinel
echo    - Description: Agentic Light Pollution Sentinel (ALPS)
echo    - Keep it PUBLIC
echo    - Do NOT initialize with README
echo.
echo 2. Then run: git push -u origin main
echo.
echo 3. Deploy to Vercel:
echo    - Go to: https://vercel.com/new
echo    - Import: contact-shreyas/agentic-light-sentinel
echo    - Add environment variables from .env.local
echo    - Deploy!
echo.
pause
