package com.inventory.system.dto;

import com.inventory.system.model.StockTransaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockTransactionDTO {
    private Long id;
    
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    @NotNull(message = "Transaction type is required")
    private StockTransaction.TransactionType type;
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    private Integer balanceAfter;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private Long userId;
    private String userName;
    private String productName;
    private String productSku;
    private LocalDateTime createdAt;
}
