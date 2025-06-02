package com.webthanhtoan.backend.repository;

import com.webthanhtoan.backend.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    List<InvoiceItem> findByInvoiceId(Long invoiceId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM InvoiceItem ii WHERE ii.invoice.id = :invoiceId")
    void deleteByInvoiceId(@Param("invoiceId") Long invoiceId);
    
    @Query("SELECT ii FROM InvoiceItem ii JOIN ii.invoice i WHERE i.paymentStatus = 'PAID' AND i.createdAt BETWEEN :startDate AND :endDate")
    List<InvoiceItem> findPaidItemsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
} 