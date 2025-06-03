package com.webthanhtoan.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.webthanhtoan.backend")
public class WebThanhToanApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebThanhToanApplication.class, args);
    }
} 