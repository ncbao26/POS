package com.webthanhtoan.backend.controller;

import com.webthanhtoan.backend.entity.Customer;
import com.webthanhtoan.backend.entity.Product;
import com.webthanhtoan.backend.entity.User;
import com.webthanhtoan.backend.repository.CustomerRepository;
import com.webthanhtoan.backend.repository.ProductRepository;
import com.webthanhtoan.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin(origins = "*", maxAge = 3600, allowCredentials = "false")
@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/db-status")
    public ResponseEntity<Map<String, Object>> checkDatabaseStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            // Check users
            List<User> users = userRepository.findAll();
            status.put("users_count", users.size());
            status.put("users", users.stream().map(u -> Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail()
            )).toList());
            
            // Check products
            List<Product> products = productRepository.findAll();
            status.put("products_count", products.size());
            
            // Check customers
            List<Customer> customers = customerRepository.findAll();
            status.put("customers_count", customers.size());
            
            status.put("status", "OK");
            status.put("message", "Database connection successful");
            
        } catch (Exception e) {
            status.put("status", "ERROR");
            status.put("message", e.getMessage());
            status.put("error", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(status);
    }

    @PostMapping("/create-sample-data")
    public ResponseEntity<Map<String, Object>> createSampleData(Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Create sample products
            if (productRepository.findByUserAndIsActiveTrue(currentUser).isEmpty()) {
                Product product1 = new Product();
                product1.setName("Laptop Dell XPS 13");
                product1.setDescription("Laptop cao cấp cho doanh nhân");
                product1.setCostPrice(new BigDecimal("15000000"));
                product1.setPrice(new BigDecimal("20000000"));
                product1.setStock(10);
                product1.setUser(currentUser);
                productRepository.save(product1);
                
                Product product2 = new Product();
                product2.setName("iPhone 15 Pro");
                product2.setDescription("Điện thoại thông minh mới nhất");
                product2.setCostPrice(new BigDecimal("25000000"));
                product2.setPrice(new BigDecimal("30000000"));
                product2.setStock(5);
                product2.setUser(currentUser);
                productRepository.save(product2);
                
                Product product3 = new Product();
                product3.setName("AirPods Pro");
                product3.setDescription("Tai nghe không dây chống ồn");
                product3.setCostPrice(new BigDecimal("4000000"));
                product3.setPrice(new BigDecimal("6000000"));
                product3.setStock(20);
                product3.setUser(currentUser);
                productRepository.save(product3);
                
                result.put("products_created", 3);
            } else {
                result.put("products_created", 0);
                result.put("products_message", "Products already exist for this user");
            }
            
            // Create sample customers
            if (customerRepository.findByUser(currentUser).isEmpty()) {
                Customer customer1 = new Customer();
                customer1.setName("Nguyễn Văn A");
                customer1.setPhone("0901234567");
                customer1.setEmail("nguyenvana@email.com");
                customer1.setAddress("123 Đường ABC, Quận 1, TP.HCM");
                customer1.setUser(currentUser);
                customerRepository.save(customer1);
                
                Customer customer2 = new Customer();
                customer2.setName("Trần Thị B");
                customer2.setPhone("0987654321");
                customer2.setEmail("tranthib@email.com");
                customer2.setAddress("456 Đường XYZ, Quận 2, TP.HCM");
                customer2.setUser(currentUser);
                customerRepository.save(customer2);
                
                result.put("customers_created", 2);
            } else {
                result.put("customers_created", 0);
                result.put("customers_message", "Customers already exist for this user");
            }
            
            result.put("status", "SUCCESS");
            result.put("user", Map.of(
                "id", currentUser.getId(),
                "username", currentUser.getUsername(),
                "email", currentUser.getEmail()
            ));
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
            result.put("error", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/create-test-user")
    public ResponseEntity<Map<String, Object>> createTestUser(@RequestBody Map<String, String> request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String fullName = request.get("fullName");
            
            if (userRepository.existsByUsername(username)) {
                result.put("status", "ERROR");
                result.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(result);
            }
            
            if (userRepository.existsByEmail(email)) {
                result.put("status", "ERROR");
                result.put("message", "Email already exists");
                return ResponseEntity.badRequest().body(result);
            }
            
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(User.Role.USER);
            
            User savedUser = userRepository.save(user);
            
            result.put("status", "SUCCESS");
            result.put("message", "User created successfully");
            result.put("user", Map.of(
                "id", savedUser.getId(),
                "username", savedUser.getUsername(),
                "email", savedUser.getEmail(),
                "fullName", savedUser.getFullName()
            ));
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
            result.put("error", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/auth-test")
    public ResponseEntity<Map<String, Object>> testAuthentication(Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (authentication == null) {
                result.put("status", "ERROR");
                result.put("message", "No authentication found");
                return ResponseEntity.status(401).body(result);
            }
            
            if (!authentication.isAuthenticated()) {
                result.put("status", "ERROR");
                result.put("message", "Authentication not valid");
                return ResponseEntity.status(401).body(result);
            }
            
            User currentUser = (User) authentication.getPrincipal();
            result.put("status", "SUCCESS");
            result.put("message", "Authentication successful");
            result.put("user", Map.of(
                "id", currentUser.getId(),
                "username", currentUser.getUsername(),
                "email", currentUser.getEmail(),
                "fullName", currentUser.getFullName(),
                "role", currentUser.getRole()
            ));
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
            result.put("error", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/jwt-debug")
    public ResponseEntity<Map<String, Object>> debugJwt(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String authHeader = request.getHeader("Authorization");
            result.put("authHeader", authHeader);
            result.put("hasAuthHeader", authHeader != null);
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                result.put("tokenLength", token.length());
                result.put("tokenPreview", token.substring(0, Math.min(50, token.length())) + "...");
                result.put("hasToken", true);
            } else {
                result.put("hasToken", false);
            }
            
            result.put("requestURI", request.getRequestURI());
            result.put("method", request.getMethod());
            result.put("status", "SUCCESS");
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/products-test")
    public ResponseEntity<Map<String, Object>> testProducts(Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (authentication == null) {
                result.put("status", "ERROR");
                result.put("message", "No authentication found");
                return ResponseEntity.status(401).body(result);
            }
            
            User currentUser = (User) authentication.getPrincipal();
            result.put("currentUser", Map.of(
                "id", currentUser.getId(),
                "username", currentUser.getUsername()
            ));
            
            // Test repository call
            List<Product> products = productRepository.findByUserAndIsActiveTrue(currentUser);
            result.put("productsCount", products.size());
            result.put("products", products.stream().map(p -> Map.of(
                "id", p.getId(),
                "name", p.getName(),
                "price", p.getPrice(),
                "stock", p.getStock(),
                "userId", p.getUser() != null ? p.getUser().getId() : null
            )).toList());
            
            result.put("status", "SUCCESS");
            result.put("message", "Products test successful");
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
            result.put("error", e.getClass().getSimpleName());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(result);
    }
} 