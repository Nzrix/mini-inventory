package com.inventory.system.service;

import com.inventory.system.dto.DashboardDTO;
import com.inventory.system.dto.StockReportDTO;
import com.inventory.system.dto.StockTransactionDTO;
import com.inventory.system.model.Category;
import com.inventory.system.model.Product;
import com.inventory.system.model.StockTransaction;
import com.inventory.system.repository.CategoryRepository;
import com.inventory.system.repository.ProductRepository;
import com.inventory.system.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private StockTransactionRepository transactionRepository;
    
    public List<StockReportDTO> getCurrentStockReport() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(product -> {
            Integer currentStock = transactionRepository.calculateCurrentStock(product.getId());
            BigDecimal stockValue = product.getCostPrice().multiply(BigDecimal.valueOf(currentStock));
            boolean isLowStock = currentStock < product.getMinimumStock();
            
            return new StockReportDTO(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getCategory().getName(),
                currentStock,
                product.getUnit(),
                product.getCostPrice(),
                product.getSellingPrice(),
                stockValue,
                product.getMinimumStock(),
                isLowStock
            );
        }).collect(Collectors.toList());
    }
    
    public List<StockTransactionDTO> getStockMovementReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        List<StockTransaction> transactions = transactionRepository.findByDateRangeWithDetails(start, end);
        return transactions.stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    public List<ProductDTO> getLowStockProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .filter(product -> {
                    Integer currentStock = transactionRepository.calculateCurrentStock(product.getId());
                    return currentStock < product.getMinimumStock();
                })
                .map(this::toProductDTO)
                .collect(Collectors.toList());
    }
    
    public DashboardDTO getDashboardData() {
        List<Product> products = productRepository.findAll();
        List<Category> categories = categoryRepository.findAll();
        
        int totalProducts = products.size();
        int lowStockCount = 0;
        BigDecimal totalStockValue = BigDecimal.ZERO;
        Map<String, BigDecimal> stockValueByCategory = new HashMap<>();
        
        for (Product product : products) {
            Integer currentStock = transactionRepository.calculateCurrentStock(product.getId());
            BigDecimal stockValue = product.getCostPrice().multiply(BigDecimal.valueOf(currentStock));
            totalStockValue = totalStockValue.add(stockValue);
            
            if (currentStock < product.getMinimumStock()) {
                lowStockCount++;
            }
            
            String categoryName = product.getCategory().getName();
            stockValueByCategory.merge(categoryName, stockValue, BigDecimal::add);
        }
        
        List<DashboardDTO.TopProductDTO> topProducts = getTopMovingProducts();
        
        return new DashboardDTO(
            totalProducts,
            lowStockCount,
            totalStockValue,
            categories.size(),
            topProducts,
            stockValueByCategory
        );
    }
    
    private List<DashboardDTO.TopProductDTO> getTopMovingProducts() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();
        
        List<StockTransaction> recentTransactions = transactionRepository.findByDateRangeWithDetails(thirtyDaysAgo, now);
        
        Map<Long, Integer> productMovement = new HashMap<>();
        Map<Long, String> productNames = new HashMap<>();
        Map<Long, String> productSkus = new HashMap<>();
        
        for (StockTransaction transaction : recentTransactions) {
            Long productId = transaction.getProduct().getId();
            int movement = Math.abs(transaction.getQuantity());
            
            productMovement.merge(productId, movement, Integer::sum);
            productNames.putIfAbsent(productId, transaction.getProduct().getName());
            productSkus.putIfAbsent(productId, transaction.getProduct().getSku());
        }
        
        return productMovement.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(5)
                .map(entry -> new DashboardDTO.TopProductDTO(
                    productNames.get(entry.getKey()),
                    productSkus.get(entry.getKey()),
                    entry.getValue()
                ))
                .collect(Collectors.toList());
    }
    
    private StockTransactionDTO toDTO(StockTransaction transaction) {
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setId(transaction.getId());
        dto.setProductId(transaction.getProduct().getId());
        dto.setProductName(transaction.getProduct().getName());
        dto.setProductSku(transaction.getProduct().getSku());
        dto.setType(transaction.getType());
        dto.setQuantity(transaction.getQuantity());
        dto.setBalanceAfter(transaction.getBalanceAfter());
        dto.setReason(transaction.getReason());
        dto.setUserId(transaction.getUser().getId());
        dto.setUserName(transaction.getUser().getFullName());
        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }
    
    private ProductDTO toProductDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setUnit(product.getUnit());
        dto.setCostPrice(product.getCostPrice());
        dto.setSellingPrice(product.getSellingPrice());
        dto.setMinimumStock(product.getMinimumStock());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        
        Integer currentStock = transactionRepository.calculateCurrentStock(product.getId());
        dto.setCurrentStock(currentStock);
        dto.setIsLowStock(currentStock < product.getMinimumStock());
        
        return dto;
    }
    
    private static class ProductDTO extends com.inventory.system.dto.ProductDTO {}
}
