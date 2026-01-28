# GitHub Repository Setup Script
# This script creates a private repository and pushes your code

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Repository Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Repository details
$repoOwner = "contact-shreyas"
$repoName = "agentic-light-sentinel"
$repoDescription = "Agentic Light Pollution Sentinel - Autonomous monitoring system for light pollution across India using satellite data, ML, and multi-agent RL"

Write-Host "Repository: $repoOwner/$repoName" -ForegroundColor Green
Write-Host "Owner: $repoOwner" -ForegroundColor Green
Write-Host ""

# Get GitHub Personal Access Token
Write-Host "Please enter your GitHub Personal Access Token (PAT):" -ForegroundColor Yellow
Write-Host ""
Write-Host "Don't have a token? Create one here:" -ForegroundColor Gray
Write-Host "  https://github.com/settings/tokens/new?scopes=repo&description=ALPS-Upload" -ForegroundColor Cyan
Write-Host ""
Write-Host "Required scope: 'repo' (Full control of private repositories)" -ForegroundColor Gray
Write-Host "After creating, copy the token and paste it below." -ForegroundColor Gray
Write-Host ""
$plainToken = Read-Host "Enter your GitHub PAT"

# Create repository using GitHub API
Write-Host ""
Write-Host "Creating private repository on GitHub..." -ForegroundColor Yellow

$headers = @{
    'Authorization' = "token $plainToken"
    'Accept' = 'application/vnd.github.v3+json'
    'User-Agent' = 'PowerShell'
}

$body = @{
    name = $repoName
    description = $repoDescription
    private = $true
    auto_init = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✓ Repository created successfully!" -ForegroundColor Green
    Write-Host "  URL: $($response.html_url)" -ForegroundColor Cyan
    Write-Host ""
    
    # Configure git remote (remove if exists, then add)
    Write-Host "Configuring git remote..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin "https://github.com/$repoOwner/$repoName.git"
    Write-Host "✓ Remote configured" -ForegroundColor Green
    Write-Host ""
    
    # Push to GitHub
    Write-Host "Pushing code to GitHub..." -ForegroundColor Yellow
    Write-Host "Branch: master" -ForegroundColor Gray
    
    # Set up credential helper for this push
    $env:GIT_ASKPASS = "echo"
    $credentials = "$repoOwner`:$plainToken"
    $encodedCreds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($credentials))
    
    # Push using token authentication
    git -c http.extraheader="AUTHORIZATION: basic $encodedCreds" push -u origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ SUCCESS! Project uploaded to GitHub" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Repository URL: https://github.com/$repoOwner/$repoName" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Visit: https://github.com/$repoOwner/$repoName" -ForegroundColor White
        Write-Host "  2. Verify all files are uploaded" -ForegroundColor White
        Write-Host "  3. Update README.md if needed" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Push failed. Please check your credentials and try again." -ForegroundColor Red
        Write-Host ""
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Message -like "*401*") {
        Write-Host "Authentication failed. Please check your Personal Access Token." -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*422*") {
        Write-Host "Repository 'contact-shreyas/agentic-light-sentinel' may already exist." -ForegroundColor Yellow
        Write-Host "Attempting to push to existing repository..." -ForegroundColor Yellow
        Write-Host ""
        
        # Try to push to existing repo
        $credentials = "$repoOwner`:$plainToken"
        $encodedCreds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($credentials))
        git -c http.extraheader="AUTHORIZATION: basic $encodedCreds" push -u origin master
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Code pushed to existing repository!" -ForegroundColor Green
            Write-Host "Repository URL: https://github.com/$repoOwner/$repoName" -ForegroundColor Cyan
        }
    }
    Write-Host ""
}

# Clean up sensitive data
$plainToken = $null
[System.GC]::Collect()

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
