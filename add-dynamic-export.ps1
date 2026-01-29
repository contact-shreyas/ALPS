# Add dynamic export to all API routes
$apiRoutes = Get-ChildItem -Path "c:\transfer\agentic-light-sentinel-master\src\app\api" -Filter "route.ts" -Recurse

foreach ($file in $apiRoutes) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has dynamic export
    if ($content -match "export const dynamic") {
        Write-Host "Skipping (already has dynamic export): $($file.FullName)"
        continue
    }
    
    # Skip auth route (handled by NextAuth)
    if ($file.FullName -match "\\auth\\") {
        Write-Host "Skipping (auth route): $($file.FullName)"
        continue
    }
    
    # Find first export function or export async function
    if ($content -match "(export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH))") {
        # Add dynamic export before the first export function
        $newContent = $content -replace "(export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH))", "export const dynamic = 'force-dynamic';`n`n`$1"
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Added dynamic export: $($file.FullName)"
    } else {
        Write-Host "No export function found: $($file.FullName)"
    }
}

Write-Host ""
Write-Host "Done! All API routes updated."
