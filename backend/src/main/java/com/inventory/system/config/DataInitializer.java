package com.inventory.system.config;

import com.inventory.system.model.*;
import com.inventory.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private StockTransactionRepository transactionRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }
        
        // Create users
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("password123"));
        admin.setFullName("Administrator");
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
        
        User staff = new User();
        staff.setUsername("staff");
        staff.setPassword(passwordEncoder.encode("password123"));
        staff.setFullName("Staff User");
        staff.setRole(Role.STAFF);
        staff.setActive(true);
        userRepository.save(staff);
        
        // Create categories
        Category electronics = createCategory("Electronics", "Electronic devices and accessories");
        Category stationery = createCategory("Stationery", "Office and school supplies");
        Category beverages = createCategory("Beverages", "Drinks and beverages");
        Category snacks = createCategory("Snacks", "Snacks and confectionery");
        Category household = createCategory("Household", "Household items and supplies");
        
        // Create products
        Product p1 = createProduct("ELEC-001", "USB Cable Type-C", "High quality Type-C USB cable 1m", "piece", 
                                   50.00, 99.00, 10, electronics);
        Product p2 = createProduct("ELEC-002", "Wireless Mouse", "Ergonomic wireless mouse", "piece",
                                   150.00, 299.00, 5, electronics);
        Product p3 = createProduct("STAT-001", "A4 Paper", "White A4 copy paper 500 sheets", "ream",
                                   80.00, 120.00, 20, stationery);
        Product p4 = createProduct("STAT-002", "Blue Pen", "Ballpoint pen blue ink", "piece",
                                   5.00, 15.00, 50, stationery);
        Product p5 = createProduct("BEV-001", "Mineral Water 500ml", "Pure mineral water", "bottle",
                                   5.00, 10.00, 100, beverages);
        Product p6 = createProduct("BEV-002", "Green Tea", "Japanese green tea 350ml", "bottle",
                                   10.00, 25.00, 50, beverages);
        Product p7 = createProduct("SNACK-001", "Potato Chips", "Crispy potato chips 100g", "pack",
                                   15.00, 35.00, 30, snacks);
        Product p8 = createProduct("SNACK-002", "Chocolate Bar", "Milk chocolate bar 50g", "piece",
                                   10.00, 25.00, 40, snacks);
        Product p9 = createProduct("HOUSE-001", "Dish Soap", "Liquid dish washing soap 500ml", "bottle",
                                   20.00, 45.00, 15, household);
        Product p10 = createProduct("HOUSE-002", "Trash Bags", "Large trash bags 10 pieces", "pack",
                                    25.00, 55.00, 20, household);
        
        // Create initial stock transactions
        createTransaction(p1, StockTransaction.TransactionType.IN, 50, "Initial stock", admin);
        createTransaction(p2, StockTransaction.TransactionType.IN, 30, "Initial stock", admin);
        createTransaction(p3, StockTransaction.TransactionType.IN, 100, "Initial stock", admin);
        createTransaction(p4, StockTransaction.TransactionType.IN, 200, "Initial stock", admin);
        createTransaction(p5, StockTransaction.TransactionType.IN, 500, "Initial stock", admin);
        createTransaction(p6, StockTransaction.TransactionType.IN, 200, "Initial stock", admin);
        createTransaction(p7, StockTransaction.TransactionType.IN, 150, "Initial stock", admin);
        createTransaction(p8, StockTransaction.TransactionType.IN, 180, "Initial stock", admin);
        createTransaction(p9, StockTransaction.TransactionType.IN, 80, "Initial stock", admin);
        createTransaction(p10, StockTransaction.TransactionType.IN, 100, "Initial stock", admin);
        
        // Create some movement for the last 30 days
        createTransaction(p5, StockTransaction.TransactionType.OUT, 100, "Sales", staff);
        createTransaction(p7, StockTransaction.TransactionType.OUT, 50, "Sales", staff);
        createTransaction(p4, StockTransaction.TransactionType.OUT, 80, "Sales", staff);
        createTransaction(p6, StockTransaction.TransactionType.OUT, 70, "Sales", staff);
        createTransaction(p8, StockTransaction.TransactionType.OUT, 60, "Sales", staff);
        
        System.out.println("✅ Sample data initialized successfully!");
    }
    
    private Category createCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }
    
    private Product createProduct(String sku, String name, String description, String unit,
                                 double costPrice, double sellingPrice, int minStock, Category category) {
        Product product = new Product();
        product.setSku(sku);
        product.setName(name);
        product.setDescription(description);
        product.setUnit(unit);
        product.setCostPrice(BigDecimal.valueOf(costPrice));
        product.setSellingPrice(BigDecimal.valueOf(sellingPrice));
        product.setMinimumStock(minStock);
        product.setCategory(category);
        return productRepository.save(product);
    }
    
    private void createTransaction(Product product, StockTransaction.TransactionType type,
                                  int quantity, String reason, User user) {
        int currentStock = transactionRepository.calculateCurrentStock(product.getId());
        int newBalance = currentStock;
        
        switch (type) {
            case IN:
                newBalance = currentStock + quantity;
                break;
            case OUT:
                newBalance = currentStock - quantity;
                break;
            case ADJUSTMENT:
                newBalance = currentStock + quantity;
                break;
        }
        
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setBalanceAfter(newBalance);
        transaction.setReason(reason);
        transaction.setUser(user);
        transactionRepository.save(transaction);
    }
}
