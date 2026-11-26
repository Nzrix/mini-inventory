package com.inventory.system.controller;

import com.inventory.system.dto.StockTransactionDTO;
import com.inventory.system.service.StockTransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-transactions")
public class StockTransactionController {
    
    @Autowired
    private StockTransactionService transactionService;
    
    @PostMapping
    public ResponseEntity<StockTransactionDTO> createTransaction(@Valid @RequestBody StockTransactionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createTransaction(dto));
    }

    @GetMapping
    public ResponseEntity<Page<StockTransactionDTO>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getAllTransactions(pageable));
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<StockTransactionDTO>> getTransactionsByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getTransactionsByProduct(productId, pageable));
    }
    
    @GetMapping("/product/{productId}/current-stock")
    public ResponseEntity<Integer> getCurrentStock(@PathVariable Long productId) {
        return ResponseEntity.ok(transactionService.getCurrentStock(productId));
    }
}
