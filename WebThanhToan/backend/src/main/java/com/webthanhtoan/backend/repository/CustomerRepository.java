package com.webthanhtoan.backend.repository;

import com.webthanhtoan.backend.entity.Customer;
import com.webthanhtoan.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByIsActiveTrue();
    
    @Query("SELECT c FROM Customer c WHERE c.isActive = true AND (c.name LIKE %:search% OR c.phone LIKE %:search%)")
    List<Customer> findByNameOrPhoneContainingAndIsActiveTrue(@Param("search") String search);
    
    boolean existsByPhoneAndIsActiveTrue(String phone);

    // Methods with user filter
    List<Customer> findByUser(User user);
    
    @Query("SELECT c FROM Customer c WHERE c.user = :user AND (c.name LIKE %:search% OR c.phone LIKE %:search%)")
    List<Customer> findByUserAndSearch(@Param("user") User user, @Param("search") String search);
    
    // Legacy methods (for backward compatibility)
    @Query("SELECT c FROM Customer c WHERE c.name LIKE %:search% OR c.phone LIKE %:search%")
    List<Customer> findByNameContainingOrPhoneContaining(@Param("search") String search);
} 