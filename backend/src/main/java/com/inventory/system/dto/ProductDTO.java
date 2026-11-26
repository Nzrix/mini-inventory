package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductDTO {
    private Long id;
    
    @NotBlank(message = "SKU is required")
    private String sku;
    
    @NotBlank(message = "Product name is required")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Unit is required")
    private String unit;
    
    @NotNull(message = "Cost price is required")
    @PositiveOrZero(message = "Cost price must be positive or zero")
    private BigDecimal costPrice;
    
    @NotNull(message = "Selling price is required")
    @PositiveOrZero(message = "Selling price must be positive or zero")
    private BigDecimal sellingPrice;
    
    @NotNull(message = "Minimum stock is required")
    @PositiveOrZero(message = "Minimum stock must be positive or zero")
    private Integer minimumStock;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private String categoryName;
    private Integer currentStock;
    private Boolean isLowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
