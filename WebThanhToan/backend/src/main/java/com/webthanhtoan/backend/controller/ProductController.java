package com.webthanhtoan.backend.controller;

import com.webthanhtoan.backend.entity.Product;
import com.webthanhtoan.backend.entity.User;
import com.webthanhtoan.backend.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@CrossOrigin(origins = "*", maxAge = 3600, allowCredentials = "false")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getAllProducts(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body("No authentication found");
            }
            
            User currentUser = (User) authentication.getPrincipal();
            System.out.println("Getting products for user: " + currentUser.getUsername() + " (ID: " + currentUser.getId() + ")");
            
            List<Product> products = productRepository.findByUserAndIsActiveTrue(currentUser);
            System.out.println("Found " + products.size() + " products for user " + currentUser.getUsername());
            
            // Convert to DTOs to avoid circular reference and lazy loading issues
            List<Map<String, Object>> productDTOs = products.stream().map(p -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", p.getId());
                dto.put("name", p.getName());
                dto.put("description", p.getDescription());
                dto.put("costPrice", p.getCostPrice());
                dto.put("price", p.getPrice());
                dto.put("stock", p.getStock());
                dto.put("isActive", p.getIsActive());
                dto.put("createdAt", p.getCreatedAt());
                dto.put("updatedAt", p.getUpdatedAt());
                return dto;
            }).toList();
            
            return ResponseEntity.ok(productDTOs);
        } catch (Exception e) {
            System.err.println("Error in getAllProducts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting products: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            Optional<Product> productOpt = productRepository.findById(id);
            
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                
                // Check if product belongs to current user
                if (!product.getUser().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(403).body("Access denied");
                }
                
                // Convert to DTO
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", product.getId());
                dto.put("name", product.getName());
                dto.put("description", product.getDescription());
                dto.put("costPrice", product.getCostPrice());
                dto.put("price", product.getPrice());
                dto.put("stock", product.getStock());
                dto.put("isActive", product.getIsActive());
                dto.put("createdAt", product.getCreatedAt());
                dto.put("updatedAt", product.getUpdatedAt());
                
                return ResponseEntity.ok(dto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting product: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String name, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Product> products = productRepository.findByUserAndNameContainingAndIsActiveTrue(currentUser, name);
            
            // Convert to DTOs to avoid circular reference
            List<Map<String, Object>> productDTOs = products.stream().map(p -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", p.getId());
                dto.put("name", p.getName());
                dto.put("description", p.getDescription());
                dto.put("costPrice", p.getCostPrice());
                dto.put("price", p.getPrice());
                dto.put("stock", p.getStock());
                dto.put("isActive", p.getIsActive());
                dto.put("createdAt", p.getCreatedAt());
                dto.put("updatedAt", p.getUpdatedAt());
                return dto;
            }).toList();
            
            return ResponseEntity.ok(productDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error searching products: " + e.getMessage());
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockProducts(@RequestParam(defaultValue = "10") Integer threshold, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Product> products = productRepository.findLowStockProductsByUser(currentUser, threshold);
            
            // Convert to DTOs to avoid circular reference
            List<Map<String, Object>> productDTOs = products.stream().map(p -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", p.getId());
                dto.put("name", p.getName());
                dto.put("description", p.getDescription());
                dto.put("costPrice", p.getCostPrice());
                dto.put("price", p.getPrice());
                dto.put("stock", p.getStock());
                dto.put("isActive", p.getIsActive());
                dto.put("createdAt", p.getCreatedAt());
                dto.put("updatedAt", p.getUpdatedAt());
                return dto;
            }).toList();
            
            return ResponseEntity.ok(productDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting low stock products: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody Product product, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            product.setUser(currentUser);
            Product savedProduct = productRepository.save(product);
            
            // Convert to DTO
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", savedProduct.getId());
            dto.put("name", savedProduct.getName());
            dto.put("description", savedProduct.getDescription());
            dto.put("costPrice", savedProduct.getCostPrice());
            dto.put("price", savedProduct.getPrice());
            dto.put("stock", savedProduct.getStock());
            dto.put("isActive", savedProduct.getIsActive());
            dto.put("createdAt", savedProduct.getCreatedAt());
            dto.put("updatedAt", savedProduct.getUpdatedAt());
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody Product productDetails, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            Optional<Product> productOpt = productRepository.findById(id);
            
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                
                // Check if product belongs to current user
                if (!product.getUser().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(403).body("Access denied: Product does not belong to current user");
                }
                
                product.setName(productDetails.getName());
                product.setDescription(productDetails.getDescription());
                product.setCostPrice(productDetails.getCostPrice());
                product.setPrice(productDetails.getPrice());
                product.setStock(productDetails.getStock());
                product.setIsActive(productDetails.getIsActive());
                
                Product updatedProduct = productRepository.save(product);
                
                // Convert to DTO
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", updatedProduct.getId());
                dto.put("name", updatedProduct.getName());
                dto.put("description", updatedProduct.getDescription());
                dto.put("costPrice", updatedProduct.getCostPrice());
                dto.put("price", updatedProduct.getPrice());
                dto.put("stock", updatedProduct.getStock());
                dto.put("isActive", updatedProduct.getIsActive());
                dto.put("createdAt", updatedProduct.getCreatedAt());
                dto.put("updatedAt", updatedProduct.getUpdatedAt());
                
                return ResponseEntity.ok(dto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            Optional<Product> productOpt = productRepository.findById(id);
            
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                
                // Check if product belongs to current user
                if (!product.getUser().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(403).body("Access denied: Product does not belong to current user");
                }
                
                product.setIsActive(false);
                productRepository.save(product);
                
                return ResponseEntity.ok().body("Product deleted successfully");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting product: " + e.getMessage());
        }
    }
} 