$users = @(
    @{ username = "admin"; password = "admin123" },
    @{ username = "mixxstore"; password = "admin123" },
    @{ username = "manager"; password = "admin123" },
    @{ username = "cashier1"; password = "admin123" }
)

foreach ($user in $users) {
    Write-Host "Testing $($user.username)..." -ForegroundColor Yellow
    
    try {
        $body = $user | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "https://mixxstorepos-backend.onrender.com/api/auth/login" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "✅ SUCCESS: $($user.username)" -ForegroundColor Green
        Write-Host "   Full Name: $($response.fullName)" -ForegroundColor White
        Write-Host "   Role: $($response.role)" -ForegroundColor White
        break
        
    } catch {
        Write-Host "❌ FAILED: $($user.username) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Nếu tất cả đều fail, có thể:" -ForegroundColor Yellow
Write-Host "1. Database chưa có users (DataInitializer chưa chạy)" -ForegroundColor White
Write-Host "2. Backend cần redeploy với config mới" -ForegroundColor White
Write-Host "3. Database bị reset do ddl-auto: create-drop" -ForegroundColor White 