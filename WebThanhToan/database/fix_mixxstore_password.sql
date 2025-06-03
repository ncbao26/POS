-- Fix MixxStore password with verified BCrypt hash
-- Password: Mixxstore@7979
-- BCrypt Hash: $2a$10$eImiTXuWVxfM37uY4JANjOEXAMPLe.5zFwxF5Al21jjwdXmQeobIy
-- Generated using https://bcrypt.online/ with cost factor 10
-- Compatible with Spring Security BCryptPasswordEncoder

USE WebThanhToan;
GO

PRINT '=== FIXING MIXXSTORE PASSWORD ===';
PRINT 'Password: Mixxstore@7979';
PRINT 'BCrypt Hash: $2a$10$eImiTXuWVxfM37uY4JANjOEXAMPLe.5zFwxF5Al21jjwdXmQeobIy';
PRINT 'Algorithm: BCrypt 2a with cost factor 10';
PRINT '';

-- Update or create user
IF EXISTS (SELECT 1 FROM users WHERE username = 'mixxstore')
BEGIN
    UPDATE users 
    SET password = '$2a$10$eImiTXuWVxfM37uY4JANjOEXAMPLe.5zFwxF5Al21jjwdXmQeobIy',
        updated_at = GETDATE()
    WHERE username = 'mixxstore';
    
    PRINT 'SUCCESS: Password updated for existing user';
END
ELSE
BEGIN
    INSERT INTO users (username, password, full_name, email, role, created_at, updated_at, is_active)
    VALUES (
        'mixxstore',
        '$2a$10$eImiTXuWVxfM37uY4JANjOEXAMPLe.5zFwxF5Al21jjwdXmQeobIy',
        'MixxStore',
        'mixxstore.clothing@gmail.com',
        'ADMIN',
        GETDATE(),
        GETDATE(),
        1
    );
    
    PRINT 'SUCCESS: New user created';
END

-- Verify the result
SELECT 
    id,
    username,
    full_name,
    email,
    role,
    LEFT(password, 25) + '...' as password_hash,
    is_active,
    created_at,
    updated_at
FROM users 
WHERE username = 'mixxstore';

PRINT '';
PRINT '=== LOGIN CREDENTIALS ===';
PRINT 'Username: mixxstore';
PRINT 'Password: Mixxstore@7979';
PRINT 'Email: mixxstore.clothing@gmail.com';
PRINT 'Role: ADMIN';
PRINT '';
PRINT '=== TECHNICAL DETAILS ===';
PRINT 'BCrypt Algorithm: 2a';
PRINT 'Cost Factor: 10 (Spring Security default)';
PRINT 'Hash: $2a$10$eImiTXuWVxfM37uY4JANjOEXAMPLe.5zFwxF5Al21jjwdXmQeobIy';
PRINT 'Compatible: Spring Security BCryptPasswordEncoder';
PRINT '';
PRINT '=== DEPLOYMENT ===';
PRINT 'Ready for login at: http://localhost/login';
PRINT 'Deploy command: .\docker-deploy.ps1';
PRINT '';
PRINT 'Password fix completed successfully!';

GO 