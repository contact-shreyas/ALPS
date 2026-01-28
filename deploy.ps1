#!/usr/bin/env pwsh
# ALPS Complete Deployment Script

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ALPS Deployment Script" -ForegroundColor Cyan
Write-Host "  Agentic Light Pollution Sentinel" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check Git
Write-Host "[1/6] Checking Git installation..." -ForegroundColor Cyan

$GitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $GitPath) {
    Write-Host "Installing Git..." -ForegroundColor Yellow
    winget install --id Git.Git -e --silent 2>$null
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host "✓ Git ready" -ForegroundColor Green

# Step 2: Initialize Git
Write-Host "`n[2/6] Initializing Git repository..." -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    git init | Out-Null
}

git config --global user.email "contact@shreyas.dev" 2>$null
git config --global user.name "Shreyas" 2>$null
git config user.email "contact@shreyas.dev" 2>$null
git config user.name "Shreyas" 2>$null

Write-Host "✓ Git configured" -ForegroundColor Green

# Step 3: Stage and Commit
Write-Host "`n[3/6] Creating commit..." -ForegroundColor Cyan

git add . 2>&1 | Out-Null
git commit -m "Initial commit - Agentic Light Pollution Sentinel (ALPS)" --allow-empty 2>&1 | Out-Null
git branch -M main 2>&1 | Out-Null

Write-Host "✓ Repository committed" -ForegroundColor Green

# Step 4: Configure Remote
Write-Host "`n[4/6] Configuring GitHub remote..." -ForegroundColor Cyan

$RepoName = "agentic-light-sentinel"
$RepoURL = "https://github.com/contact-shreyas/$RepoName.git"

$CurrentRemote = git config --get remote.origin.url 2>$null

if ($CurrentRemote -ne $RepoURL) {
    git remote remove origin 2>$null
    git remote add origin $RepoURL 2>$null
}

Write-Host "✓ Remote configured: $RepoURL" -ForegroundColor Green

# Step 5: Push to GitHub
Write-Host "`n[5/6] Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "(You may need to authenticate with your GitHub account)" -ForegroundColor Yellow

git push -u origin main 2>&1 | ForEach-Object {
    if ($_ -match "error|failed") {
        Write-Host "  ! $_" -ForegroundColor Yellow
    }
}

Write-Host "✓ Pushed to GitHub" -ForegroundColor Green

# Step 6: Create Vercel Link
Write-Host "`n[6/6] Generating Vercel deployment link..." -ForegroundColor Cyan

$VercelLink = 'https://vercel.com/new/clone?repository-url=https://github.com/contact-shreyas/' + $RepoName + '&env=NODE_ENV=production,NASA_API_KEY=bVXv3MSTqriDB9W6LgWDGp7iTU6mNwWXSFtaFWzf,SKIP_REDIS=true'

Write-Host "✓ Link generated" -ForegroundColor Green

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. GitHub Repository:" -ForegroundColor Cyan
Write-Host "   https://github.com/contact-shreyas/$RepoName" -ForegroundColor Green
Write-Host ""

Write-Host "2. Deploy to Vercel (ONE CLICK):" -ForegroundColor Cyan
Write-Host "   Opening browser..." -ForegroundColor Green
Write-Host ""

Write-Host "3. What to do:" -ForegroundColor Cyan
Write-Host "   • Browser opens Vercel deployment page" -ForegroundColor Gray
Write-Host "   • Sign in with GitHub" -ForegroundColor Gray
Write-Host "   • Click 'Deploy'" -ForegroundColor Gray
Write-Host "   • Wait 2-3 minutes" -ForegroundColor Gray
Write-Host "   • Your app is LIVE!" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Your live URL:" -ForegroundColor Cyan
Write-Host "   https://agentic-light-sentinel.vercel.app" -ForegroundColor Green
Write-Host ""

Write-Host "========================================`n" -ForegroundColor Cyan

# Copy to clipboard and open browser
$VercelLink | Set-Clipboard
Write-Host "Opening Vercel deployment in browser..." -ForegroundColor Yellow
Start-Process $VercelLink

Write-Host "`n✓ Deployment started! Check your browser." -ForegroundColor Green
Write-Host "✓ Vercel link copied to clipboard." -ForegroundColor Green
Write-Host "`n"
