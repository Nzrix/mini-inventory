package com.inventory.system.service;

import com.inventory.system.dto.StockTransactionDTO;
import com.inventory.system.exception.BadRequestException;
import com.inventory.system.model.*;
import com.inventory.system.repository.ProductRepository;
import com.inventory.system.repository.StockTransactionRepository;
import com.inventory.system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockTransactionServiceTest {
    
    @Mock
    private StockTransactionRepository transactionRepository;
    
    @Mock
    private ProductRepository productRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private StockTransactionService stockTransactionService;
    
    private Product product;
    private User user;
    private Category category;
    
    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Electronics");
        
        product = new Product();
        product.setId(1L);
        product.setSku("TEST-001");
        product.setName("Test Product");
        product.setUnit("piece");
        product.setCostPrice(BigDecimal.valueOf(100));
        product.setSellingPrice(BigDecimal.valueOf(150));
        product.setMinimumStock(10);
        product.setCategory(category);
        
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setFullName("Test User");
        user.setRole(Role.ADMIN);
        
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("testuser");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }
    
    @Test
    void testStockIn_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(transactionRepository.calculateCurrentStock(1L)).thenReturn(50);
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(invocation -> {
            StockTransaction transaction = invocation.getArgument(0);
            transaction.setId(1L);
            return transaction;
        });
        
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(1L);
        dto.setType(StockTransaction.TransactionType.IN);
        dto.setQuantity(20);
        dto.setReason("New stock arrival");
        
        StockTransactionDTO result = stockTransactionService.createTransaction(dto);
        
        assertNotNull(result);
        assertEquals(70, result.getBalanceAfter());
        verify(transactionRepository, times(1)).save(any(StockTransaction.class));
    }
    
    @Test
    void testStockOut_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(transactionRepository.calculateCurrentStock(1L)).thenReturn(50);
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(invocation -> {
            StockTransaction transaction = invocation.getArgument(0);
            transaction.setId(1L);
            return transaction;
        });
        
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(1L);
        dto.setType(StockTransaction.TransactionType.OUT);
        dto.setQuantity(20);
        dto.setReason("Sales");
        
        StockTransactionDTO result = stockTransactionService.createTransaction(dto);
        
        assertNotNull(result);
        assertEquals(30, result.getBalanceAfter());
        verify(transactionRepository, times(1)).save(any(StockTransaction.class));
    }
    
    @Test
    void testStockOut_InsufficientStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(transactionRepository.calculateCurrentStock(1L)).thenReturn(10);
        
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(1L);
        dto.setType(StockTransaction.TransactionType.OUT);
        dto.setQuantity(20);
        dto.setReason("Sales");
        
        assertThrows(BadRequestException.class, () -> stockTransactionService.createTransaction(dto));
        verify(transactionRepository, never()).save(any(StockTransaction.class));
    }
    
    @Test
    void testAdjustment_Positive() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(transactionRepository.calculateCurrentStock(1L)).thenReturn(50);
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(invocation -> {
            StockTransaction transaction = invocation.getArgument(0);
            transaction.setId(1L);
            return transaction;
        });
        
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(1L);
        dto.setType(StockTransaction.TransactionType.ADJUSTMENT);
        dto.setQuantity(5);
        dto.setReason("Inventory recount - found extra items");
        
        StockTransactionDTO result = stockTransactionService.createTransaction(dto);
        
        assertNotNull(result);
        assertEquals(55, result.getBalanceAfter());
    }
    
    @Test
    void testAdjustment_Negative() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(transactionRepository.calculateCurrentStock(1L)).thenReturn(50);
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(invocation -> {
            StockTransaction transaction = invocation.getArgument(0);
            transaction.setId(1L);
            return transaction;
        });
        
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(1L);
        dto.setType(StockTransaction.TransactionType.ADJUSTMENT);
        dto.setQuantity(-10);
        dto.setReason("Inventory recount - damaged items");
        
        StockTransactionDTO result = stockTransactionService.createTransaction(dto);
        
        assertNotNull(result);
        assertEquals(40, result.getBalanceAfter());
    }
    
    @Test
    void testAdjustment_CannotBeNegative() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(transactionRepository.calculateCurrentStock(1L)).thenReturn(10);
        
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(1L);
        dto.setType(StockTransaction.TransactionType.ADJUSTMENT);
        dto.setQuantity(-15);
        dto.setReason("Adjustment");
        
        assertThrows(BadRequestException.class, () -> stockTransactionService.createTransaction(dto));
    }
}
