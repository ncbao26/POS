# Test CORS and Method Support
$backendUrl = "https://mixxstorepos-backend.onrender.com"

Write-Host "=== TESTING CORS AND METHOD SUPPORT ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: OPTIONS preflight request
Write-Host "1. Testing OPTIONS preflight request..." -ForegroundColor Green
try {
    $headers = @{
        'Origin' = 'https://mixxstorepos-frontend.onrender.com'
        'Access-Control-Request-Method' = 'POST'
        'Access-Control-Request-Headers' = 'Content-Type'
    }
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/auth/login" -Method OPTIONS -Headers $headers -UseBasicParsing
    Write-Host "✅ OPTIONS Status: $($response.StatusCode)" -ForegroundColor Green
    
    $corsHeaders = $response.Headers | Where-Object { $_.Key -like "*Access-Control*" }
    if ($corsHeaders) {
        Write-Host "   CORS Headers found:" -ForegroundColor Yellow
        foreach ($header in $corsHeaders) {
            Write-Host "   - $($header.Key): $($header.Value)" -ForegroundColor White
        }
    } else {
        Write-Host "   ❌ No CORS headers found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ OPTIONS Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: POST without CORS headers
Write-Host "2. Testing POST without CORS headers..." -ForegroundColor Green
try {
    $body = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ POST Success: $($response.username)" -ForegroundColor Green
} catch {
    $statusCode = $null
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    Write-Host "❌ POST Failed: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    
    if ($statusCode -eq 405) {
        Write-Host "   → Method Not Allowed - CORS issue!" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400) {
        Write-Host "   → Bad Request - Authentication issue" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 3: POST with CORS headers
Write-Host "3. Testing POST with CORS headers..." -ForegroundColor Green
try {
    $headers = @{
        'Origin' = 'https://mixxstorepos-frontend.onrender.com'
        'Content-Type' = 'application/json'
    }
    
    $body = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body $body -Headers $headers
    Write-Host "✅ POST with CORS Success: $($response.username)" -ForegroundColor Green
} catch {
    $statusCode = $null
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    Write-Host "❌ POST with CORS Failed: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check allowed methods
Write-Host "4. Testing allowed methods..." -ForegroundColor Green
$methods = @("GET", "POST", "PUT", "DELETE", "OPTIONS")
foreach ($method in $methods) {
    try {
        if ($method -eq "GET") {
            $response = Invoke-WebRequest -Uri "$backendUrl/api/auth/test/users" -Method $method -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri "$backendUrl/api/auth/login" -Method $method -UseBasicParsing
        }
        Write-Host "   ✅ ${method}: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        if ($statusCode -eq 405) {
            Write-Host "   ❌ ${method}: Method Not Allowed" -ForegroundColor Red
        } else {
            Write-Host "   ⚠️ ${method}: $statusCode (other error)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== RECOMMENDATIONS ===" -ForegroundColor Cyan
Write-Host "Nếu vẫn có lỗi 405:" -ForegroundColor Yellow
Write-Host "1. Redeploy backend với CORS config mới" -ForegroundColor White
Write-Host "2. Kiểm tra frontend gửi đúng Content-Type" -ForegroundColor White
Write-Host "3. Kiểm tra Render proxy settings" -ForegroundColor White 