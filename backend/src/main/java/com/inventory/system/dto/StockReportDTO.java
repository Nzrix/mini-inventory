package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class StockReportDTO {
    private Long productId;
    private String sku;
    private String productName;
    private String categoryName;
    private Integer currentStock;
    private String unit;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal stockValue;
    private Integer minimumStock;
    private Boolean isLowStock;
}
