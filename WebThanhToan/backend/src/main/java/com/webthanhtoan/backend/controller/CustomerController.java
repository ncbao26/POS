package com.webthanhtoan.backend.controller;

import com.webthanhtoan.backend.entity.Customer;
import com.webthanhtoan.backend.entity.User;
import com.webthanhtoan.backend.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600, allowCredentials = "false")
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<?> getAllCustomers(Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Customer> customers = customerRepository.findByUser(currentUser);
            
            // Convert to DTOs to avoid circular reference
            List<Map<String, Object>> customerDTOs = customers.stream().map(c -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", c.getId());
                dto.put("name", c.getName());
                dto.put("phone", c.getPhone());
                dto.put("email", c.getEmail());
                dto.put("address", c.getAddress());
                dto.put("createdAt", c.getCreatedAt());
                dto.put("updatedAt", c.getUpdatedAt());
                return dto;
            }).toList();
            
            return ResponseEntity.ok(customerDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting customers: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            Optional<Customer> customerOpt = customerRepository.findById(id);
            
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                
                // Check if customer belongs to current user
                if (!customer.getUser().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(403).body("Access denied");
                }
                
                // Convert to DTO
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", customer.getId());
                dto.put("name", customer.getName());
                dto.put("phone", customer.getPhone());
                dto.put("email", customer.getEmail());
                dto.put("address", customer.getAddress());
                dto.put("createdAt", customer.getCreatedAt());
                dto.put("updatedAt", customer.getUpdatedAt());
                
                return ResponseEntity.ok(dto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting customer: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchCustomers(@RequestParam String search, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Customer> customers = customerRepository.findByUserAndSearch(currentUser, search);
            
            // Convert to DTOs to avoid circular reference
            List<Map<String, Object>> customerDTOs = customers.stream().map(c -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", c.getId());
                dto.put("name", c.getName());
                dto.put("phone", c.getPhone());
                dto.put("email", c.getEmail());
                dto.put("address", c.getAddress());
                dto.put("createdAt", c.getCreatedAt());
                dto.put("updatedAt", c.getUpdatedAt());
                return dto;
            }).toList();
            
            return ResponseEntity.ok(customerDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error searching customers: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCustomer(@Valid @RequestBody Customer customer, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            customer.setUser(currentUser);
            Customer savedCustomer = customerRepository.save(customer);
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating customer: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @Valid @RequestBody Customer customerDetails, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            Optional<Customer> customerOpt = customerRepository.findById(id);
            
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                
                // Check if customer belongs to current user
                if (!customer.getUser().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(403).body("Access denied: Customer does not belong to current user");
                }
                
                customer.setName(customerDetails.getName());
                customer.setPhone(customerDetails.getPhone());
                customer.setEmail(customerDetails.getEmail());
                customer.setAddress(customerDetails.getAddress());
                
                Customer updatedCustomer = customerRepository.save(customer);
                return ResponseEntity.ok(updatedCustomer);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating customer: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            Optional<Customer> customerOpt = customerRepository.findById(id);
            
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                
                // Check if customer belongs to current user
                if (!customer.getUser().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(403).body("Access denied: Customer does not belong to current user");
                }
                
                customerRepository.delete(customer);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting customer: " + e.getMessage());
        }
    }
} 