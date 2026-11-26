package com.inventory.system.service;

import com.inventory.system.dto.StockTransactionDTO;
import com.inventory.system.exception.BadRequestException;
import com.inventory.system.exception.ResourceNotFoundException;
import com.inventory.system.model.Product;
import com.inventory.system.model.StockTransaction;
import com.inventory.system.model.User;
import com.inventory.system.repository.ProductRepository;
import com.inventory.system.repository.StockTransactionRepository;
import com.inventory.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StockTransactionService {
    
    @Autowired
    private StockTransactionRepository transactionRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public StockTransactionDTO createTransaction(StockTransactionDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        Integer currentStock = transactionRepository.calculateCurrentStock(product.getId());
        int newBalance;
        
        switch (dto.getType()) {
            case IN:
                if (dto.getQuantity() <= 0) {
                    throw new BadRequestException("Quantity for stock IN must be positive");
                }
                newBalance = currentStock + dto.getQuantity();
                break;
            case OUT:
                if (dto.getQuantity() <= 0) {
                    throw new BadRequestException("Quantity for stock OUT must be positive");
                }
                if (currentStock < dto.getQuantity()) {
                    throw new BadRequestException("Insufficient stock. Current: " + currentStock + ", Requested: " + dto.getQuantity());
                }
                newBalance = currentStock - dto.getQuantity();
                break;
            case ADJUSTMENT:
                newBalance = currentStock + dto.getQuantity();
                if (newBalance < 0) {
                    throw new BadRequestException("Stock cannot be negative after adjustment. Current: " + currentStock);
                }
                break;
            default:
                throw new BadRequestException("Invalid transaction type");
        }
        
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(dto.getType());
        transaction.setQuantity(dto.getQuantity());
        transaction.setBalanceAfter(newBalance);
        transaction.setReason(dto.getReason());
        transaction.setUser(user);
        
        return toDTO(transactionRepository.save(transaction));
    }
    
    public Page<StockTransactionDTO> getTransactionsByProduct(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return transactionRepository.findByProductIdWithDetails(productId, pageable)
                .map(this::toDTO);
    }
    
    public Integer getCurrentStock(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return transactionRepository.calculateCurrentStock(productId);
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
}
