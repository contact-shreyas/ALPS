@echo off
echo =========================================
echo GitHub Repository Upload - Automated
echo =========================================
echo.
echo This script will:
echo 1. Create a private repository on GitHub
echo 2. Push all your code
echo.
echo Repository: contact-shreyas/agentic-light-sentinel
echo.
pause

REM Try to push - Git will handle authentication
echo.
echo Attempting to push to GitHub...
echo You may be prompted to sign in to GitHub
echo.

git push -u origin master

if %errorlevel% equ 0 (
    echo.
    echo =========================================
    echo SUCCESS! Repository uploaded
    echo =========================================
    echo.
    echo View your repository at:
    echo https://github.com/contact-shreyas/agentic-light-sentinel
    echo.
) else (
    echo.
    echo =========================================
    echo Repository needs to be created first
    echo =========================================
    echo.
    echo Please follow these steps:
    echo 1. Go to https://github.com/new
    echo 2. Repository name: agentic-light-sentinel
    echo 3. Make it PRIVATE
    echo 4. Do NOT add README, .gitignore, or license
    echo 5. Click "Create repository"
    echo 6. Run this script again
    echo.
)

pause
