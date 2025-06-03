package com.webthanhtoan.backend.controller;

import com.webthanhtoan.backend.dto.JwtResponse;
import com.webthanhtoan.backend.dto.LoginRequest;
import com.webthanhtoan.backend.entity.User;
import com.webthanhtoan.backend.repository.UserRepository;
import com.webthanhtoan.backend.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600, allowCredentials = "false", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        System.out.println("=== LOGIN REQUEST RECEIVED ===");
        System.out.println("Username: " + loginRequest.getUsername());
        System.out.println("Password length: " + (loginRequest.getPassword() != null ? loginRequest.getPassword().length() : "null"));
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = (User) authentication.getPrincipal();
            
            System.out.println("Login successful for user: " + user.getUsername());

            return ResponseEntity.ok(new JwtResponse(jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole()));
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Tên đăng nhập hoặc mật khẩu không đúng");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @RequestMapping(value = "/login", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User signUpRequest) {
        Map<String, String> response = new HashMap<>();

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            response.put("message", "Tên đăng nhập đã tồn tại!");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            response.put("message", "Email đã được sử dụng!");
            return ResponseEntity.badRequest().body(response);
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getFullName(),
                encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        response.put("message", "Đăng ký thành công!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) authentication.getPrincipal();
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("role", user.getRole());

        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/test/users")
    public ResponseEntity<?> testUsers() {
        Map<String, Object> response = new HashMap<>();
        
        // Đếm số lượng users
        long userCount = userRepository.count();
        response.put("totalUsers", userCount);
        
        // Lấy danh sách username
        var users = userRepository.findAll();
        var usernames = users.stream()
            .map(user -> Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole(),
                "isActive", user.getIsActive()
            ))
            .toList();
        response.put("users", usernames);
        
        // Test password encoding
        String testPassword = "admin123";
        String encodedPassword = encoder.encode(testPassword);
        boolean matches = encoder.matches(testPassword, encodedPassword);
        
        response.put("passwordTest", Map.of(
            "originalPassword", testPassword,
            "encodedPassword", encodedPassword,
            "matches", matches
        ));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test/login")
    public ResponseEntity<?> testLogin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Tìm user
            var userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                response.put("error", "User not found");
                response.put("username", username);
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOpt.get();
            response.put("userFound", true);
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("isActive", user.getIsActive());
            
            // Test password
            boolean passwordMatches = encoder.matches(password, user.getPassword());
            response.put("passwordMatches", passwordMatches);
            response.put("storedPasswordLength", user.getPassword().length());
            response.put("inputPassword", password);
            
            if (passwordMatches) {
                response.put("message", "Login would succeed");
            } else {
                response.put("message", "Password does not match");
            }
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}