Write-Host "Testing login..." -ForegroundColor Green

try {
    $body = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "https://mixxstorepos-backend.onrender.com/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "SUCCESS: Login worked!" -ForegroundColor Green
    Write-Host "Username: $($response.username)" -ForegroundColor White
    Write-Host "Role: $($response.role)" -ForegroundColor White
    Write-Host "Token length: $($response.token.Length)" -ForegroundColor White
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
} 