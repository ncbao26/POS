Write-Host "🔍 Checking Render Deployment Readiness..." -ForegroundColor Blue
Write-Host "==============================================" -ForegroundColor Blue

$passed = 0
$failed = 0

Write-Host ""
Write-Host "📁 Checking Project Structure..." -ForegroundColor Cyan

# Check essential files
$files = @("package.json", "Dockerfile", "nginx.conf", "backend/Dockerfile", "backend/pom.xml", "docker-compose.yml", "README.md")

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $failed++
    }
}

# Check directories
$directories = @("src", "backend/src", "public")

foreach ($dir in $directories) {
    if (Test-Path $dir -PathType Container) {
        Write-Host "✅ $dir/ directory exists" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ $dir/ directory missing" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 Project is ready for Render deployment!" -ForegroundColor Green
    Write-Host "📖 Follow RENDER_DOCKER_DEPLOY.md for instructions" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Please fix the missing files/directories above" -ForegroundColor Red
}

Write-Host "" 