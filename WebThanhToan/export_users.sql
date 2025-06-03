-- Script để export users từ SQL Server
-- Chạy script này trong SQL Server Management Studio

SELECT 
    'createUserIfNotExists("' + username + '", "' + email + '", "' + full_name + '", "' + 'newpassword123' + '", User.Role.' + 
    CASE 
        WHEN role = 0 THEN 'USER'
        WHEN role = 1 THEN 'ADMIN'
        ELSE 'USER'
    END + ');'
FROM users
WHERE username != 'admin'  -- Bỏ qua admin vì đã có sẵn
ORDER BY username;

-- Kết quả sẽ là các dòng Java code như:
-- createUserIfNotExists("user1", "user1@example.com", "User One", "newpassword123", User.Role.USER);
-- createUserIfNotExists("user2", "user2@example.com", "User Two", "newpassword123", User.Role.ADMIN);

-- Copy kết quả và paste vào DataInitializer.java 