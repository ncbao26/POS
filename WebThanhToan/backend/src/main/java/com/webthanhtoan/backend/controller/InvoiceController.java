package com.webthanhtoan.backend.controller;

import com.webthanhtoan.backend.dto.CreateInvoiceRequest;
import com.webthanhtoan.backend.entity.Invoice;
import com.webthanhtoan.backend.entity.InvoiceItem;
import com.webthanhtoan.backend.entity.Product;
import com.webthanhtoan.backend.entity.Customer;
import com.webthanhtoan.backend.entity.User;
import com.webthanhtoan.backend.repository.InvoiceRepository;
import com.webthanhtoan.backend.repository.InvoiceItemRepository;
import com.webthanhtoan.backend.repository.ProductRepository;
import com.webthanhtoan.backend.repository.CustomerRepository;
import com.webthanhtoan.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600, allowCredentials = "false")
@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllInvoices(Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Invoice> invoices = invoiceRepository.findByUserOrderByCreatedAtDesc(currentUser);
            
            // Convert to DTOs to avoid circular reference
            List<Map<String, Object>> invoiceDTOs = invoices.stream().map(invoice -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", invoice.getId());
                dto.put("invoiceNumber", invoice.getInvoiceNumber());
                dto.put("subtotal", invoice.getSubtotal());
                dto.put("discountAmount", invoice.getDiscountAmount());
                dto.put("discountPercentage", invoice.getDiscountPercentage());
                dto.put("totalAmount", invoice.getTotalAmount());
                dto.put("paymentMethod", invoice.getPaymentMethod());
                dto.put("paymentStatus", invoice.getPaymentStatus());
                dto.put("notes", invoice.getNotes());
                dto.put("createdAt", invoice.getCreatedAt());
                dto.put("updatedAt", invoice.getUpdatedAt());
                
                // Add customer info if exists
                if (invoice.getCustomer() != null) {
                    Map<String, Object> customerDto = new HashMap<>();
                    customerDto.put("id", invoice.getCustomer().getId());
                    customerDto.put("name", invoice.getCustomer().getName());
                    customerDto.put("phone", invoice.getCustomer().getPhone());
                    customerDto.put("email", invoice.getCustomer().getEmail());
                    customerDto.put("address", invoice.getCustomer().getAddress());
                    dto.put("customer", customerDto);
                }
                
                return dto;
            }).toList();
            
            return ResponseEntity.ok(invoiceDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error loading invoices: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Long id, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            Optional<Invoice> invoiceOpt = invoiceRepository.findById(id);
            
            if (invoiceOpt.isPresent()) {
                Invoice invoice = invoiceOpt.get();
                
                // Check if invoice belongs to current user
                if (!invoice.getUser().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(403).body("Access denied");
                }
                
                // Load invoice items explicitly
                List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);
                
                // Convert to DTO
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", invoice.getId());
                dto.put("invoiceNumber", invoice.getInvoiceNumber());
                dto.put("subtotal", invoice.getSubtotal());
                dto.put("discountAmount", invoice.getDiscountAmount());
                dto.put("discountPercentage", invoice.getDiscountPercentage());
                dto.put("totalAmount", invoice.getTotalAmount());
                dto.put("paymentMethod", invoice.getPaymentMethod());
                dto.put("paymentStatus", invoice.getPaymentStatus());
                dto.put("notes", invoice.getNotes());
                dto.put("createdAt", invoice.getCreatedAt());
                dto.put("updatedAt", invoice.getUpdatedAt());
                
                // Add customer info if exists
                if (invoice.getCustomer() != null) {
                    Map<String, Object> customerDto = new HashMap<>();
                    customerDto.put("id", invoice.getCustomer().getId());
                    customerDto.put("name", invoice.getCustomer().getName());
                    customerDto.put("phone", invoice.getCustomer().getPhone());
                    customerDto.put("email", invoice.getCustomer().getEmail());
                    customerDto.put("address", invoice.getCustomer().getAddress());
                    dto.put("customer", customerDto);
                }
                
                // Add items
                List<Map<String, Object>> itemDTOs = items.stream().map(item -> {
                    Map<String, Object> itemDto = new HashMap<>();
                    itemDto.put("id", item.getId());
                    itemDto.put("quantity", item.getQuantity());
                    itemDto.put("unitPrice", item.getUnitPrice());
                    itemDto.put("costPrice", item.getCostPrice());
                    itemDto.put("discountAmount", item.getDiscountAmount());
                    itemDto.put("discountPercentage", item.getDiscountPercentage());
                    itemDto.put("totalPrice", item.getTotalPrice());
                    
                    // Add product info
                    if (item.getProduct() != null) {
                        Map<String, Object> productDto = new HashMap<>();
                        productDto.put("id", item.getProduct().getId());
                        productDto.put("name", item.getProduct().getName());
                        productDto.put("description", item.getProduct().getDescription());
                        productDto.put("price", item.getProduct().getPrice());
                        productDto.put("costPrice", item.getProduct().getCostPrice());
                        productDto.put("stock", item.getProduct().getStock());
                        itemDto.put("product", productDto);
                    }
                    
                    return itemDto;
                }).toList();
                
                dto.put("items", itemDTOs);
                
                return ResponseEntity.ok(dto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error loading invoice: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@Valid @RequestBody CreateInvoiceRequest request, Authentication authentication) {
        try {
            // Get current user
            User currentUser = (User) authentication.getPrincipal();
            
            // Get customer if provided
            Customer customer = null;
            if (request.getCustomerId() != null) {
                customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            }

            // Generate invoice number
            String invoiceNumber = generateInvoiceNumber();

            // Create invoice
            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(invoiceNumber);
            invoice.setCustomer(customer);
            invoice.setUser(currentUser);
            invoice.setPaymentMethod(request.getPaymentMethod().toUpperCase());
            invoice.setPaymentStatus("PAID");
            invoice.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
            invoice.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO);
            invoice.setNotes(request.getNotes());

            BigDecimal subtotal = BigDecimal.ZERO;

            // Save invoice first to get ID
            invoice = invoiceRepository.save(invoice);

            // Process invoice items
            for (CreateInvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

                // Check stock
                if (product.getStock() < itemRequest.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                // Create invoice item
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(invoice);
                item.setProduct(product);
                item.setQuantity(itemRequest.getQuantity());
                item.setUnitPrice(product.getPrice());
                item.setCostPrice(product.getCostPrice());
                item.setDiscountAmount(itemRequest.getDiscountAmount() != null ? itemRequest.getDiscountAmount() : BigDecimal.ZERO);
                item.setDiscountPercentage(itemRequest.getDiscountPercentage() != null ? itemRequest.getDiscountPercentage() : BigDecimal.ZERO);

                // Calculate total price for this item
                BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
                itemTotal = itemTotal.subtract(item.getDiscountAmount());
                if (item.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal percentageDiscount = itemTotal.multiply(item.getDiscountPercentage()).divide(new BigDecimal(100));
                    itemTotal = itemTotal.subtract(percentageDiscount);
                }
                item.setTotalPrice(itemTotal);

                invoiceItemRepository.save(item);

                // Update product stock
                product.setStock(product.getStock() - itemRequest.getQuantity());
                productRepository.save(product);

                subtotal = subtotal.add(itemTotal);
            }

            // Calculate final total
            invoice.setSubtotal(subtotal);
            BigDecimal totalAmount = subtotal.subtract(invoice.getDiscountAmount());
            if (invoice.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentageDiscount = totalAmount.multiply(invoice.getDiscountPercentage()).divide(new BigDecimal(100));
                totalAmount = totalAmount.subtract(percentageDiscount);
            }
            invoice.setTotalAmount(totalAmount);

            // Save final invoice
            invoice = invoiceRepository.save(invoice);

            // Convert to DTO to avoid circular reference
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", invoice.getId());
            dto.put("invoiceNumber", invoice.getInvoiceNumber());
            dto.put("subtotal", invoice.getSubtotal());
            dto.put("discountAmount", invoice.getDiscountAmount());
            dto.put("discountPercentage", invoice.getDiscountPercentage());
            dto.put("totalAmount", invoice.getTotalAmount());
            dto.put("paymentMethod", invoice.getPaymentMethod());
            dto.put("paymentStatus", invoice.getPaymentStatus());
            dto.put("notes", invoice.getNotes());
            dto.put("createdAt", invoice.getCreatedAt());
            dto.put("updatedAt", invoice.getUpdatedAt());
            
            // Add customer info if exists
            if (invoice.getCustomer() != null) {
                Map<String, Object> customerDto = new HashMap<>();
                customerDto.put("id", invoice.getCustomer().getId());
                customerDto.put("name", invoice.getCustomer().getName());
                customerDto.put("phone", invoice.getCustomer().getPhone());
                customerDto.put("email", invoice.getCustomer().getEmail());
                customerDto.put("address", invoice.getCustomer().getAddress());
                dto.put("customer", customerDto);
            }

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating invoice: " + e.getMessage());
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<?> getInvoicesByFilter(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Invoice> invoices;
            
            // If both dates and status are provided
            if (startDate != null && endDate != null && status != null && !status.isEmpty()) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
                invoices = invoiceRepository.findByUserAndCreatedAtBetweenAndPaymentStatusOrderByCreatedAtDesc(currentUser, startDateTime, endDateTime, status);
            }
            // If only dates are provided
            else if (startDate != null && endDate != null) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
                invoices = invoiceRepository.findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(currentUser, startDateTime, endDateTime);
            }
            // If only status is provided
            else if (status != null && !status.isEmpty()) {
                invoices = invoiceRepository.findByUserAndPaymentStatusOrderByCreatedAtDesc(currentUser, status);
            }
            // If no filters, return all for current user
            else {
                invoices = invoiceRepository.findByUserOrderByCreatedAtDesc(currentUser);
            }
            
            // Convert to DTOs to avoid circular reference
            List<Map<String, Object>> invoiceDTOs = invoices.stream().map(invoice -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", invoice.getId());
                dto.put("invoiceNumber", invoice.getInvoiceNumber());
                dto.put("subtotal", invoice.getSubtotal());
                dto.put("discountAmount", invoice.getDiscountAmount());
                dto.put("discountPercentage", invoice.getDiscountPercentage());
                dto.put("totalAmount", invoice.getTotalAmount());
                dto.put("paymentMethod", invoice.getPaymentMethod());
                dto.put("paymentStatus", invoice.getPaymentStatus());
                dto.put("notes", invoice.getNotes());
                dto.put("createdAt", invoice.getCreatedAt());
                dto.put("updatedAt", invoice.getUpdatedAt());
                
                // Add customer info if exists
                if (invoice.getCustomer() != null) {
                    Map<String, Object> customerDto = new HashMap<>();
                    customerDto.put("id", invoice.getCustomer().getId());
                    customerDto.put("name", invoice.getCustomer().getName());
                    customerDto.put("phone", invoice.getCustomer().getPhone());
                    customerDto.put("email", invoice.getCustomer().getEmail());
                    customerDto.put("address", invoice.getCustomer().getAddress());
                    dto.put("customer", customerDto);
                }
                
                return dto;
            }).toList();
            
            return ResponseEntity.ok(invoiceDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error filtering invoices: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Invoice controller is working!");
    }

    @GetMapping("/test-auth")
    public ResponseEntity<String> testAuthEndpoint(Authentication authentication) {
        if (authentication != null) {
            return ResponseEntity.ok("Authentication working! User: " + authentication.getName());
        } else {
            return ResponseEntity.ok("No authentication found");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvoice(@PathVariable Long id, @Valid @RequestBody CreateInvoiceRequest request, Authentication authentication) {
        try {
            // Get current user
            User currentUser = (User) authentication.getPrincipal();
            
            // Find existing invoice
            Invoice existingInvoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

            // Get customer if provided
            Customer customer = null;
            if (request.getCustomerId() != null) {
                customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            }

            // Restore stock from existing invoice items before updating
            List<InvoiceItem> existingItems = invoiceItemRepository.findByInvoiceId(id);
            for (InvoiceItem item : existingItems) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }

            // Delete existing invoice items
            invoiceItemRepository.deleteByInvoiceId(id);

            // Update invoice basic info
            existingInvoice.setCustomer(customer);
            existingInvoice.setPaymentMethod(request.getPaymentMethod().toUpperCase());
            existingInvoice.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
            existingInvoice.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO);
            existingInvoice.setNotes(request.getNotes());
            existingInvoice.setUpdatedAt(LocalDateTime.now());

            BigDecimal subtotal = BigDecimal.ZERO;

            // Process new invoice items
            for (CreateInvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

                // Check stock
                if (product.getStock() < itemRequest.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                // Create new invoice item
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(existingInvoice);
                item.setProduct(product);
                item.setQuantity(itemRequest.getQuantity());
                item.setUnitPrice(product.getPrice());
                item.setCostPrice(product.getCostPrice());
                item.setDiscountAmount(itemRequest.getDiscountAmount() != null ? itemRequest.getDiscountAmount() : BigDecimal.ZERO);
                item.setDiscountPercentage(itemRequest.getDiscountPercentage() != null ? itemRequest.getDiscountPercentage() : BigDecimal.ZERO);

                // Calculate total price for this item
                BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
                itemTotal = itemTotal.subtract(item.getDiscountAmount());
                if (item.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal percentageDiscount = itemTotal.multiply(item.getDiscountPercentage()).divide(new BigDecimal(100));
                    itemTotal = itemTotal.subtract(percentageDiscount);
                }
                item.setTotalPrice(itemTotal);

                invoiceItemRepository.save(item);

                // Update product stock
                product.setStock(product.getStock() - itemRequest.getQuantity());
                productRepository.save(product);

                subtotal = subtotal.add(itemTotal);
            }

            // Calculate final total
            existingInvoice.setSubtotal(subtotal);
            BigDecimal totalAmount = subtotal.subtract(existingInvoice.getDiscountAmount());
            if (existingInvoice.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentageDiscount = totalAmount.multiply(existingInvoice.getDiscountPercentage()).divide(new BigDecimal(100));
                totalAmount = totalAmount.subtract(percentageDiscount);
            }
            existingInvoice.setTotalAmount(totalAmount);

            // Save updated invoice
            existingInvoice = invoiceRepository.save(existingInvoice);

            // Convert to DTO to avoid circular reference
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", existingInvoice.getId());
            dto.put("invoiceNumber", existingInvoice.getInvoiceNumber());
            dto.put("subtotal", existingInvoice.getSubtotal());
            dto.put("discountAmount", existingInvoice.getDiscountAmount());
            dto.put("discountPercentage", existingInvoice.getDiscountPercentage());
            dto.put("totalAmount", existingInvoice.getTotalAmount());
            dto.put("paymentMethod", existingInvoice.getPaymentMethod());
            dto.put("paymentStatus", existingInvoice.getPaymentStatus());
            dto.put("notes", existingInvoice.getNotes());
            dto.put("createdAt", existingInvoice.getCreatedAt());
            dto.put("updatedAt", existingInvoice.getUpdatedAt());
            
            // Add customer info if exists
            if (existingInvoice.getCustomer() != null) {
                Map<String, Object> customerDto = new HashMap<>();
                customerDto.put("id", existingInvoice.getCustomer().getId());
                customerDto.put("name", existingInvoice.getCustomer().getName());
                customerDto.put("phone", existingInvoice.getCustomer().getPhone());
                customerDto.put("email", existingInvoice.getCustomer().getEmail());
                customerDto.put("address", existingInvoice.getCustomer().getAddress());
                dto.put("customer", customerDto);
            }

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating invoice: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id, Authentication authentication) {
        try {
            // Find existing invoice
            Invoice existingInvoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

            // Restore stock from invoice items
            List<InvoiceItem> existingItems = invoiceItemRepository.findByInvoiceId(id);
            for (InvoiceItem item : existingItems) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }

            // Delete invoice items first
            invoiceItemRepository.deleteByInvoiceId(id);
            
            // Delete invoice
            invoiceRepository.delete(existingInvoice);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting invoice: " + e.getMessage());
        }
    }

    @GetMapping("/revenue-by-date")
    public ResponseEntity<?> getRevenueByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Convert LocalDate to LocalDateTime for database query
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            
            // Get all invoices in the date range for current user
            List<Invoice> invoices = invoiceRepository.findByUserAndCreatedAtBetweenOrderByCreatedAtAsc(
                currentUser, startDateTime, endDateTime);
            
            // Group invoices by date and calculate daily revenue
            Map<LocalDate, BigDecimal> dailyRevenue = new HashMap<>();
            
            for (Invoice invoice : invoices) {
                LocalDate invoiceDate = invoice.getCreatedAt().toLocalDate();
                BigDecimal currentRevenue = dailyRevenue.getOrDefault(invoiceDate, BigDecimal.ZERO);
                dailyRevenue.put(invoiceDate, currentRevenue.add(invoice.getTotalAmount()));
            }
            
            // Convert to list of DTOs
            List<Map<String, Object>> revenueData = dailyRevenue.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("date", entry.getKey().toString());
                    dto.put("revenue", entry.getValue());
                    return dto;
                })
                .sorted((a, b) -> ((String) a.get("date")).compareTo((String) b.get("date")))
                .toList();
            
            return ResponseEntity.ok(revenueData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error loading revenue data: " + e.getMessage());
        }
    }

    @GetMapping("/revenue-summary")
    public ResponseEntity<?> getRevenueSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            LocalDate targetDate = date != null ? date : LocalDate.now();
            
            // Today's revenue
            LocalDateTime startOfDay = targetDate.atStartOfDay();
            LocalDateTime endOfDay = targetDate.atTime(LocalTime.MAX);
            
            List<Invoice> todayInvoices = invoiceRepository.findByUserAndCreatedAtBetween(
                currentUser, startOfDay, endOfDay);
            BigDecimal todayRevenue = todayInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Yesterday's revenue
            LocalDate yesterday = targetDate.minusDays(1);
            LocalDateTime startOfYesterday = yesterday.atStartOfDay();
            LocalDateTime endOfYesterday = yesterday.atTime(LocalTime.MAX);
            
            List<Invoice> yesterdayInvoices = invoiceRepository.findByUserAndCreatedAtBetween(
                currentUser, startOfYesterday, endOfYesterday);
            BigDecimal yesterdayRevenue = yesterdayInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // This month's revenue
            LocalDate startOfMonth = targetDate.withDayOfMonth(1);
            LocalDate endOfMonth = targetDate.withDayOfMonth(targetDate.lengthOfMonth());
            LocalDateTime startOfMonthDateTime = startOfMonth.atStartOfDay();
            LocalDateTime endOfMonthDateTime = endOfMonth.atTime(LocalTime.MAX);
            
            List<Invoice> thisMonthInvoices = invoiceRepository.findByUserAndCreatedAtBetween(
                currentUser, startOfMonthDateTime, endOfMonthDateTime);
            BigDecimal thisMonthRevenue = thisMonthInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Last month's revenue
            LocalDate lastMonth = targetDate.minusMonths(1);
            LocalDate startOfLastMonth = lastMonth.withDayOfMonth(1);
            LocalDate endOfLastMonth = lastMonth.withDayOfMonth(lastMonth.lengthOfMonth());
            LocalDateTime startOfLastMonthDateTime = startOfLastMonth.atStartOfDay();
            LocalDateTime endOfLastMonthDateTime = endOfLastMonth.atTime(LocalTime.MAX);
            
            List<Invoice> lastMonthInvoices = invoiceRepository.findByUserAndCreatedAtBetween(
                currentUser, startOfLastMonthDateTime, endOfLastMonthDateTime);
            BigDecimal lastMonthRevenue = lastMonthInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate percentages
            double dailyChangePercentage = 0.0;
            if (yesterdayRevenue.compareTo(BigDecimal.ZERO) > 0) {
                dailyChangePercentage = todayRevenue.subtract(yesterdayRevenue)
                    .divide(yesterdayRevenue, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            }
            
            double monthlyChangePercentage = 0.0;
            if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
                monthlyChangePercentage = thisMonthRevenue.subtract(lastMonthRevenue)
                    .divide(lastMonthRevenue, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            }
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("todayRevenue", todayRevenue);
            summary.put("yesterdayRevenue", yesterdayRevenue);
            summary.put("thisMonthRevenue", thisMonthRevenue);
            summary.put("lastMonthRevenue", lastMonthRevenue);
            summary.put("dailyChangePercentage", dailyChangePercentage);
            summary.put("monthlyChangePercentage", monthlyChangePercentage);
            summary.put("date", targetDate.toString());
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error loading revenue summary: " + e.getMessage());
        }
    }

    private String generateInvoiceNumber() {
        String prefix = "INV";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return prefix + "-" + timestamp.substring(timestamp.length() - 6) + "-" + random;
    }
} 