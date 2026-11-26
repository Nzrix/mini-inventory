package com.inventory.system.service;

import com.inventory.system.dto.ProductDTO;
import com.inventory.system.exception.BadRequestException;
import com.inventory.system.exception.ResourceNotFoundException;
import com.inventory.system.model.Category;
import com.inventory.system.model.Product;
import com.inventory.system.repository.CategoryRepository;
import com.inventory.system.repository.ProductRepository;
import com.inventory.system.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private StockTransactionRepository stockTransactionRepository;
    
    public Page<ProductDTO> searchProducts(String search, Long categoryId, Pageable pageable) {
        return productRepository.searchProducts(search, categoryId, pageable)
                .map(this::toDTO);
    }
    
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toDTO(product);
    }
    
    public ProductDTO createProduct(ProductDTO dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("Product with SKU '" + dto.getSku() + "' already exists");
        }
        
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));
        
        Product product = new Product();
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setUnit(dto.getUnit());
        product.setCostPrice(dto.getCostPrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setMinimumStock(dto.getMinimumStock());
        product.setCategory(category);
        
        return toDTO(productRepository.save(product));
    }
    
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("Product with SKU '" + dto.getSku() + "' already exists");
        }
        
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));
        
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setUnit(dto.getUnit());
        product.setCostPrice(dto.getCostPrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setMinimumStock(dto.getMinimumStock());
        product.setCategory(category);
        
        return toDTO(productRepository.save(product));
    }
    
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
    
    private ProductDTO toDTO(Product product) {
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
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        
        Integer currentStock = stockTransactionRepository.calculateCurrentStock(product.getId());
        dto.setCurrentStock(currentStock);
        dto.setIsLowStock(currentStock < product.getMinimumStock());
        
        return dto;
    }
}
