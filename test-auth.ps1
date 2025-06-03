# Test Authentication Script
# Kiểm tra authentication và password encoding

$backendUrl = "https://mixxstorepos-backend.onrender.com"

Write-Host "=== MIXXSTORE POS AUTHENTICATION TEST ===" -ForegroundColor Cyan
Write-Host "Backend URL: $backendUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Green
try {
    $healthResponse = Invoke-RestMethod -Uri "$backendUrl/actuator/health" -Method GET
    Write-Host "✅ Health Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "   Database Status: $($healthResponse.components.db.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Check Users in Database
Write-Host "2. Testing Users in Database..." -ForegroundColor Green
try {
    $usersResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/test/users" -Method GET
    Write-Host "✅ Total Users: $($usersResponse.totalUsers)" -ForegroundColor Green
    
    if ($usersResponse.users.Count -gt 0) {
        Write-Host "   Available Users:" -ForegroundColor Yellow
        foreach ($user in $usersResponse.users) {
            Write-Host "   - $($user.username) ($($user.fullName)) - Role: $($user.role)" -ForegroundColor White
        }
    } else {
        Write-Host "❌ No users found in database!" -ForegroundColor Red
    }
    
    Write-Host "   Password Test - Matches: $($usersResponse.passwordTest.matches)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Users Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Test Login with admin user
Write-Host "3. Testing Login with admin/admin123..." -ForegroundColor Green
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host "   Username: $($loginResponse.username)" -ForegroundColor White
    Write-Host "   Full Name: $($loginResponse.fullName)" -ForegroundColor White
    Write-Host "   Role: $($loginResponse.role)" -ForegroundColor White
    Write-Host "   Token Length: $($loginResponse.token.Length)" -ForegroundColor White
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Test detailed login
    Write-Host "   Testing detailed login..." -ForegroundColor Yellow
    try {
        $testLoginBody = @{
            username = "admin"
            password = "admin123"
        } | ConvertTo-Json

        $testResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/test/login" -Method POST -Body $testLoginBody -ContentType "application/json"
        Write-Host "   User Found: $($testResponse.userFound)" -ForegroundColor White
        Write-Host "   Password Matches: $($testResponse.passwordMatches)" -ForegroundColor White
        Write-Host "   Message: $($testResponse.message)" -ForegroundColor White
    } catch {
        Write-Host "   Detailed test also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Test with mixxstore user
Write-Host "4. Testing Login with mixxstore/admin123..." -ForegroundColor Green
try {
    $loginBody = @{
        username = "mixxstore"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ MixxStore Login Successful!" -ForegroundColor Green
    Write-Host "   Username: $($loginResponse.username)" -ForegroundColor White
    Write-Host "   Full Name: $($loginResponse.fullName)" -ForegroundColor White
    Write-Host "   Role: $($loginResponse.role)" -ForegroundColor White
} catch {
    Write-Host "❌ MixxStore Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Test wrong password
Write-Host "5. Testing Wrong Password..." -ForegroundColor Green
try {
    $loginBody = @{
        username = "admin"
        password = "wrongpassword"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "❌ Wrong password should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✅ Wrong password correctly rejected" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nếu login vẫn lỗi, hãy kiểm tra:" -ForegroundColor Yellow
Write-Host "1. Backend logs trên Render dashboard" -ForegroundColor White
Write-Host "2. Environment variables (JWT_SECRET, DATABASE_URL)" -ForegroundColor White
Write-Host "3. Database connection" -ForegroundColor White
Write-Host "4. CORS settings" -ForegroundColor White 