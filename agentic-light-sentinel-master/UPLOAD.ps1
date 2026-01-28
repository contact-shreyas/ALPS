#!/usr/bin/env pwsh
# Simple GitHub Upload - Just paste your token when prompted

param(
    [Parameter(Mandatory=$false)]
    [string]$Token
)

Clear-Host
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                                                            " -ForegroundColor Cyan
Write-Host "     AGENTIC LIGHT SENTINEL - GITHUB UPLOAD                 " -ForegroundColor Cyan
Write-Host "                                                            " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Repository info
$owner = "contact-shreyas"
$repo = "agentic-light-sentinel"
$description = "Agentic Light Pollution Sentinel - Autonomous monitoring system for light pollution across India using satellite data, ML, and multi-agent RL"

Write-Host "Repository: $owner/$repo" -ForegroundColor Green
Write-Host "Visibility: Private" -ForegroundColor Yellow
Write-Host ""

# Get token if not provided
if (-not $Token) {
    Write-Host "============================================================" -ForegroundColor DarkGray
    Write-Host "  STEP 1: Get Your GitHub Token" -ForegroundColor White
    Write-Host "============================================================" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  1. Click this link: " -NoNewline
    Write-Host "https://github.com/settings/tokens/new" -ForegroundColor Cyan
    Write-Host "  2. Note: 'ALPS Upload Token'" -ForegroundColor Gray
    Write-Host "  3. Check: [X] repo (Full control)" -ForegroundColor Gray
    Write-Host "  4. Click: Generate token" -ForegroundColor Gray
    Write-Host "  5. Copy the token (starts with 'ghp_')" -ForegroundColor Gray
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor DarkGray
    Write-Host ""
    $Token = Read-Host "Paste your GitHub token here"
}

if (-not $Token -or $Token.Trim() -eq "") {
    Write-Host ""
    Write-Host "[X] No token provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host "  STEP 2: Creating Repository" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host ""

# GitHub API call
$headers = @{
    'Authorization' = "Bearer $Token"
    'Accept' = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
}

$body = @{
    name = $repo
    description = $description
    private = $true
    auto_init = $false
} | ConvertTo-Json

try {
    Write-Host "Creating private repository..." -NoNewline
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host " [OK]" -ForegroundColor Green
    Write-Host "Repository created: $($response.html_url)" -ForegroundColor Cyan
    $repoExists = $true
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host " (already exists)" -ForegroundColor Yellow
        $repoExists = $true
    } else {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*403*") {
            Write-Host ""
            Write-Host "Authentication failed. Please check:" -ForegroundColor Yellow
            Write-Host "  - Token is correct and starts with 'ghp_'" -ForegroundColor Gray
            Write-Host "  - Token has 'repo' scope enabled" -ForegroundColor Gray
            Write-Host ""
        }
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host "  STEP 3: Pushing Code to GitHub" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host ""

# Configure git credential
git config credential.helper store

# Push using token
Write-Host "Pushing to https://github.com/$owner/$repo.git ..." -ForegroundColor Gray
Write-Host ""

$pushUrl = "https://$($owner):$($Token)@github.com/$owner/$repo.git"

try {
    # Remove old remote and add new with token
    git remote remove origin 2>$null
    git remote add origin $pushUrl
    
    # Push
    $output = git push -u origin master 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host "                                                            " -ForegroundColor Green
        Write-Host "                    [SUCCESS!]                              " -ForegroundColor Green
        Write-Host "                                                            " -ForegroundColor Green
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your repository is now live at:" -ForegroundColor White
        Write-Host "  https://github.com/$owner/$repo" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  - Visit your repository to verify all files" -ForegroundColor Gray
        Write-Host "  - Update README.md with project details" -ForegroundColor Gray
        Write-Host "  - Add collaborators if needed (Settings -> Collaborators)" -ForegroundColor Gray
        Write-Host ""
        
        # Update remote URL without token
        git remote set-url origin "https://github.com/$owner/$repo.git"
        
    } else {
        Write-Host ""
        Write-Host "[X] Push failed" -ForegroundColor Red
        Write-Host "$output" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "[X] Error during push: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
