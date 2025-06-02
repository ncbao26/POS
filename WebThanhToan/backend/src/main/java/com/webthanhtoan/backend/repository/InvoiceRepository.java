package com.webthanhtoan.backend.repository;

import com.webthanhtoan.backend.entity.Invoice;
import com.webthanhtoan.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    // Methods with user filter
    List<Invoice> findByUserOrderByCreatedAtDesc(User user);
    
    List<Invoice> findByUserAndPaymentStatusOrderByCreatedAtDesc(User user, String paymentStatus);
    
    List<Invoice> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    // New methods for revenue chart
    List<Invoice> findByUserAndCreatedAtBetweenOrderByCreatedAtAsc(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    List<Invoice> findByUserAndCreatedAtBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    List<Invoice> findByUserAndCreatedAtBetweenAndPaymentStatusOrderByCreatedAtDesc(User user, LocalDateTime startDate, LocalDateTime endDate, String paymentStatus);
    
    // Legacy methods (for backward compatibility)
    List<Invoice> findByOrderByCreatedAtDesc();
    
    @Query("SELECT i FROM Invoice i WHERE i.createdAt BETWEEN :startDate AND :endDate ORDER BY i.createdAt DESC")
    List<Invoice> findByCreatedAtBetweenOrderByCreatedAtDesc(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT i FROM Invoice i WHERE i.paymentStatus = :status ORDER BY i.createdAt DESC")
    List<Invoice> findByPaymentStatusOrderByCreatedAtDesc(@Param("status") String status);
    
    @Query("SELECT i FROM Invoice i WHERE i.createdAt BETWEEN :startDate AND :endDate AND i.paymentStatus = :status ORDER BY i.createdAt DESC")
    List<Invoice> findByCreatedAtBetweenAndPaymentStatusOrderByCreatedAtDesc(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("status") String status);
    
    boolean existsByInvoiceNumber(String invoiceNumber);
} 