package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private Integer totalProducts;
    private Integer lowStockCount;
    private BigDecimal totalStockValue;
    private Integer totalCategories;
    private List<TopProductDTO> topMovingProducts;
    private Map<String, BigDecimal> stockValueByCategory;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductDTO {
        private String productName;
        private String sku;
        private Integer totalMovement;
    }
}
