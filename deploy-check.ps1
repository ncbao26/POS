# 🚀 Render Deployment Readiness Check Script (PowerShell)
# This script checks if your POS project is ready for Render deployment

Write-Host "🔍 Checking Render Deployment Readiness..." -ForegroundColor Blue
Write-Host "==============================================" -ForegroundColor Blue

# Initialize counters
$passed = 0
$failed = 0

# Check functions
function Check-File {
    param($FilePath)
    if (Test-Path $FilePath) {
        Write-Host "✅ $FilePath exists" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $FilePath missing" -ForegroundColor Red
        return $false
    }
}

function Check-Directory {
    param($DirPath)
    if (Test-Path $DirPath -PathType Container) {
        Write-Host "✅ $DirPath/ directory exists" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $DirPath/ directory missing" -ForegroundColor Red
        return $false
    }
}

Write-Host ""
Write-Host "📁 Checking Project Structure..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Check essential files
$files = @(
    "package.json",
    "Dockerfile",
    "nginx.conf",
    "backend/Dockerfile",
    "backend/pom.xml",
    "docker-compose.yml",
    "README.md",
    "RENDER_DOCKER_DEPLOY.md",
    "render-env-example.txt"
)

foreach ($file in $files) {
    if (Check-File $file) {
        $passed++
    } else {
        $failed++
    }
}

# Check directories
$directories = @(
    "src",
    "backend/src",
    "backend/src/main/java",
    "backend/src/main/resources",
    "public"
)

foreach ($dir in $directories) {
    if (Check-Directory $dir) {
        $passed++
    } else {
        $failed++
    }
}

Write-Host ""
Write-Host "🔧 Checking Configuration Files..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Check package.json content
if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    
    if ($packageContent -match "vite") {
        Write-Host "✅ Vite build tool configured" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ Vite not found in package.json" -ForegroundColor Red
        $failed++
    }
    
    if ($packageContent -match "react") {
        Write-Host "✅ React dependency found" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ React dependency missing" -ForegroundColor Red
        $failed++
    }
}

# Check Dockerfile content
if (Test-Path "Dockerfile") {
    $dockerfileContent = Get-Content "Dockerfile" -Raw
    
    if ($dockerfileContent -match "nginx") {
        Write-Host "✅ Frontend Dockerfile uses Nginx" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "⚠️ Frontend Dockerfile does not use Nginx" -ForegroundColor Yellow
    }
    
    if ($dockerfileContent -match "node:18") {
        Write-Host "✅ Frontend Dockerfile uses Node 18" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "⚠️ Frontend Dockerfile does not use Node 18" -ForegroundColor Yellow
    }
}

# Check backend Dockerfile
if (Test-Path "backend/Dockerfile") {
    $backendDockerContent = Get-Content "backend/Dockerfile" -Raw
    
    if ($backendDockerContent -match "openjdk:17") {
        Write-Host "✅ Backend Dockerfile uses OpenJDK 17" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "⚠️ Backend Dockerfile does not use OpenJDK 17" -ForegroundColor Yellow
    }
    
    if ($backendDockerContent -match "mvnw") {
        Write-Host "✅ Backend Dockerfile uses Maven wrapper" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ Backend Dockerfile missing Maven wrapper" -ForegroundColor Red
        $failed++
    }
}

# Check pom.xml
if (Test-Path "backend/pom.xml") {
    $pomContent = Get-Content "backend/pom.xml" -Raw
    
    if ($pomContent -match "spring-boot-starter-web") {
        Write-Host "✅ Spring Boot Web starter found" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ Spring Boot Web starter missing" -ForegroundColor Red
        $failed++
    }
    
    if ($pomContent -match "postgresql") {
        Write-Host "✅ PostgreSQL driver found" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ PostgreSQL driver missing" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "🌐 Checking Environment Configuration..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Check for environment files
if (Test-Path "render-env-example.txt") {
    Write-Host "✅ Environment variables example provided" -ForegroundColor Green
    $passed++
} else {
    Write-Host "⚠️ Environment variables example missing" -ForegroundColor Yellow
}

# Check for production config
if (Test-Path "backend/src/main/resources/application-production.yml") {
    Write-Host "✅ Production configuration found" -ForegroundColor Green
    $passed++
} else {
    Write-Host "⚠️ Production configuration missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Deployment Readiness Summary" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "✅ Passed checks: $passed" -ForegroundColor Green
Write-Host "❌ Failed checks: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 Your project is ready for Render deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Push your code to GitHub"
    Write-Host "2. Follow the RENDER_DOCKER_DEPLOY.md guide"
    Write-Host "3. Create PostgreSQL database on Render"
    Write-Host "4. Deploy backend service"
    Write-Host "5. Deploy frontend service"
    Write-Host "6. Configure environment variables"
    Write-Host ""
    Write-Host "📖 Read RENDER_DOCKER_DEPLOY.md for detailed instructions" -ForegroundColor Yellow
} elseif ($failed -le 3) {
    Write-Host ""
    Write-Host "⚠️ Your project has minor issues but should work" -ForegroundColor Yellow
    Write-Host "Please fix the failed checks above" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Your project needs significant fixes before deployment" -ForegroundColor Red
    Write-Host "Please address the failed checks above" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Useful Resources:" -ForegroundColor Cyan
Write-Host "• Render Documentation: https://render.com/docs"
Write-Host "• Docker Guide: https://render.com/docs/docker"
Write-Host "• PostgreSQL Guide: https://render.com/docs/databases"
Write-Host ""

# Return exit code based on failed checks
if ($failed -gt 0) {
    exit $failed
} else {
    exit 0
} 