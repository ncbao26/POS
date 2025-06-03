package com.webthanhtoan.backend.repository;

import com.webthanhtoan.backend.entity.Product;
import com.webthanhtoan.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();
    
    // Methods with user filter
    List<Product> findByUserAndIsActiveTrue(User user);
    
    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.isActive = true AND p.name LIKE %:name%")
    List<Product> findByUserAndNameContainingAndIsActiveTrue(@Param("user") User user, @Param("name") String name);
    
    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.isActive = true AND p.stock <= :threshold")
    List<Product> findLowStockProductsByUser(@Param("user") User user, @Param("threshold") Integer threshold);
    
    // Legacy methods (for backward compatibility)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.name LIKE %:name%")
    List<Product> findByNameContainingAndIsActiveTrue(@Param("name") String name);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stock <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
} 