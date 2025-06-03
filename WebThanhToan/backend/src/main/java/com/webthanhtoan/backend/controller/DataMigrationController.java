package com.webthanhtoan.backend.controller;

import com.webthanhtoan.backend.entity.User;
import com.webthanhtoan.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/migration")
@PreAuthorize("hasRole('ADMIN')")
public class DataMigrationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/export-users")
    public ResponseEntity<?> exportUsers() {
        try {
            List<User> users = userRepository.findAll();
            
            // Convert to export format
            List<Map<String, Object>> exportData = users.stream().map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("username", user.getUsername());
                userData.put("email", user.getEmail());
                userData.put("fullName", user.getFullName());
                userData.put("role", user.getRole().toString());
                // Không export password vì lý do bảo mật
                return userData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error exporting users: " + e.getMessage());
        }
    }

    @PostMapping("/import-users")
    public ResponseEntity<?> importUsers(@RequestBody List<Map<String, Object>> usersData) {
        try {
            int imported = 0;
            int skipped = 0;
            
            for (Map<String, Object> userData : usersData) {
                String username = (String) userData.get("username");
                
                if (!userRepository.existsByUsername(username)) {
                    User user = new User();
                    user.setUsername(username);
                    user.setEmail((String) userData.get("email"));
                    user.setFullName((String) userData.get("fullName"));
                    user.setPassword(passwordEncoder.encode("defaultpassword123")); // Default password
                    user.setRole(User.Role.valueOf((String) userData.get("role")));
                    
                    userRepository.save(user);
                    imported++;
                } else {
                    skipped++;
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("imported", imported);
            result.put("skipped", skipped);
            result.put("message", "Import completed successfully");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error importing users: " + e.getMessage());
        }
    }

    @GetMapping("/generate-datainitializer")
    public ResponseEntity<?> generateDataInitializerCode() {
        try {
            List<User> users = userRepository.findAll();
            
            StringBuilder code = new StringBuilder();
            code.append("// Generated DataInitializer code for users\n");
            
            for (User user : users) {
                if (!"admin".equals(user.getUsername())) { // Skip admin user
                    code.append(String.format(
                        "createUserIfNotExists(\"%s\", \"%s\", \"%s\", \"defaultpassword123\", User.Role.%s);\n",
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole().toString()
                    ));
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", code.toString());
            result.put("instructions", "Copy this code and paste it into DataInitializer.java");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating code: " + e.getMessage());
        }
    }
} 