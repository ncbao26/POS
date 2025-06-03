package com.webthanhtoan.backend.config;

import com.webthanhtoan.backend.entity.User;
import com.webthanhtoan.backend.entity.Product;
import com.webthanhtoan.backend.repository.UserRepository;
import com.webthanhtoan.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tạo user admin mặc định
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@webthanhtoan.com");
            admin.setFullName("Administrator");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Created default admin user: admin/admin123");
        }

        // Tạo các users từ SQL Server
        createUserIfNotExists("manager", "manager@webthanhtoan.com", "Quản lý cửa hàng", "admin123", User.Role.USER);
        createUserIfNotExists("cashier1", "cashier1@webthanhtoan.com", "Thu ngân 1", "admin123", User.Role.USER);
        createUserIfNotExists("cashier2", "cashier2@webthanhtoan.com", "Thu ngân 2", "admin123", User.Role.USER);
        createUserIfNotExists("mixxstore", "mixxstore.clothing@gmail.com", "MixxStore", "admin123", User.Role.ADMIN);
        createUserIfNotExists("user1", "user1@example.com", "User One", "admin123", User.Role.USER);
        createUserIfNotExists("user2", "user2@example.com", "User Two", "admin123", User.Role.USER);
        
        // Admin user đã được tạo ở trên

        // Tạo một số sản phẩm mẫu
        if (productRepository.count() == 0) {
            Product[] sampleProducts = {
                new Product("Laptop Dell XPS 13", "Laptop cao cấp với màn hình 13 inch", new BigDecimal("20000000"), new BigDecimal("25000000"), 10),
                new Product("iPhone 15 Pro", "Điện thoại thông minh mới nhất của Apple", new BigDecimal("25000000"), new BigDecimal("30000000"), 5),
                new Product("Samsung Galaxy S24", "Flagship Android với camera AI", new BigDecimal("18000000"), new BigDecimal("22000000"), 8),
                new Product("MacBook Air M2", "Laptop Apple với chip M2 mạnh mẽ", new BigDecimal("23000000"), new BigDecimal("28000000"), 3),
                new Product("iPad Pro 12.9", "Máy tính bảng chuyên nghiệp", new BigDecimal("16000000"), new BigDecimal("20000000"), 7),
                new Product("AirPods Pro", "Tai nghe không dây chống ồn", new BigDecimal("4500000"), new BigDecimal("6000000"), 15),
                new Product("Apple Watch Series 9", "Đồng hồ thông minh mới nhất", new BigDecimal("8000000"), new BigDecimal("10000000"), 12),
                new Product("Sony WH-1000XM5", "Tai nghe chống ồn cao cấp", new BigDecimal("6000000"), new BigDecimal("8000000"), 6),
                new Product("Nintendo Switch OLED", "Máy chơi game cầm tay", new BigDecimal("6500000"), new BigDecimal("8500000"), 4),
                new Product("Samsung 4K Monitor", "Màn hình 27 inch 4K", new BigDecimal("5500000"), new BigDecimal("7000000"), 9)
            };

            for (Product product : sampleProducts) {
                productRepository.save(product);
            }
            System.out.println("Created " + sampleProducts.length + " sample products");
        }
    }

    private void createUserIfNotExists(String username, String email, String fullName, String password, User.Role role) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            userRepository.save(user);
            System.out.println("Created user: " + username + " (" + fullName + ")");
        }
    }
} 